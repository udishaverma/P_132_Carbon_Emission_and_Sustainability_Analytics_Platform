@echo off
echo ==========================================================
echo  Starting CO2 Analytics Platform (FastAPI + React Vite)
echo ==========================================================

cd /d "%~dp0"

echo Starting FastAPI Backend in a new window...
start "FastAPI Backend - Port 8000" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting React Frontend in a new window...
start "React Frontend - Port 5173" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers have been launched!
echo - Web Dashboard:  http://localhost:5173
echo - API Docs:       http://127.0.0.1:8000/docs
echo.
pause
