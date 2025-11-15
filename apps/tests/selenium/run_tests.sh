#!/bin/bash

# DoganHubStore Selenium Test Runner
# Usage: ./run_tests.sh [options]

set -e

# Default configuration
TEST_ENV="local"
BROWSER="Chrome"
HEADLESS="false"
PARALLEL="false"
CLEANUP="true"
TAGS=""
SUITE=""
OUTPUT_DIR="reports"
LOG_LEVEL="INFO"

# Colors for output
RED='\033[0;91m'
GREEN='\033[0;92m'
YELLOW='\033[0;93m'
BLUE='\033[0;94m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "DoganHubStore Selenium Test Runner"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV          Test environment (local, staging, production)"
    echo "  -b, --browser BROWSER  Browser to use (Chrome, Firefox, Edge)"
    echo "  -h, --headless         Run in headless mode"
    echo "  -p, --parallel         Run tests in parallel"
    echo "  -t, --tags TAGS        Run tests with specific tags"
    echo "  -s, --suite SUITE      Run specific test suite"
    echo "  -o, --output DIR       Output directory for reports"
    echo "  -l, --log LEVEL        Log level (DEBUG, INFO, WARNING, ERROR)"
    echo "  -c, --no-cleanup       Skip test data cleanup"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests locally"
    echo "  $0 -e staging -b Firefox -h          # Run on staging with Firefox headless"
    echo "  $0 -t api -p                         # Run API tests in parallel"
    echo "  $0 -s sales_cycle                    # Run sales cycle test suite"
    echo "  $0 -t critical --no-cleanup          # Run critical tests without cleanup"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            TEST_ENV="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--headless)
            HEADLESS="true"
            shift
            ;;
        -p|--parallel)
            PARALLEL="true"
            shift
            ;;
        -t|--tags)
            TAGS="$2"
            shift 2
            ;;
        -s|--suite)
            SUITE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -l|--log)
            LOG_LEVEL="$2"
            shift 2
            ;;
        -c|--no-cleanup)
            CLEANUP="false"
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validation
if [[ ! "$TEST_ENV" =~ ^(local|staging|production)$ ]]; then
    print_error "Invalid environment: $TEST_ENV"
    exit 1
fi

if [[ ! "$BROWSER" =~ ^(Chrome|Firefox|Edge|Safari)$ ]]; then
    print_error "Invalid browser: $BROWSER"
    exit 1
fi

if [[ ! "$LOG_LEVEL" =~ ^(DEBUG|INFO|WARNING|ERROR)$ ]]; then
    print_error "Invalid log level: $LOG_LEVEL"
    exit 1
fi

# Set up environment variables
export TEST_ENV
export BROWSER
export HEADLESS
export CLEANUP_TEST_DATA=$CLEANUP
export LOG_LEVEL
export REPORT_DIR=$OUTPUT_DIR

print_status "Starting DoganHubStore Selenium Tests"
print_status "Environment: $TEST_ENV"
print_status "Browser: $BROWSER"
print_status "Headless: $HEADLESS"
print_status "Parallel: $PARALLEL"
print_status "Output Directory: $OUTPUT_DIR"

# Check if application is running
if [[ "$TEST_ENV" == "local" ]]; then
    print_status "Checking if application is running locally..."
    if ! curl -f -s http://localhost:3003/health > /dev/null 2>&1; then
        print_warning "Application not running on localhost:3003"
        print_status "Starting application..."
        
        # Check if Docker Compose is available
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d
            sleep 10
        else
            print_error "Application not running and Docker Compose not available"
            print_error "Please start the application manually"
            exit 1
        fi
    else
        print_success "Application is running"
    fi
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Install dependencies if needed
if [[ ! -d "venv" ]]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
fi

print_status "Activating virtual environment..."
source venv/bin/activate

print_status "Installing dependencies..."
pip install -r requirements.txt

# Install WebDriver Manager
print_status "Setting up WebDrivers..."
python3 -c "
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

if '$BROWSER' == 'Chrome':
    ChromeDriverManager().install()
elif '$BROWSER' == 'Firefox':
    GeckoDriverManager().install()
elif '$BROWSER' == 'Edge':
    EdgeChromiumDriverManager().install()
"

# Build Robot Framework command
ROBOT_CMD="robot"

# Add output directory
ROBOT_CMD="$ROBOT_CMD --outputdir $OUTPUT_DIR"

# Add log level
ROBOT_CMD="$ROBOT_CMD --loglevel $LOG_LEVEL"

# Add tags if specified
if [[ -n "$TAGS" ]]; then
    ROBOT_CMD="$ROBOT_CMD --include $TAGS"
fi

# Add suite if specified
if [[ -n "$SUITE" ]]; then
    if [[ "$SUITE" == "api" ]]; then
        ROBOT_CMD="$ROBOT_CMD api_tests/"
    elif [[ "$SUITE" == "pages" ]]; then
        ROBOT_CMD="$ROBOT_CMD page_tests/"
    elif [[ "$SUITE" == "e2e" ]]; then
        ROBOT_CMD="$ROBOT_CMD e2e_tests/"
    elif [[ "$SUITE" == "sales_cycle" ]]; then
        ROBOT_CMD="$ROBOT_CMD e2e_tests/sales_cycle.robot"
    else
        ROBOT_CMD="$ROBOT_CMD --suite $SUITE"
    fi
else
    ROBOT_CMD="$ROBOT_CMD ."
fi

# Add parallel execution if requested
if [[ "$PARALLEL" == "true" ]]; then
    print_status "Running tests in parallel..."
    ROBOT_CMD="pabot --processes 4 $(echo $ROBOT_CMD | sed 's/robot//')"
fi

# Add variables
ROBOT_CMD="$ROBOT_CMD --variable BROWSER:$BROWSER"
ROBOT_CMD="$ROBOT_CMD --variable HEADLESS:$HEADLESS"
ROBOT_CMD="$ROBOT_CMD --variable TEST_ENV:$TEST_ENV"

print_status "Running command: $ROBOT_CMD"

# Run tests
START_TIME=$(date +%s)

if eval $ROBOT_CMD; then
    EXIT_CODE=0
    print_success "Tests completed successfully"
else
    EXIT_CODE=$?
    print_error "Tests failed with exit code $EXIT_CODE"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

print_status "Test execution completed in ${DURATION} seconds"

# Generate reports
print_status "Generating test reports..."

# Combine reports if parallel execution was used
if [[ "$PARALLEL" == "true" && $EXIT_CODE -eq 0 ]]; then
    rebot --outputdir $OUTPUT_DIR $OUTPUT_DIR/pabot_results/*.xml
fi

# Create HTML report with custom styling
python3 -c "
import os
from datetime import datetime

report_path = '$OUTPUT_DIR/report.html'
if os.path.exists(report_path):
    with open(report_path, 'r') as f:
        content = f.read()
    
    # Add custom CSS
    custom_css = '''
    <style>
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .test.pass { background-color: #d4edda; }
    .test.fail { background-color: #f8d7da; }
    .keyword { font-family: monospace; }
    </style>
    '''
    
    content = content.replace('</head>', custom_css + '</head>')
    
    with open(report_path, 'w') as f:
        f.write(content)
    
    print('Custom styling applied to report')
"

# Create summary report
TOTAL_TESTS=$(grep -c "class=\"test " "$OUTPUT_DIR/report.html" 2>/dev/null || echo "0")
PASSED_TESTS=$(grep -c "class=\"test pass" "$OUTPUT_DIR/report.html" 2>/dev/null || echo "0")
FAILED_TESTS=$(grep -c "class=\"test fail" "$OUTPUT_DIR/report.html" 2>/dev/null || echo "0")

cat > "$OUTPUT_DIR/summary.txt" << EOF
DoganHubStore Test Execution Summary
=====================================
Date: $(date)
Environment: $TEST_ENV
Browser: $BROWSER
Duration: ${DURATION}s

Results:
--------
Total Tests: $TOTAL_TESTS
Passed: $PASSED_TESTS
Failed: $FAILED_TESTS
Success Rate: $(( PASSED_TESTS * 100 / (TOTAL_TESTS > 0 ? TOTAL_TESTS : 1) ))%

Reports:
--------
HTML Report: $OUTPUT_DIR/report.html
Log File: $OUTPUT_DIR/log.html
Output XML: $OUTPUT_DIR/output.xml
EOF

print_status "Test summary:"
cat "$OUTPUT_DIR/summary.txt"

# Send notifications if configured
if [[ -n "$SLACK_WEBHOOK" ]]; then
    print_status "Sending Slack notification..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"DoganHubStore Tests: $PASSED_TESTS/$TOTAL_TESTS passed\"}" \
        "$SLACK_WEBHOOK"
fi

# Cleanup if requested
if [[ "$CLEANUP" == "true" ]]; then
    print_status "Cleaning up test data..."
    python3 -c "
from libraries.DatabaseLibrary import DatabaseLibrary
db = DatabaseLibrary()
try:
    db.connect_to_database()
    db.cleanup_test_tables()
    db.disconnect_from_database()
    print('Test data cleanup completed')
except Exception as e:
    print(f'Cleanup failed: {e}')
"
fi

# Archive old reports
ARCHIVE_DIR="$OUTPUT_DIR/archive"
mkdir -p "$ARCHIVE_DIR"

if [[ $(find "$OUTPUT_DIR" -name "*.html" -mtime +7 | wc -l) -gt 0 ]]; then
    print_status "Archiving old reports..."
    find "$OUTPUT_DIR" -name "*.html" -mtime +7 -exec mv {} "$ARCHIVE_DIR/" \;
fi

print_status "Test execution completed"
print_status "Reports available in: $OUTPUT_DIR"

# Open report in browser if running locally
if [[ "$TEST_ENV" == "local" && "$HEADLESS" == "false" ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$OUTPUT_DIR/report.html"
    elif command -v open &> /dev/null; then
        open "$OUTPUT_DIR/report.html"
    fi
fi

exit $EXIT_CODE