@echo off
setlocal EnableDelayedExpansion
title DistEasy - Stop All Servers
color 0C

echo.
echo  =====================================================
echo   DistEasy - Stopping All Servers
echo  =====================================================
echo.

echo  Stopping backend (uvicorn)...
taskkill /FI "WINDOWTITLE eq DistEasy - Backend*" /F >nul 2>&1
taskkill /IM uvicorn.exe /F >nul 2>&1

echo  Stopping frontend (vite/node)...
taskkill /FI "WINDOWTITLE eq DistEasy - Frontend*" /F >nul 2>&1

echo.
echo  [DONE] DistEasy servers have been stopped.
echo  You can now safely close this window.
echo.
pause
