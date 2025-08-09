@echo off
echo ===============================================
echo VNStock API Testing Tool
echo ===============================================

echo.
echo Choose testing option:
echo 1. Quick test only
echo 2. Comprehensive test
echo 3. Advanced test
echo 4. Run all tests
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running quick test...
    python quick_test.py
) else if "%choice%"=="2" (
    echo.
    echo Running comprehensive test...
    python test_all_apis.py
) else if "%choice%"=="3" (
    echo.
    echo Running advanced test...
    python advanced_test.py
) else if "%choice%"=="4" (
    echo.
    echo Running all tests...
    python run_all_tests.py
) else (
    echo.
    echo Invalid choice. Running quick test...
    python quick_test.py
)

echo.
echo Testing completed!
echo.
echo Available files:
echo - API_TEST_REPORT.md: Comprehensive test report
echo - api_test_results.json: Detailed test results
echo - master_test_report.json: Master test execution report
echo.
pause
