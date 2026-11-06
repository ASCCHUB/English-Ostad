$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = Split-Path -Parent $PSScriptRoot
foreach ($avatarName in @('fox','bunny','turtle')) {
    $sourcePath = Join-Path $taskRoot ('output/design/avatar-portraits/'+$avatarName+'.png')
    $source = [System.Drawing.Image]::FromFile($sourcePath)
    try {
        if ($source.Width -ne $source.Height) { throw ('Avatar source must be square: '+$avatarName) }
        $bitmap = New-Object System.Drawing.Bitmap(256,256)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.DrawImage($source,0,0,256,256)
            $bitmap.Save((Join-Path $taskRoot ('public/explorers/avatar-'+$avatarName+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
    } finally { $source.Dispose() }
}
Write-Output 'Generated three 256px realistic avatar portraits.'
