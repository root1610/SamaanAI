@echo off
echo Starting Saaman React Frontend...
set PATH=%~dp0..\node_env\node-v20.18.0-win-x64;%PATH%
cd /d "%~dp0frontend"
npm run dev
