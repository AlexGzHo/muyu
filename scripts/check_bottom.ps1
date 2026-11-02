Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('c:/Proyectos/Muyu/public/pets/monkey/sprout.png')
$hasBottomContent = $false
for ($y = 490; $y -lt 512; $y++) {
    for ($x = 0; $x -lt 512; $x++) {
        if ($img.GetPixel($x, $y).A -gt 10) {
            $hasBottomContent = $true
        }
    }
}
Write-Host "Any content below feet (y>=490): $hasBottomContent"
$img.Dispose()

