@echo off
setlocal EnableDelayedExpansion
title DistEasy - Database Backup
color 0B

set "ROOT=D:\App\DistEasy_"
set "DB_SOURCE=%ROOT%\backend\disteasy.db"
set "BACKUP_DIR=%ROOT%\backups"

echo.
echo  =====================================================
echo   DistEasy - Database Backup
echo  =====================================================
echo.

if not exist "%DB_SOURCE%" (
    color 0C
    echo  [ERROR] Database not found at:
    echo  %DB_SOURCE%
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo  Created backup folder.
)

:: Build timestamp
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
    echo  [SUCCESS] Backup created:
    echo  %BACKUP_FILE%
    echo.
    :: Count total backups
    set COUNT=0
    for %%f in ("%BACKUP_DIR%\*.db") do set /a COUNT+=1
    echo  Total backups stored: !COUNT!
    echo.
    :: Show last 5 backups
    echo  Recent backups:
    for /f "delims=" %%f in ('dir "%BACKUP_DIR%\*.db" /b /o:-d 2^>nul') do (
        echo    %%f
    )
) else (
    color 0C
    echo  [ERROR] Backup failed! The database may be in use.
    echo  Close DistEasy and try again.
)

echo.
pause
