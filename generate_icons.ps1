# PWA Icon Generator Script
# Generate temporary icons for PWA

Write-Host "Starting PWA icon generation..." -ForegroundColor Cyan

# Required sizes
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

# Create icons directory if it doesn't exist
if (-not (Test-Path "icons")) {
    New-Item -ItemType Directory -Path "icons" | Out-Null
    Write-Host "Created icons directory" -ForegroundColor Green
}

# Use .NET Framework System.Drawing
Add-Type -AssemblyName System.Drawing

foreach ($size in $sizes) {
    $filename = "icons\icon-${size}x${size}.png"
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # High quality rendering settings
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Background gradient (orange to pink)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        [System.Drawing.Color]::FromArgb(255, 255, 154, 0),  # Orange
        [System.Drawing.Color]::FromArgb(255, 255, 105, 180) # Pink
    )
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Draw "S" text in center
    $fontSize = [Math]::Floor($size * 0.5)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    # Center text
    $text = "S"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    
    # Draw text shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 0, 0, 0))
    $graphics.DrawString($text, $font, $shadowBrush, $x + 2, $y + 2)
    
    # Draw text
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    
    # Save file
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Dispose resources
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $textBrush.Dispose()
    $shadowBrush.Dispose()
    
    Write-Host "Generated: $filename" -ForegroundColor Green
}

Write-Host ""
Write-Host "All icons generated successfully!" -ForegroundColor Cyan
Write-Host "Generated files:" -ForegroundColor Yellow
Get-ChildItem "icons\icon-*.png" | ForEach-Object {
    $fileSize = $_.Length
    Write-Host "  - $($_.Name) ($fileSize bytes)" -ForegroundColor Gray
}
