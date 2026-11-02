Add-Type -AssemblyName System.Drawing

function Get-BoundingBox($bmp, $startX, $startY, $width, $height, [bool]$isBlackBg = $false) {
    $minX = $startX + $width
    $maxX = $startX
    $minY = $startY + $height
    $maxY = $startY
    
    for ($y = $startY; $y -lt ($startY + $height); $y++) {
        for ($x = $startX; $x -lt ($startX + $width); $x++) {
            $c = $bmp.GetPixel($x, $y)
            $isContent = $false
            if ($isBlackBg) {
                # For black background, content has R+G+B > threshold
                if (($c.R + $c.G + $c.B) -gt 35) {
                    $isContent = $true
                }
            } else {
                # For transparent background, A > 10
                if ($c.A -gt 10) {
                    $isContent = $true
                }
            }
            if ($isContent) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    return [PSCustomObject]@{
        MinX = $minX
        MaxX = $maxX
        MinY = $minY
        MaxY = $maxY
        Width = ($maxX - $minX + 1)
        Height = ($maxY - $minY + 1)
    }
}

$imgMonkey = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_065b2ae3.png')
$imgToucan = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783642_0be421f9.png')
$imgTurtle = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg')

Write-Host "--- MONKEY QUADRANTS ---"
Write-Host "Baby (TL):" (Get-BoundingBox $imgMonkey 0 0 512 512)
Write-Host "Sprout (TR):" (Get-BoundingBox $imgMonkey 512 0 512 512)
Write-Host "Young (BL):" (Get-BoundingBox $imgMonkey 0 512 512 512)
Write-Host "Adult (BR):" (Get-BoundingBox $imgMonkey 512 512 512 512)

Write-Host "--- TOUCAN QUADRANTS ---"
Write-Host "Baby (TL):" (Get-BoundingBox $imgToucan 0 0 512 512)
Write-Host "Sprout (TR):" (Get-BoundingBox $imgToucan 512 0 512 512)
Write-Host "Young (BL):" (Get-BoundingBox $imgToucan 0 512 512 512)
Write-Host "Adult (BR):" (Get-BoundingBox $imgToucan 512 512 512 512)

Write-Host "--- TURTLE QUADRANTS (Black BG) ---"
Write-Host "Baby (TL):" (Get-BoundingBox $imgTurtle 0 0 512 512 $true)
Write-Host "Sprout (TR):" (Get-BoundingBox $imgTurtle 512 0 512 512 $true)
Write-Host "Young (BL):" (Get-BoundingBox $imgTurtle 0 512 512 512 $true)
Write-Host "Adult (BR):" (Get-BoundingBox $imgTurtle 512 512 512 512 $true)

