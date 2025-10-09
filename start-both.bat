@echo off
echo Starting HackTrack Mumbai - Full Application...
echo.

echo Clearing ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /pid %%a /f >nul 2>&1
echo Ports cleared!

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd /d D:\FINAL\FYP_DATA && node src/server.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d D:\FINAL\fyp && npm start"

echo.
echo ✅ Both servers starting!
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000/api
echo.
echo Press any key to close this window...
pause >nul