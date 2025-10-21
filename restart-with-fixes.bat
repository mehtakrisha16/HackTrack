@echo off
echo ========================================
echo    RESTARTING SERVERS WITH FIXES
echo ========================================
echo.
echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting backend server...
cd FYP_DATA
start "Backend Server" cmd /k "npm start"

echo.
echo Waiting 5 seconds for backend...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend React app...
cd ..\fyp
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo    SERVERS STARTING...
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Check the new windows for server output!
echo Press any key to exit this window...
pause >nul
