@echo off
echo ===================================================
echo   Starting SamaanAI Full-Stack Application
echo ===================================================

start "SamaanAI Backend" cmd /k "start-backend.bat"
start "SamaanAI Frontend" cmd /k "start-frontend.bat"

echo.
echo SamaanAI is launching!
echo Backend API: http://localhost:8000
echo Frontend UI:  http://localhost:3000
echo ===================================================
