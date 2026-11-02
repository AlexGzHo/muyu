Add-Type -AssemblyName System.Drawing

function Analyze-PetImage($filePath) {
    $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
    $w = $bmp.Width
    $h = $bmp.Height

    # Find top pixel, bottom pixel, left pixel, right pixel
    $topY = $h; $bottomY = 0; $leftX = $w; $rightX = 0
    # Also find width of character at each 10% height slice
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 30) {
                if ($y -lt $topY) { $topY = $y }
                if ($y -gt $bottomY) { $bottomY = $y }
                if ($x -lt $leftX) { $leftX = $x }
                if ($x -gt $rightX) { $rightX = $x }
            }
        }
    }

    # In 200x200 SVG space (x="10" y="10" width="180" height="180")
    # svgX = 10 + (pixelX / 512) * 180
    # svgY = 10 + (pixelY / 512) * 180
    $svgTop = [Math]::Round(10 + ($topY / 512) * 180, 1)
    $svgBottom = [Math]::Round(10 + ($bottomY / 512) * 180, 1)
    $svgLeft = [Math]::Round(10 + ($leftX / 512) * 180, 1)
    $svgRight = [Math]::Round(10 + ($rightX / 512) * 180, 1)
    $svgCenter = [Math]::Round(($svgLeft + $svgRight) / 2, 1)

    # Find head center: average X of top 25% of body
    $headMaxY = $topY + [int](($bottomY - $topY) * 0.25)
    $headSumX = 0; $headCount = 0
    for ($y = $topY; $y -lt $headMaxY; $y++) {
        for ($x = $leftX; $x -lt $rightX; $x++) {
            if ($bmp.GetPixel($x, $y).A -gt 30) {
                $headSumX += $x
                $headCount++
            }
        }
    }
    $headCenterX = if ($headCount -gt 0) { [Math]::Round(10 + (($headSumX / $headCount) / 512) * 180, 1) } else { $svgCenter }

    $bmp.Dispose()

    return [PSCustomObject]@{
        File = [System.IO.Path]::GetFileName($filePath)
        SvgTop = $svgTop
        SvgBottom = $svgBottom
        SvgLeft = $svgLeft
        SvgRight = $svgRight
        SvgCenter = $svgCenter
        HeadCenterX = $headCenterX
    }
}

$pets = @('monkey', 'toucan', 'turtle')
$stages = @('baby', 'sprout', 'young', 'adult')

foreach ($p in $pets) {
    Write-Host "=== $p ==="
    foreach ($s in $stages) {
        $res = Analyze-PetImage "c:/Proyectos/Muyu/public/pets/$p/$s.png"
        Write-Host "$s -> TopY: $($res.SvgTop), HeadX: $($res.HeadCenterX), CenterX: $($res.SvgCenter), W: $([Math]::Round($res.SvgRight - $res.SvgLeft, 1))"
    }
}

