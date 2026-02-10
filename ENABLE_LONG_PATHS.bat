@echo off
echo ========================================
echo Attendify - Enable Windows Long Paths
echo ========================================
echo.
echo This script will enable Windows Long Path support.
echo You need to run this as ADMINISTRATOR.
echo.
echo After running this, you MUST restart your computer.
echo.
pause

echo.
echo Enabling long paths...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo ✅ SUCCESS!
    echo ========================================
    echo.
    echo Long paths have been enabled.
    echo.
    echo ⚠️  IMPORTANT: You MUST restart your computer now!
    echo.
    echo After restart:
    echo 1. Open PowerShell
    echo 2. Run: cd C:\attendify\backend
    echo 3. Run: pip install deepface
    echo 4. Continue with testing
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ FAILED!
    echo ========================================
    echo.
    echo Please run this script as Administrator:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo.
)

pause
