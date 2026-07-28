@echo off
title DistEasy - Frontend Server
color 0B
echo.
echo  ==========================================
echo   DistEasy Frontend - Vite Dev Server
echo   Local:   http://localhost:5173
echo   Network: http://YOUR-IP:5173
echo  ==========================================
echo.

cd /d "D:\App\DistEasy_\frontend"

echo  Starting Vite frontend server...
echo  Access from any device on your network using your PC's IP address.
echo  Press Ctrl+C to stop the server.
echo.

npm run dev

echo.
echo  Server stopped. Press any key to exit.
pause >nul
