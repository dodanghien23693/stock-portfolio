@echo off
echo 🐍 Python Service API Test
echo ========================

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM Check if curl is available
where curl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ curl not found! Using PowerShell instead...
    
    REM Fallback to PowerShell
    echo 🔄 Testing with PowerShell...
    powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8001/health' -Method Get -TimeoutSec 5; Write-Host '✅ Python Service is running!' -ForegroundColor Green; Write-Host ($response | ConvertTo-Json) } catch { Write-Host '❌ Python Service not responding!' -ForegroundColor Red; Write-Host $_.Exception.Message }"
    pause
    exit /b 0
)

REM Set default values
set STOCK_SYMBOL=%1
if "%STOCK_SYMBOL%"=="" set STOCK_SYMBOL=VCB

set PERIOD=%2
if "%PERIOD%"=="" set PERIOD=1Y

echo 📊 Testing with Symbol: %STOCK_SYMBOL%
echo ⏱️  Testing with Period: %PERIOD%
echo.

REM Run the Node.js test script
node test-python-api.js %STOCK_SYMBOL% %PERIOD% %3

echo.
echo 💡 Usage: test-python-api.bat [SYMBOL] [PERIOD] [--include-post]
echo    Example: test-python-api.bat VNM 6M --include-post
echo.
echo 🌐 Web UI: http://localhost:3000/python-service/test
pause
