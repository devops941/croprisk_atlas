@echo off
echo ========================================================
echo       Launching CropRisk Atlas Full-Stack System
echo ========================================================
echo 1. Starting Backend API Server (Port 8000)...
start "CropRisk Atlas - Backend Server" cmd /k "run_backend.bat"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo 2. Starting Frontend React UI (Port 3000)...
start "CropRisk Atlas - Frontend UI" cmd /k "run_frontend.bat"

echo.
echo Application successfully launched!
echo - Backend API:  http://127.0.0.1:8000 (Docs: /docs)
echo - Frontend UI:  http://localhost:3000
echo ========================================================
