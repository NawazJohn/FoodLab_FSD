# FoodLab MERN Application PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "          FOODLAB - QUALITY CONTROL LABORATORY SYSTEM (MERN)          " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

$baseDir = if (Test-Path "$PSScriptRoot\FoodLab_FSD\server") {
    "$PSScriptRoot\FoodLab_FSD"
} elseif (Test-Path "$PSScriptRoot\server") {
    "$PSScriptRoot"
} else {
    Write-Error "Could not find FoodLab project folders."
    exit 1
}

Write-Host "[1/3] Starting Express.js + MongoDB Backend (Port 5000)..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$baseDir\server`" && title FoodLab Backend Server && npm run dev"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting React.js Frontend (Vite)..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$baseDir\client`" && title FoodLab React Client && npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " FoodLab is starting up!" -ForegroundColor Green
Write-Host "  - Backend Server: http://localhost:5000"
Write-Host "  - Frontend Client: http://localhost:5173"
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"
