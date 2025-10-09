@echo off
echo Starting backend server only...

:: Kill processes on port 5000 first
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing existing backend process: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Port 5000 cleared!
timeout /t 1 >nul

echo Starting backend server...
cd /d "D:\FINAL\FYP_DATA"
node src/server.js