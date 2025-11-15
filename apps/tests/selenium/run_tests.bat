@echo off
setlocal enabledelayedexpansion

REM DoganHubStore Selenium Test Runner for Windows
REM Usage: run_tests.bat [options]

REM Default configuration
set "TEST_ENV=local"
set "BROWSER=Chrome"
set "HEADLESS=false"
set "PARALLEL=false"
set "CLEANUP=true"
set "TAGS="
set "SUITE="
set "OUTPUT_DIR=reports"
set "LOG_LEVEL=INFO"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse
if "%~1"=="-e" (
    set "TEST_ENV=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--env" (
    set "TEST_ENV=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-b" (
    set "BROWSER=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--browser" (
    set "BROWSER=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    set "HEADLESS=true"
    shift
    goto :parse_args
)
if "%~1"=="--headless" (
    set "HEADLESS=true"
    shift
    goto :parse_args
)
if "%~1"=="-p" (
    set "PARALLEL=true"
    shift
    goto :parse_args
)
if "%~1"=="--parallel" (
    set "PARALLEL=true"
    shift
    goto :parse_args
)
if "%~1"=="-t" (
    set "TAGS=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--tags" (
    set "TAGS=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-s" (
    set "SUITE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--suite" (
    set "SUITE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-o" (
    set "OUTPUT_DIR=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--output" (
    set "OUTPUT_DIR=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-l" (
    set "LOG_LEVEL=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--log" (
    set "LOG_LEVEL=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-c" (
    set "CLEANUP=false"
    shift
    goto :parse_args
)
if "%~1"=="--no-cleanup" (
    set "CLEANUP=false"
    shift
    goto :parse_args
)
if "%~1"=="--help" (
    goto :show_usage
)
echo Unknown option: %~1
goto :show_usage

:end_parse

REM Set up environment variables
set TEST_ENV=%TEST_ENV%
set BROWSER=%BROWSER%
set HEADLESS=%HEADLESS%
set CLEANUP_TEST_DATA=%CLEANUP%
set LOG_LEVEL=%LOG_LEVEL%
set REPORT_DIR=%OUTPUT_DIR%

echo [INFO] Starting DoganHubStore Selenium Tests
echo [INFO] Environment: %TEST_ENV%
echo [INFO] Browser: %BROWSER%
echo [INFO] Headless: %HEADLESS%
echo [INFO] Parallel: %PARALLEL%
echo [INFO] Output Directory: %OUTPUT_DIR%

REM Check if application is running (local environment)
if "%TEST_ENV%"=="local" (
    echo [INFO] Checking if application is running locally...
    curl -f -s http://localhost:3003/health >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Application not running on localhost:3003
        echo [INFO] Starting application with Docker Compose...
        docker-compose up -d
        timeout /t 10 /nobreak >nul
    ) else (
        echo [SUCCESS] Application is running
    )
)

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing dependencies...
pip install -r requirements.txt

REM Install WebDriver Manager
echo [INFO] Setting up WebDrivers...
python -c "from webdriver_manager.chrome import ChromeDriverManager; from webdriver_manager.firefox import GeckoDriverManager; from webdriver_manager.microsoft import EdgeChromiumDriverManager; import sys; ChromeDriverManager().install() if '%BROWSER%'=='Chrome' else GeckoDriverManager().install() if '%BROWSER%'=='Firefox' else EdgeChromiumDriverManager().install() if '%BROWSER%'=='Edge' else None"

REM Build Robot Framework command
set "ROBOT_CMD=robot --outputdir %OUTPUT_DIR% --loglevel %LOG_LEVEL%"

REM Add tags if specified
if not "%TAGS%"=="" (
    set "ROBOT_CMD=%ROBOT_CMD% --include %TAGS%"
)

REM Add suite if specified
if not "%SUITE%"=="" (
    if "%SUITE%"=="api" (
        set "ROBOT_CMD=%ROBOT_CMD% api_tests\"
    ) else if "%SUITE%"=="pages" (
        set "ROBOT_CMD=%ROBOT_CMD% page_tests\"
    ) else if "%SUITE%"=="e2e" (
        set "ROBOT_CMD=%ROBOT_CMD% e2e_tests\"
    ) else if "%SUITE%"=="sales_cycle" (
        set "ROBOT_CMD=%ROBOT_CMD% e2e_tests\sales_cycle.robot"
    ) else (
        set "ROBOT_CMD=%ROBOT_CMD% --suite %SUITE%"
    )
) else (
    set "ROBOT_CMD=%ROBOT_CMD% ."
)

REM Add parallel execution if requested
if "%PARALLEL%"=="true" (
    echo [INFO] Running tests in parallel...
    set "ROBOT_CMD=pabot --processes 4 --outputdir %OUTPUT_DIR% --loglevel %LOG_LEVEL%"
    if not "%TAGS%"=="" set "ROBOT_CMD=!ROBOT_CMD! --include %TAGS%"
    if not "%SUITE%"=="" (
        if "%SUITE%"=="api" (
            set "ROBOT_CMD=!ROBOT_CMD! api_tests\"
        ) else if "%SUITE%"=="pages" (
            set "ROBOT_CMD=!ROBOT_CMD! page_tests\"
        ) else if "%SUITE%"=="e2e" (
            set "ROBOT_CMD=!ROBOT_CMD! e2e_tests\"
        ) else if "%SUITE%"=="sales_cycle" (
            set "ROBOT_CMD=!ROBOT_CMD! e2e_tests\sales_cycle.robot"
        ) else (
            set "ROBOT_CMD=!ROBOT_CMD! --suite %SUITE%"
        )
    ) else (
        set "ROBOT_CMD=!ROBOT_CMD! ."
    )
)

REM Add variables
set "ROBOT_CMD=%ROBOT_CMD% --variable BROWSER:%BROWSER% --variable HEADLESS:%HEADLESS% --variable TEST_ENV:%TEST_ENV%"

echo [INFO] Running command: %ROBOT_CMD%

REM Run tests
set start_time=%time%
%ROBOT_CMD%
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE%==0 (
    echo [SUCCESS] Tests completed successfully
) else (
    echo [ERROR] Tests failed with exit code %EXIT_CODE%
)

set end_time=%time%
echo [INFO] Test execution completed

REM Generate reports
echo [INFO] Generating test reports...

REM Combine reports if parallel execution was used
if "%PARALLEL%"=="true" (
    if %EXIT_CODE%==0 (
        rebot --outputdir %OUTPUT_DIR% %OUTPUT_DIR%\pabot_results\*.xml
    )
)

REM Create summary report
python -c "
import os
import re
from datetime import datetime

output_dir = '%OUTPUT_DIR%'
report_path = os.path.join(output_dir, 'report.html')

total_tests = 0
passed_tests = 0
failed_tests = 0

if os.path.exists(report_path):
    with open(report_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    total_matches = re.findall(r'class=\"test ', content)
    total_tests = len(total_matches)
    
    passed_matches = re.findall(r'class=\"test pass', content)
    passed_tests = len(passed_matches)
    
    failed_matches = re.findall(r'class=\"test fail', content)
    failed_tests = len(failed_matches)

success_rate = (passed_tests * 100 // max(total_tests, 1)) if total_tests > 0 else 0

summary = f'''DoganHubStore Test Execution Summary
=====================================
Date: {datetime.now().strftime('%%Y-%%m-%%d %%H:%%M:%%S')}
Environment: %TEST_ENV%
Browser: %BROWSER%

Results:
--------
Total Tests: {total_tests}
Passed: {passed_tests}
Failed: {failed_tests}
Success Rate: {success_rate}%%

Reports:
--------
HTML Report: {output_dir}/report.html
Log File: {output_dir}/log.html
Output XML: {output_dir}/output.xml
'''

with open(os.path.join(output_dir, 'summary.txt'), 'w') as f:
    f.write(summary)

print(summary)
"

REM Cleanup if requested
if "%CLEANUP%"=="true" (
    echo [INFO] Cleaning up test data...
    python -c "
try:
    import sys
    sys.path.append('.')
    from libraries.DatabaseLibrary import DatabaseLibrary
    db = DatabaseLibrary()
    db.connect_to_database()
    db.cleanup_test_tables()
    db.disconnect_from_database()
    print('Test data cleanup completed')
except Exception as e:
    print(f'Cleanup failed: {e}')
"
)

REM Archive old reports
if not exist "%OUTPUT_DIR%\archive" mkdir "%OUTPUT_DIR%\archive"

echo [INFO] Test execution completed
echo [INFO] Reports available in: %OUTPUT_DIR%

REM Open report in browser if running locally
if "%TEST_ENV%"=="local" (
    if "%HEADLESS%"=="false" (
        start "" "%OUTPUT_DIR%\report.html"
    )
)

exit /b %EXIT_CODE%

:show_usage
echo DoganHubStore Selenium Test Runner for Windows
echo.
echo Usage: %~nx0 [options]
echo.
echo Options:
echo   -e, --env ENV          Test environment (local, staging, production)
echo   -b, --browser BROWSER  Browser to use (Chrome, Firefox, Edge)
echo   -h, --headless         Run in headless mode
echo   -p, --parallel         Run tests in parallel
echo   -t, --tags TAGS        Run tests with specific tags
echo   -s, --suite SUITE      Run specific test suite
echo   -o, --output DIR       Output directory for reports
echo   -l, --log LEVEL        Log level (DEBUG, INFO, WARNING, ERROR)
echo   -c, --no-cleanup       Skip test data cleanup
echo   --help                 Show this help message
echo.
echo Examples:
echo   %~nx0                                    # Run all tests locally
echo   %~nx0 -e staging -b Firefox -h          # Run on staging with Firefox headless
echo   %~nx0 -t api -p                         # Run API tests in parallel
echo   %~nx0 -s sales_cycle                    # Run sales cycle test suite
echo   %~nx0 -t critical --no-cleanup          # Run critical tests without cleanup
exit /b 0