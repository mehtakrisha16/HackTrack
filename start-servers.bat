@echo off
echo Killing processes on ports 3000 and 5000...

:: Kill processes on port 3000 (React frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000: %%a
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill processes on port 5000 (Node backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process on port 5000: %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Ports cleared!
timeout /t 2 >nul

echo Starting backend server...
cd /d "D:\FINAL\FYP_DATA"
start "Backend Server" cmd /k "node src/server.js"

echo Waiting for backend to start...
timeout /t 3 >nul

echo Starting frontend...
cd /d "D:\FINAL\final year project"
start "Frontend Dev Server" cmd /k "npm start"

echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause