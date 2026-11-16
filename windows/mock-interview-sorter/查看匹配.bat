@echo off
chcp 65001 >nul
set /p T=输入时间（例如 2026-11-16 14:10，直接回车=现在）: 
if "%T%"=="" for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set "T=%%i"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0MockInterviewSorter.ps1" -WhoAt "%T%"
pause
