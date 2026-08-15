@echo off
echo ========================================================
echo Launching Saaman Full-Stack AI Application...
echo ========================================================
start "Saaman Backend API" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "Saaman React Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Both Backend (http://127.0.0.1:8000) and Frontend (http://localhost:3000) are starting up!
