@echo off
echo ============================================
echo MongoDB Atlas IP Whitelist Fix
echo ============================================
echo.
echo STEP 1: Opening MongoDB Atlas in browser...
start https://cloud.mongodb.com/v2#/security/network/accessList
echo.
echo STEP 2: Follow these steps:
echo.
echo 1. Login to MongoDB Atlas
echo 2. Click "Network Access" in left sidebar
echo 3. Click "ADD IP ADDRESS" button (green)
echo 4. Click "ALLOW ACCESS FROM ANYWHERE"
echo 5. Click "Confirm"
echo 6. Wait 60 seconds
echo.
echo STEP 3: After adding IP, press any key here to restart servers...
pause
echo.
echo Restarting servers...
echo.
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Starting backend and frontend...
start "Backend" cmd /k "cd D:\FINAL\FYP_DATA && npm start"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd D:\FINAL\fyp && npm start"
echo.
echo ============================================
echo Servers restarted!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 10 seconds, then refresh your login page!
echo ============================================
pause
