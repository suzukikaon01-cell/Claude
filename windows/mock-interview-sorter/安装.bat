@echo off
chcp 65001 >nul
set "DIR=%~dp0"
echo [1/3] 设置教务系统密码
powershell -NoProfile -ExecutionPolicy Bypass -File "%DIR%MockInterviewSorter.ps1" -Setup
echo [2/3] 设置开机自动运行
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\模拟面试反馈整理.lnk');" ^
  "$s.TargetPath='powershell.exe';" ^
  "$s.Arguments='-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""%DIR%MockInterviewSorter.ps1""';" ^
  "$s.WindowStyle=7; $s.Save()"
echo [3/3] 现在启动
start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%DIR%MockInterviewSorter.ps1"
echo.
echo 完成。桌面上文件名含“模拟面试/面试反馈”的文件会自动整理到 C:\Users\HLT\Desktop\私塾\模拟面试
echo 记录文件：%APPDATA%\MockInterviewSorter\sorter.log
pause
