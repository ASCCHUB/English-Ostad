$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = Split-Path -Parent $PSScriptRoot
$source = [System.Drawing.Image]::FromFile((Join-Path $taskRoot 'public/pashto-english-icon.png'))
function Write-Icon([int]$size, [string]$filename, [bool]$maskable = $false) {
    $bitmap = New-Object System.Drawing.Bitmap($size,$size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#FF584D'))
    $margin = 0
    if ($maskable) { $margin = [int]($size * 0.14) }
    $graphics.DrawImage($source,$margin,$margin,($size-2*$margin),($size-2*$margin))
    $bitmap.Save((Join-Path $taskRoot ('public/'+$filename)),[System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose(); $bitmap.Dispose()
}
try {
    Write-Icon 32 'favicon-32.png'
    Write-Icon 180 'apple-touch-icon.png'
    Write-Icon 192 'ustad-icon-192.png'
    Write-Icon 512 'ustad-icon-512.png'
    Write-Icon 512 'ustad-icon-maskable-512.png' $true
    $encoded = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes((Join-Path $taskRoot 'public/ustad-icon-512.png')))
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Pashto to English: Learn and Play</title><image width="512" height="512" href="data:image/png;base64,'+$encoded+'"/></svg>'
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path $taskRoot 'public/ustad-icon.svg'),$svg,$encoding)
    [System.IO.File]::WriteAllText((Join-Path $taskRoot 'public/favicon.svg'),$svg,$encoding)
    Write-Output 'Generated backpack/book favicon, Apple touch icon, and standard/maskable app icons.'
} finally { $source.Dispose() }
