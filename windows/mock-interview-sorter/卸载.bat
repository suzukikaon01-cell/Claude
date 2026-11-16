@echo off
chcp 65001 >nul
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe'\" | Where-Object { $_.CommandLine -like '*MockInterviewSorter.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId }"
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\模拟面试反馈整理.lnk" 2>nul
rmdir /s /q "%APPDATA%\MockInterviewSorter" 2>nul
echo 已停止并移除自动运行。
pause
