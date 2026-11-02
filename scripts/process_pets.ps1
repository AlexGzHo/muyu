$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Collections.Generic;

public class PetProcessor {
    public static void CropQuadrant(Bitmap src, Rectangle rect, string outPath, bool removeBlackBg) {
        int w = rect.Width;
        int h = rect.Height;
        using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
            // Lock source and dest
            BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int stride = srcData.Stride;
            byte[] srcBytes = new byte[stride * h];
            byte[] dstBytes = new byte[stride * h];

            System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, srcBytes, 0, srcBytes.Length);
            src.UnlockBits(srcData);

            if (removeBlackBg) {
                // BFS flood fill from edges to find external black background
                bool[,] visited = new bool[w, h];
                Queue<Point> q = new Queue<Point>();

                for (int x = 0; x < w; x++) {
                    q.Enqueue(new Point(x, 0)); visited[x, 0] = true;
                    q.Enqueue(new Point(x, h - 1)); visited[x, h - 1] = true;
                }
                for (int y = 0; y < h; y++) {
                    q.Enqueue(new Point(0, y)); visited[0, y] = true;
                    q.Enqueue(new Point(w - 1, y)); visited[w - 1, y] = true;
                }

                int[] dx = { 0, 0, 1, -1 };
                int[] dy = { 1, -1, 0, 0 };
                int threshold = 35; // black bg threshold

                while (q.Count > 0) {
                    Point p = q.Dequeue();
                    for (int i = 0; i < 4; i++) {
                        int nx = p.X + dx[i];
                        int ny = p.Y + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[nx, ny]) {
                            int idx = ny * stride + nx * 4;
                            byte b = srcBytes[idx];
                            byte g = srcBytes[idx + 1];
                            byte r = srcBytes[idx + 2];
                            int maxVal = Math.Max(r, Math.Max(g, b));
                            if (maxVal < threshold) {
                                visited[nx, ny] = true;
                                q.Enqueue(new Point(nx, ny));
                            }
                        }
                    }
                }

                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * stride + x * 4;
                        byte b = srcBytes[idx];
                        byte g = srcBytes[idx + 1];
                        byte r = srcBytes[idx + 2];
                        int maxVal = Math.Max(r, Math.Max(g, b));

                        if (visited[x, y]) {
                            dstBytes[idx + 3] = 0; // transparent
                        } else if (maxVal < threshold + 25) {
                            // Smooth alpha transition
                            int alpha = Math.Min(255, Math.Max(0, (maxVal - 15) * 255 / (threshold + 10)));
                            dstBytes[idx] = b;
                            dstBytes[idx + 1] = g;
                            dstBytes[idx + 2] = r;
                            dstBytes[idx + 3] = (byte)alpha;
                        } else {
                            dstBytes[idx] = b;
                            dstBytes[idx + 1] = g;
                            dstBytes[idx + 2] = r;
                            dstBytes[idx + 3] = 255;
                        }
                    }
                }
            } else {
                // Direct copy
                Array.Copy(srcBytes, dstBytes, srcBytes.Length);
            }

            // Find tight bounding box of non-transparent content
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int idx = y * stride + x * 4;
                    if (dstBytes[idx + 3] > 20) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            System.Runtime.InteropServices.Marshal.Copy(dstBytes, 0, dstData.Scan0, dstBytes.Length);
            dst.UnlockBits(dstData);

            // Now crop with padding into a square normalized canvas (512x512)
            int pad = 20;
            minX = Math.Max(0, minX - pad);
            minY = Math.Max(0, minY - pad);
            maxX = Math.Min(w - 1, maxX + pad);
            maxY = Math.Min(h - 1, maxY + pad);
            int cropW = maxX - minX + 1;
            int cropH = maxY - minY + 1;

            using (Bitmap finalBmp = new Bitmap(512, 512, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(finalBmp)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                    g.Clear(Color.Transparent);

                    // Fit cropW/cropH centered in 512x512, preserving aspect ratio, slightly grounded
                    float scale = Math.Min(470f / cropW, 470f / cropH);
                    float drawW = cropW * scale;
                    float drawH = cropH * scale;
                    float drawX = (512f - drawW) / 2f;
                    float drawY = 512f - drawH - 20f; // grounded near bottom

                    Rectangle srcCrop = new Rectangle(minX, minY, cropW, cropH);
                    g.DrawImage(dst, new RectangleF(drawX, drawY, drawW, drawH), srcCrop, GraphicsUnit.Pixel);
                }

                Directory.CreateDirectory(Path.GetDirectoryName(outPath));
                finalBmp.Save(outPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

function Process-Sheet($srcPath, $petId, $isBlackBg) {
    Write-Host "Processing $petId from $srcPath..."
    $bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    
    # 4 Quadrants
    # Baby: TL (0,0, 512, 512)
    # Sprout: TR (512, 0, 512, 512)
    # Young: BL (0, 512, 512, 512)
    # Adult: BR (512, 512, 512, 512)
    
    [PetProcessor]::CropQuadrant($bmp, [System.Drawing.Rectangle]::new(0, 0, 512, 512), "c:/Proyectos/Muyu/public/pets/$petId/baby.png", $isBlackBg)
    [PetProcessor]::CropQuadrant($bmp, [System.Drawing.Rectangle]::new(512, 0, 512, 512), "c:/Proyectos/Muyu/public/pets/$petId/sprout.png", $isBlackBg)
    [PetProcessor]::CropQuadrant($bmp, [System.Drawing.Rectangle]::new(0, 512, 512, 512), "c:/Proyectos/Muyu/public/pets/$petId/young.png", $isBlackBg)
    [PetProcessor]::CropQuadrant($bmp, [System.Drawing.Rectangle]::new(512, 512, 512, 512), "c:/Proyectos/Muyu/public/pets/$petId/adult.png", $isBlackBg)
    
    $bmp.Dispose()
    Write-Host "Finished $petId."
}

Process-Sheet 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_065b2ae3.png' 'monkey' $false
Process-Sheet 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783642_0be421f9.png' 'toucan' $false
Process-Sheet 'C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg' 'turtle' $true

Write-Host "ALL 12 STAGES PROCESSED!"

