Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg')
$width = $src.Width
$height = $src.Height

# Create output bitmap 32-bit ARGB
$dst = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Queue-based flood fill to find external black background
$visited = New-Object 'bool[,]' $width, $height
$queue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'

# Seed from corners and edges
$seeds = @(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($width - 1, 0),
    [System.Drawing.Point]::new(0, $height - 1),
    [System.Drawing.Point]::new($width - 1, $height - 1),
    [System.Drawing.Point]::new([int]($width/2), 0),
    [System.Drawing.Point]::new([int]($width/2), $height - 1),
    [System.Drawing.Point]::new(0, [int]($height/2)),
    [System.Drawing.Point]::new($width - 1, [int]($height/2))
)

foreach ($s in $seeds) {
    $queue.Enqueue($s)
    $visited[$s.X, $s.Y] = $true
}

$dx = @(0, 0, 1, -1)
$dy = @(1, -1, 0, 0)

$threshold = 28 # Black background threshold (R+G+B < threshold * 3 or max(R,G,B) < threshold)

while ($queue.Count -gt 0) {
    $p = $queue.Dequeue()
    for ($i = 0; $i -lt 4; $i++) {
        $nx = $p.X + $dx[$i]
        $ny = $p.Y + $dy[$i]
        if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
            if (-not $visited[$nx, $ny]) {
                $c = $src.GetPixel($nx, $ny)
                $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
                if ($maxVal -lt $threshold) {
                    $visited[$nx, $ny] = $true
                    $queue.Enqueue([System.Drawing.Point]::new($nx, $ny))
                }
            }
        }
    }
}

# Now construct DST bitmap: visited pixels are transparent (A=0), border pixels get smooth alpha, others full
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $src.GetPixel($x, $y)
        if ($visited[$x, $y]) {
            # Completely transparent background
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Check if near a visited pixel for anti-aliasing
            $maxVal = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
            if ($maxVal -lt ($threshold + 20)) {
                # Edge transition
                $alpha = [int]([Math]::Min(255, [Math]::Max(0, ($maxVal - 10) * (255 / ($threshold + 10)))))
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
}

[System.IO.Directory]::CreateDirectory('c:/Proyectos/Muyu/public/pets')
$dst.Save('c:/Proyectos/Muyu/public/pets/turtle_all_transparent.png', [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved turtle_all_transparent.png successfully!"

