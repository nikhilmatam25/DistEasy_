@echo off
title DistEasy - Backend Server
color 0A
echo.
echo  ==========================================
echo   DistEasy Backend - FastAPI Server
echo   URL: http://127.0.0.1:8000
echo  ==========================================
echo.

cd /d "D:\App\DistEasy_\backend"
call venv\Scripts\activate.bat

echo  Starting FastAPI backend...
echo  Press Ctrl+C to stop the server.
echo.

venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo  Server stopped. Press any key to exit.
pause >nul
