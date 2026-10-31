# Start both the FastAPI Backend and Vite Frontend in separate windows
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Starting CO2 Analytics & ML Platform (Backend + Frontend)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend
Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; Write-Host 'Starting FastAPI Backend...' -ForegroundColor Green; python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Vite Frontend
Write-Host "Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host 'Starting Vite Dev Server...' -ForegroundColor Green; npm run dev"

Write-Host "`nBoth services are starting!" -ForegroundColor Yellow
Write-Host "- Web App:  http://localhost:5173" -ForegroundColor White
Write-Host "- API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
