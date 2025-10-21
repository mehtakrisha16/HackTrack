# PowerShell script to run the standalone scraper as a background service
param(
    [switch]$Start,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Restart
)

$ScriptPath = "d:\FINAL\FYP_DATA\src\services\standaloneScraper.js"
$LogPath = "d:\FINAL\FYP_DATA\logs\scraper-service.log"
$PidFile = "d:\FINAL\FYP_DATA\scraper.pid"

function Start-ScraperService {
    Write-Host "🚀 Starting Standalone Opportunity Scraper Service..." -ForegroundColor Green
    
    # Check if already running
    if (Test-Path $PidFile) {
        $pid = Get-Content $PidFile -ErrorAction SilentlyContinue
        if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️ Scraper service is already running (PID: $pid)" -ForegroundColor Yellow
            return
        }
    }

    # Ensure directories exist
    $LogDir = Split-Path $LogPath -Parent
    if (!(Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }

    # Change to the correct directory
    Set-Location "d:\FINAL\FYP_DATA"

    # Install dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
        npm install
    }

    # Start the service as a background job
    $job = Start-Job -ScriptBlock {
        param($ScriptPath, $LogPath)
        Set-Location "d:\FINAL\FYP_DATA"
        node $ScriptPath 2>&1 | Tee-Object -FilePath $LogPath -Append
    } -ArgumentList $ScriptPath, $LogPath

    # Save the process ID
    $job.Id | Out-File $PidFile

    Write-Host "✅ Scraper service started successfully!" -ForegroundColor Green
    Write-Host "   Job ID: $($job.Id)" -ForegroundColor Cyan
    Write-Host "   Log file: $LogPath" -ForegroundColor Cyan
    Write-Host "   Scraping every 2 hours automatically" -ForegroundColor Cyan
    Write-Host "   Use -Status to check status, -Stop to stop service" -ForegroundColor Cyan
}

function Stop-ScraperService {
    Write-Host "🛑 Stopping Scraper Service..." -ForegroundColor Red
    
    if (Test-Path $PidFile) {
        $jobId = Get-Content $PidFile -ErrorAction SilentlyContinue
        if ($jobId) {
            $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
            if ($job) {
                Stop-Job -Job $job
                Remove-Job -Job $job -Force
                Write-Host "✅ Scraper service stopped" -ForegroundColor Green
            }
        }
        Remove-Item $PidFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️ No scraper service found running" -ForegroundColor Yellow
    }
}

function Get-ScraperStatus {
    Write-Host "📊 Scraper Service Status" -ForegroundColor Blue
    Write-Host "========================" -ForegroundColor Blue

    if (Test-Path $PidFile) {
        $jobId = Get-Content $PidFile -ErrorAction SilentlyContinue
        if ($jobId) {
            $job = Get-Job -Id $jobId -ErrorAction SilentlyContinue
            if ($job) {
                Write-Host "Status: $($job.State)" -ForegroundColor Green
                Write-Host "Job ID: $jobId" -ForegroundColor Cyan
                Write-Host "Started: $($job.PSBeginTime)" -ForegroundColor Cyan
                
                # Show recent log entries
                if (Test-Path $LogPath) {
                    Write-Host "`nRecent Log Entries:" -ForegroundColor Yellow
                    Get-Content $LogPath -Tail 10 | ForEach-Object { 
                        Write-Host "  $_" -ForegroundColor Gray 
                    }
                }
            } else {
                Write-Host "Status: Not Running (Job not found)" -ForegroundColor Red
                Remove-Item $PidFile -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "Status: Not Running" -ForegroundColor Red
    }
    
    # Database connection status
    Write-Host "`n🗄️ Checking Database Status..." -ForegroundColor Blue
    try {
        Set-Location "d:\FINAL\FYP_DATA"
        $dbCheck = node -e "
            const mongoose = require('mongoose');
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hacktrack';
            mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
                .then(() => { 
                    console.log('Database: Connected'); 
                    process.exit(0); 
                })
                .catch(err => { 
                    console.log('Database: Connection failed -', err.message); 
                    process.exit(1); 
                });
        "
        Write-Host $dbCheck -ForegroundColor Green
    } catch {
        Write-Host "❌ Database: Connection test failed" -ForegroundColor Red
    }
}

function Restart-ScraperService {
    Write-Host "🔄 Restarting Scraper Service..." -ForegroundColor Yellow
    Stop-ScraperService
    Start-Sleep -Seconds 3
    Start-ScraperService
}

# Main script logic
if ($Start) {
    Start-ScraperService
} elseif ($Stop) {
    Stop-ScraperService  
} elseif ($Status) {
    Get-ScraperStatus
} elseif ($Restart) {
    Restart-ScraperService
} else {
    Write-Host "🤖 Standalone Opportunity Scraper Service Manager" -ForegroundColor Magenta
    Write-Host "================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\scraper-service.ps1 -Start    : Start the scraper service" -ForegroundColor Green
    Write-Host "  .\scraper-service.ps1 -Stop     : Stop the scraper service" -ForegroundColor Red
    Write-Host "  .\scraper-service.ps1 -Status   : Check service status" -ForegroundColor Blue
    Write-Host "  .\scraper-service.ps1 -Restart  : Restart the scraper service" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The service will:" -ForegroundColor Cyan
    Write-Host "  • Scrape 100 opportunities from each of 15+ companies" -ForegroundColor Cyan
    Write-Host "  • Run automatically every 2 hours" -ForegroundColor Cyan  
    Write-Host "  • Clean old data twice daily" -ForegroundColor Cyan
    Write-Host "  • Work independently of your main website" -ForegroundColor Cyan
    Write-Host "  • Save data directly to MongoDB database" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Quick start: .\scraper-service.ps1 -Start" -ForegroundColor Green
}