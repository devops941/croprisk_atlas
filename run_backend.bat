@echo off
title CropRisk Atlas - Backend API Server
echo ========================================================
echo    CropRisk Atlas - FastAPI Intelligence Backend
echo ========================================================
echo API URL:  http://127.0.0.1:8000
echo Swagger:  http://127.0.0.1:8000/docs
echo.
cd backend
call venv\Scripts\activate.bat
python run.py
pause
