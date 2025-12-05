Add-Type -AssemblyName System.Drawing

$sourceImage = [System.Drawing.Image]::FromFile("C:\projects\docsshelf-v7\new-icon.png")

# Create 1024x1024 square canvas
$size = 1024
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Calculate scaling to fit image centered
$scale = [Math]::Min($size / $sourceImage.Width, $size / $sourceImage.Height)
$newWidth = [int]($sourceImage.Width * $scale)
$newHeight = [int]($sourceImage.Height * $scale)
$x = [int](($size - $newWidth) / 2)
$y = [int](($size - $newHeight) / 2)

$graphics.DrawImage($sourceImage, $x, $y, $newWidth, $newHeight)

# Save main icon
$bitmap.Save("C:\projects\docsshelf-v7\assets\images\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: icon.png"

# Save splash icon (same as main)
$bitmap.Save("C:\projects\docsshelf-v7\assets\images\splash-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: splash-icon.png"

# Save Android foreground (same as main)
$bitmap.Save("C:\projects\docsshelf-v7\assets\images\android-icon-foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: android-icon-foreground.png"

# Create background (solid blue)
$bgBitmap = New-Object System.Drawing.Bitmap($size, $size)
$bgGraphics = [System.Drawing.Graphics]::FromImage($bgBitmap)
$bgGraphics.Clear([System.Drawing.Color]::FromArgb(59, 130, 246))
$bgBitmap.Save("C:\projects\docsshelf-v7\assets\images\android-icon-background.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: android-icon-background.png"
$bgGraphics.Dispose()
$bgBitmap.Dispose()

# Create monochrome version (white on transparent)
$monoBitmap = New-Object System.Drawing.Bitmap($size, $size)
$monoGraphics = [System.Drawing.Graphics]::FromImage($monoBitmap)
$monoGraphics.Clear([System.Drawing.Color]::Transparent)
$monoGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Draw in white
$colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix
$colorMatrix.Matrix00 = 0
$colorMatrix.Matrix11 = 0
$colorMatrix.Matrix22 = 0
$colorMatrix.Matrix33 = 1
$colorMatrix.Matrix40 = 1
$colorMatrix.Matrix41 = 1
$colorMatrix.Matrix42 = 1

$imageAttributes = New-Object System.Drawing.Imaging.ImageAttributes
$imageAttributes.SetColorMatrix($colorMatrix)

$monoGraphics.DrawImage($sourceImage, 
    (New-Object System.Drawing.Rectangle($x, $y, $newWidth, $newHeight)),
    0, 0, $sourceImage.Width, $sourceImage.Height,
    [System.Drawing.GraphicsUnit]::Pixel,
    $imageAttributes)

$monoBitmap.Save("C:\projects\docsshelf-v7\assets\images\android-icon-monochrome.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: android-icon-monochrome.png"
$monoGraphics.Dispose()
$monoBitmap.Dispose()

# Create favicon (48x48)
$faviconBitmap = New-Object System.Drawing.Bitmap(48, 48)
$faviconGraphics = [System.Drawing.Graphics]::FromImage($faviconBitmap)
$faviconGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$faviconGraphics.DrawImage($bitmap, 0, 0, 48, 48)
$faviconBitmap.Save("C:\projects\docsshelf-v7\assets\images\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created: favicon.png"
$faviconGraphics.Dispose()
$faviconBitmap.Dispose()

# Cleanup
$graphics.Dispose()
$bitmap.Dispose()
$sourceImage.Dispose()

Write-Host "`nAll icons created successfully!"
