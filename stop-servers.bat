@echo off
echo Stopping all HackTrack servers...

:: Kill processes on port 3000 (React frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing frontend process: %%a
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill processes on port 5000 (Node backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing backend process: %%a
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill any node processes related to our project
taskkill /IM "node.exe" /F >nul 2>&1
taskkill /IM "npm.exe" /F >nul 2>&1

echo All servers stopped!
pause