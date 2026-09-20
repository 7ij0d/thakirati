[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$desktop = [System.Environment]::GetFolderPath('Desktop')

# Clean up any mangled shortcut
Get-ChildItem $desktop | Where-Object { $_.Name -like "*lnk" -and $_.Name -match "[\uFFFD\?]" } | Remove-Item -Force

$shortcutName = "Thakirati - ذاكرتي.lnk"
$shortcutPath = [System.IO.Path]::Combine($desktop, $shortcutName)

$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath = "msedge.exe"
$sc.Arguments = '--app="https://7ij0d.github.io/thakirati/" --window-size=1220,860'
$sc.Description = "ذاكرتي - المساعد الشخصي لمنع النسيان"
$sc.IconLocation = "C:\Users\Taha\.gemini\antigravity\scratch\thakirati\public\app.ico, 0"
$sc.WorkingDirectory = "C:\Users\Taha\.gemini\antigravity\scratch\thakirati"
$sc.Save()

Write-Output "Created: $shortcutPath"
