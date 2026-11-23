@echo off
title CropRisk Atlas - MongoDB Synchronizer
echo ========================================================
echo    CropRisk Atlas - Synchronize Data to MongoDB
echo ========================================================
echo Target Database: croprisk_atlas (mongodb://localhost:27017)
echo.
cd backend
call venv\Scripts\activate.bat
python scripts\sync_to_mongodb.py
echo.
echo ========================================================
echo Now open MongoDB Compass and click "Refresh" to view!
echo ========================================================
pause
