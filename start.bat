@echo off
TITLE FoodLab MERN Application Launcher
COLOR 0A

echo ======================================================================
echo           FOODLAB - QUALITY CONTROL LABORATORY SYSTEM (MERN)
echo ======================================================================
echo.

:: Detect project directory whether run from root or FoodLab_FSD subfolder
if exist "%~dp0FoodLab_FSD\server" (
    set "BASE_DIR=%~dp0FoodLab_FSD"
) else if exist "%~dp0server" (
    set "BASE_DIR=%~dp0"
) else (
    echo [ERROR] Could not find FoodLab project folders.
    pause
    exit /b 1
)

echo [1/3] Starting Express.js + MongoDB Backend (Port 5000)...
pushd "%BASE_DIR%\server"
start "FoodLab Backend (Express)" cmd /k "npm run dev"
popd

echo [2/3] Waiting for Backend to initialize...
ping -n 3 127.0.0.1 >nul

echo [3/3] Starting React.js Frontend (Vite)...
pushd "%BASE_DIR%\client"
start "FoodLab React Client" cmd /k "npm run dev"
popd

echo.
echo ======================================================================
echo  FoodLab is starting up!
echo   - Backend Server: http://localhost:5000
echo   - Frontend Client: http://localhost:5173
echo.
echo  Keep the server windows open while using the application.
echo ======================================================================
echo.

ping -n 3 127.0.0.1 >nul
start http://localhost:5173
