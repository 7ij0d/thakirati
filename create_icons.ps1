Add-Type -AssemblyName System.Drawing

function Create-CleanIcon([string]$pngPath, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    # 1. Background rounded rectangle
    $radius = [int]($size * 0.22)
    $d = $radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d - 1, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d - 1, $size - $d - 1, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d - 1, $d, $d, 90, 90)
    $path.CloseFigure()

    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 11, 17, 28))
    $g.FillPath($bgBrush, $path)

    # Border
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 255, 255, 255), [float]($size * 0.02))
    $g.DrawPath($borderPen, $path)

    # Glowing outer ring
    $ringWidth = [float]($size * 0.07)
    $ringPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 2, 132, 199), $ringWidth)
    $ringMargin = [int]($size * 0.24)
    $ringDim = $size - ($ringMargin * 2)
    $g.DrawArc($ringPen, $ringMargin, $ringMargin, $ringDim, $ringDim, 50, 260)

    # Center Cyan Core
    $coreBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $coreSize = [int]($size * 0.16)
    $corePos = [int](($size - $coreSize) / 2)
    $g.FillEllipse($coreBrush, $corePos, $corePos, $coreSize, $coreSize)

    # Sparkle accents
    $sparkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 186, 230, 253))
    $spSize = [int]($size * 0.08)
    $g.FillEllipse($sparkBrush, [int]($size * 0.66), [int]($size * 0.28), $spSize, $spSize)

    $bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$dir = "C:\Users\Taha\.gemini\antigravity\scratch\thakirati\public"
Create-CleanIcon "$dir\logo-192.png" 192
Create-CleanIcon "$dir\logo-512.png" 512

# Create icon for Windows Desktop Shortcut
$iconBmp = New-Object System.Drawing.Bitmap "$dir\logo-192.png"
$hIcon = $iconBmp.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream "$dir\app.ico", ([System.IO.FileMode]::Create)
$ico.Save($fileStream)
$fileStream.Close()
$iconBmp.Dispose()

Write-Output "Generated PNG and ICO successfully at $dir"
