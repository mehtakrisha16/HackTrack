@echo off
echo ========================================
echo   Standalone Opportunity Scraper
echo   Continuous Real-time Data Collection
echo ========================================
echo.
echo Starting scraper service...
echo This will run continuously and collect data every 2 hours
echo Press Ctrl+C to stop the service
echo.

cd /d "d:\FINAL\FYP_DATA"

REM Install dependencies if not already installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start the standalone scraper service
echo Starting standalone scraper service...
node src/services/standaloneScraper.js

pause