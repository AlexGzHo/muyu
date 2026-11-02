Add-Type -AssemblyName System.Drawing

$imgMonkey = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_065b2ae3.png')
$imgToucan = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783642_0be421f9.png')
$imgTurtle = [System.Drawing.Bitmap]::FromFile('C:/Users/lizna/.gemini/antigravity/brain/1924a8a0-226c-4376-b7c5-f1e8ac168e51/.user_uploaded/media_1792356783641_3fca7144.jpg')

Write-Host "Monkey PixelFormat: $($imgMonkey.PixelFormat)"
Write-Host "Toucan PixelFormat: $($imgToucan.PixelFormat)"
Write-Host "Turtle PixelFormat: $($imgTurtle.PixelFormat)"

Write-Host "Monkey 10,10: $($imgMonkey.GetPixel(10,10))"
Write-Host "Toucan 10,10: $($imgToucan.GetPixel(10,10))"
Write-Host "Turtle 10,10: $($imgTurtle.GetPixel(10,10))"

