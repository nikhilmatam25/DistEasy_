@echo off
title DistEasy - Add to Windows Startup
echo.
echo  =====================================================
echo   Adding DistEasy to Windows Startup
echo  =====================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "BAT_FILE=D:\App\DistEasy_\START_DISTEASY.bat"
set "SHORTCUT=%STARTUP_FOLDER%\DistEasy.lnk"

:: Use PowerShell to create a proper shortcut (not just copy the bat)
powershell -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$s = $ws.CreateShortcut('%SHORTCUT%');" ^
  "$s.TargetPath = '%BAT_FILE%';" ^
  "$s.WorkingDirectory = 'D:\App\DistEasy_';" ^
  "$s.WindowStyle = 1;" ^
  "$s.Description = 'Start DistEasy Distributor System';" ^
  "$s.Save();"

if exist "%SHORTCUT%" (
    echo  [SUCCESS] DistEasy will now start automatically when Windows starts!
    echo.
    echo  Shortcut created at:
    echo  %SHORTCUT%
    echo.
    echo  To REMOVE auto-start later, delete this shortcut:
    echo  %STARTUP_FOLDER%
) else (
    echo  [ERROR] Failed to create shortcut.
    echo  Please manually copy START_DISTEASY.bat to:
    echo  %STARTUP_FOLDER%
)

echo.
pause
