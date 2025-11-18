# Document Processor - Desktop Shortcut Creator
# Run this script to create a desktop shortcut for quick access

# Get the path of the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$startMenuPath = [Environment]::GetFolderPath("Programs")

# Shortcut paths
$desktopShortcutPath = "$desktopPath\Document Processor.lnk"
$startMenuShortcutPath = "$startMenuPath\Document Processor.lnk"
$batchFilePath = "$scriptPath\launch-app.bat"

# Create WScript.Shell COM object
$WshShell = New-Object -ComObject WScript.Shell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Document Processor - Shortcut Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify batch file exists
if (-not (Test-Path $batchFilePath)) {
    Write-Host "❌ ERROR: launch-app.bat not found at: $batchFilePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure this script is in the document-processing directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📁 Batch file found: $batchFilePath" -ForegroundColor Green

# Create Desktop Shortcut
Write-Host ""
Write-Host "Creating desktop shortcut..." -ForegroundColor Yellow

try {
    $DesktopShortcut = $WshShell.CreateShortCut($desktopShortcutPath)
    $DesktopShortcut.TargetPath = $batchFilePath
    $DesktopShortcut.WorkingDirectory = $scriptPath
    $DesktopShortcut.Description = "Launch Document Processor - Process documents locally with secure storage"
    $DesktopShortcut.WindowStyle = 1  # Normal window
    $DesktopShortcut.Save()
    Write-Host "✅ Desktop shortcut created: $desktopShortcutPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create desktop shortcut: $_" -ForegroundColor Red
}

# Create Start Menu Shortcut
Write-Host ""
Write-Host "Creating Start Menu shortcut..." -ForegroundColor Yellow

try {
    $StartMenuShortcut = $WshShell.CreateShortCut($startMenuShortcutPath)
    $StartMenuShortcut.TargetPath = $batchFilePath
    $StartMenuShortcut.WorkingDirectory = $scriptPath
    $StartMenuShortcut.Description = "Launch Document Processor - Process documents locally with secure storage"
    $StartMenuShortcut.WindowStyle = 1  # Normal window
    $StartMenuShortcut.Save()
    Write-Host "✅ Start Menu shortcut created: $startMenuShortcutPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create Start Menu shortcut: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  1. Click 'Document Processor' on your Desktop to launch the app" -ForegroundColor White
Write-Host "  2. Or search for 'Document Processor' in Windows Start Menu" -ForegroundColor White
Write-Host ""
Write-Host "First launch will:" -ForegroundColor Cyan
Write-Host "  • Install dependencies (npm install)" -ForegroundColor White
Write-Host "  • Start the server" -ForegroundColor White
Write-Host "  • Open the app in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = Read-Host