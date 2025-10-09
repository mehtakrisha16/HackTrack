@echo off
eecho Starting frontend server...
cd /d "D:\FINAL\fyp"
npm start Starting frontend server only...

:: Kill processes on port 3000 first
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing existing frontend process: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Port 3000 cleared!
timeout /t 1 >nul

echo Starting frontend server...
cd /d "D:\FINAL\final year project"
npm start