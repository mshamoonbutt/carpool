# Startup script for running both backend and frontend
# Usage: ./start-app.bat

@echo off
echo Starting UniPool application...

start cmd /k "cd %~dp0backend && python -m main"
echo Backend server starting on http://localhost:8000...

timeout /t 5 /nobreak
start cmd /k "cd %~dp0junior track\v0 dev UniPool && npm run dev"
echo Frontend starting on http://localhost:3000...

echo.
echo UniPool application is now running.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
