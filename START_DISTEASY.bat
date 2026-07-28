@echo off
setlocal EnableDelayedExpansion
title DistEasy - Starting...
color 0A

:: ============================================================
::  DistEasy Startup Script
::  Starts Backend + Frontend + Opens Browser Automatically
:: ============================================================

set "ROOT=D:\App\DistEasy_"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"
set "UVICORN=%BACKEND%\venv\Scripts\uvicorn.exe"
set "NODE_CMD=npm"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=5173"
set "BROWSER_URL=http://localhost:%FRONTEND_PORT%"

echo.
echo  =====================================================
echo       ██████╗ ██╗███████╗████████╗███████╗ █████╗ ███████╗██╗   ██╗
echo       ██╔══██╗██║██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝╚██╗ ██╔╝
echo       ██║  ██║██║███████╗   ██║   █████╗  ███████║███████╗ ╚████╔╝
echo       ██║  ██║██║╚════██║   ██║   ██╔══╝  ██╔══██║╚════██║  ╚██╔╝
echo       ██████╔╝██║███████║   ██║   ███████╗██║  ██║███████║   ██║
echo       ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝
echo  =====================================================
echo       Distributor Management System
echo  =====================================================
echo.

:: ---- Check Backend exists ----
if not exist "%UVICORN%" (
    color 0C
    echo  [ERROR] Backend virtual environment not found!
    echo  Expected: %UVICORN%
    echo.
    echo  Please make sure the venv is set up correctly.
    pause
    exit /b 1
)

:: ---- Check Frontend exists ----
if not exist "%FRONTEND%\package.json" (
    color 0C
    echo  [ERROR] Frontend not found!
    echo  Expected: %FRONTEND%\package.json
    echo.
    pause
    exit /b 1
)

:: ---- Step 1: Backup Database ----
echo  [1/3] Backing up database...
call :BACKUP_DB
echo.

:: ---- Step 2: Start Backend ----
echo  [2/3] Starting Backend Server (FastAPI)...
start "DistEasy - Backend" cmd /k "title DistEasy Backend ^| color 0A && cd /d "%BACKEND%" && echo. && echo  Backend starting on http://127.0.0.1:%BACKEND_PORT% && echo  Press Ctrl+C to stop. && echo. && "%UVICORN%" main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
echo       Backend starting on port %BACKEND_PORT%...
echo.

:: Wait for backend to initialize
echo  Waiting for backend to be ready...
timeout /t 4 /nobreak >nul

:: ---- Step 3: Start Frontend ----
echo  [3/3] Starting Frontend Server (Vite)...
start "DistEasy - Frontend" cmd /k "title DistEasy Frontend ^| color 0B && cd /d "%FRONTEND%" && echo. && echo  Frontend starting on http://localhost:%FRONTEND_PORT% && echo  Press Ctrl+C to stop. && echo. && npm run dev"
echo       Frontend starting on port %FRONTEND_PORT%...
echo.

:: Wait for frontend to initialize
echo  Waiting for frontend to be ready...
timeout /t 5 /nobreak >nul

:: ---- Step 4: Open Browser ----
echo  Opening DistEasy in your browser...
start "" "%BROWSER_URL%"
echo.

:: ---- Done ----
color 0A
echo  =====================================================
echo   DistEasy is now RUNNING!
echo.
echo   App URL  : %BROWSER_URL%
echo   API URL  : http://127.0.0.1:%BACKEND_PORT%
echo   Network  : http://YOUR-IP:%FRONTEND_PORT%
echo.
echo   Two server windows are open (Backend + Frontend)
echo   DO NOT close those windows while using the app.
echo.
echo   To STOP the app: Close both server windows.
echo  =====================================================
echo.
echo  Press any key to close this window (servers keep running)...
pause >nul
exit /b 0


:: ============================================================
:: BACKUP DATABASE FUNCTION
:: ============================================================
:BACKUP_DB
    set "DB_SOURCE=%BACKEND%\disteasy.db"
    set "BACKUP_DIR=%ROOT%\backups"

    if not exist "%DB_SOURCE%" (
        echo       [WARNING] Database not found, skipping backup.
        goto :EOF
    )

    if not exist "%BACKUP_DIR%" (
        mkdir "%BACKUP_DIR%"
        echo       Created backup folder: %BACKUP_DIR%
    )

    :: Generate timestamp: YYYY-MM-DD_HH-MM-SS
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
        set "DD=%%a"
        set "MM=%%b"
        set "YYYY=%%c"
    )
    for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do (
        set "HH=%%a"
        set "MIN=%%b"
    )
    set "SS=%time:~6,2%"
    set "SS=%SS: =0%"
    set "TIMESTAMP=%YYYY%-%MM%-%DD%_%HH%-%MIN%-%SS%"

    set "BACKUP_FILE=%BACKUP_DIR%\disteasy_%TIMESTAMP%.db"

    copy "%DB_SOURCE%" "%BACKUP_FILE%" >nul 2>&1
    if !ERRORLEVEL! == 0 (
        echo       Backup saved: backups\disteasy_%TIMESTAMP%.db
    ) else (
        echo       [WARNING] Backup failed. Check if DB is locked by another process.
    )
goto :EOF
