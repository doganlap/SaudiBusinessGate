# Selenium Robot Framework Test Suite for DoganHubStore

This comprehensive test suite provides automated testing for the DoganHubStore application using Selenium WebDriver and Robot Framework.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ (for running the application)
- Docker & Docker Compose (optional, for containerized testing)
- Chrome, Firefox, or Edge browser

### Installation

1. **Clone and setup:**
```bash
cd tests/selenium
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt
```

2. **Run tests:**
```bash
# Linux/Mac
./run_tests.sh

# Windows
run_tests.bat
```

## 📊 Test Coverage

### 🔌 API Tests (`api_tests/`)
- **17 API Endpoints** across all modules
- **Authentication & Authorization** testing
- **Error Handling** validation
- **Performance** monitoring
- **Data Validation** checks
- **Rate Limiting** tests

#### Covered APIs:
- Dashboard: `/api/dashboard/stats`, `/api/dashboard/activity`
- Finance: `/api/finance/transactions`, `/api/finance/accounts`, `/api/finance/stats`
- Sales: `/api/sales/leads`, `/api/sales/deals`, `/api/sales/rfqs`
- HR: `/api/hr/employees`, `/api/hr/payroll`
- Analytics: `/api/analytics/kpis/business`, `/api/analytics/trend-analysis`
- Auth: `/api/auth/me`, `/api/auth/login`
- Billing: `/api/billing/plans`, `/api/billing/send-activation`
- System: `/api/themes/demo-org`
- Workflows: `/api/workflows`

### 🖥️ Page Tests (`page_tests/`)
- **83+ Pages** tested across all modules
- **UI Component** validation
- **Navigation** testing
- **Form Submission** validation
- **Responsive Design** testing
- **Cross-Browser** compatibility
- **Accessibility** checks

#### Key Pages Tested:
- Authentication: Login, Registration
- Dashboard: Main Dashboard, API Dashboard
- Finance: Transactions, Accounts, Dashboard
- Sales: Leads, Deals, RFQs, Dashboard
- HR: Employees, Payroll, Dashboard
- Analytics: Dashboard, Trends
- Admin: Licenses, Users
- System: Themes, Settings

### 🔄 End-to-End Tests (`e2e_tests/`)
- **Complete Sales Cycle** testing
- **Lead Management** workflow
- **Deal Pipeline** management
- **RFQ Creation & Approval**
- **Customer Journey** tracking
- **Sales Reporting** validation
- **Finance Integration** testing

## 🛠️ Test Configuration

### Environment Variables
```bash
# Test Environment
TEST_ENV=local|staging|production

# Browser Configuration
BROWSER=Chrome|Firefox|Edge
HEADLESS=true|false
WINDOW_SIZE=1920x1080

# Application URLs
BASE_URL=http://localhost:3003
API_BASE_URL=http://localhost:3003/api

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doganhubstore
DB_USER=postgres
DB_PASSWORD=postgres

# Test Data
CLEANUP_TEST_DATA=true|false
GENERATE_MOCK_DATA=true|false

# Performance Thresholds
PAGE_LOAD_THRESHOLD=5.0
API_RESPONSE_THRESHOLD=2.0

# Reporting
REPORT_DIR=reports
SCREENSHOTS=true|false
LOG_LEVEL=INFO|DEBUG|WARNING|ERROR
```

### Test Users
```python
TEST_USERS = {
    'standard_user': {'email': 'test@doganhubstore.com', 'password': 'TestPassword123!'},
    'admin_user': {'email': 'admin@doganhubstore.com', 'password': 'AdminPassword123!'},
    'sales_user': {'email': 'sales@doganhubstore.com', 'password': 'SalesPassword123!'},
    'finance_user': {'email': 'finance@doganhubstore.com', 'password': 'FinancePassword123!'}
}
```

## 🎯 Running Tests

### Basic Commands
```bash
# Run all tests
./run_tests.sh

# Run specific test suite
./run_tests.sh -s api          # API tests only
./run_tests.sh -s pages        # Page tests only  
./run_tests.sh -s e2e          # End-to-end tests only
./run_tests.sh -s sales_cycle  # Sales cycle tests only

# Run tests with specific tags
./run_tests.sh -t critical     # Critical tests only
./run_tests.sh -t api          # API-tagged tests
./run_tests.sh -t dashboard    # Dashboard tests
./run_tests.sh -t sales        # Sales module tests

# Environment-specific testing
./run_tests.sh -e staging -b Firefox -h    # Staging with Firefox headless
./run_tests.sh -e production -t critical   # Production critical tests

# Parallel execution
./run_tests.sh -p -t regression            # Parallel regression tests

# Custom configuration
./run_tests.sh -b Edge -o custom_reports -l DEBUG
```

### Windows Commands
```cmd
REM Run all tests
run_tests.bat

REM Run specific test suite
run_tests.bat -s api
run_tests.bat -s pages
run_tests.bat -s e2e

REM Run with specific tags
run_tests.bat -t critical
run_tests.bat -t api

REM Environment-specific
run_tests.bat -e staging -b Firefox -h
run_tests.bat -e production -t critical

REM Parallel execution
run_tests.bat -p -t regression
```

## 📋 Test Structure

### Resource Files
- **`common.robot`**: Shared keywords and variables
- **`APILibrary.py`**: Custom API testing library
- **`DatabaseLibrary.py`**: Database operations library
- **`test_config.py`**: Configuration management

### Test Suites
```
tests/selenium/
├── api_tests/
│   └── api_endpoints.robot      # API endpoint testing
├── page_tests/
│   └── page_navigation.robot    # Page and UI testing
├── e2e_tests/
│   └── sales_cycle.robot        # End-to-end workflows
├── resources/
│   └── common.robot             # Shared resources
├── libraries/
│   ├── APILibrary.py            # API testing utilities
│   └── DatabaseLibrary.py       # Database utilities
├── config/
│   └── test_config.py           # Configuration
├── requirements.txt             # Python dependencies
├── run_tests.sh                 # Linux/Mac test runner
└── run_tests.bat                # Windows test runner
```

## 🔍 Test Features

### Advanced Testing Capabilities
- **Cross-Browser Testing**: Chrome, Firefox, Edge support
- **Responsive Testing**: Mobile, tablet, desktop viewports
- **Performance Testing**: Page load time monitoring
- **Accessibility Testing**: WCAG compliance checks
- **Security Testing**: XSS, SQL injection, CSRF protection
- **Load Testing**: Concurrent user simulation
- **Visual Testing**: Screenshot comparison
- **API Testing**: Request/response validation

### Test Data Management
- **Mock Data Generation**: Faker library integration
- **Test Data Cleanup**: Automatic cleanup after tests
- **Database Backup/Restore**: Test data preservation
- **Parallel Execution**: Multi-process test running

### Reporting & Analytics
- **HTML Reports**: Detailed test execution reports
- **Screenshot Capture**: On failure and on demand
- **Performance Metrics**: Load time and response time tracking
- **Test Execution Summary**: Pass/fail statistics
- **Custom Styling**: Enhanced report presentation

## 🎨 Custom Keywords

### Browser Management
```robot
Open Test Browser    ${url}              # Opens browser with optimal settings
Close Test Browser                       # Closes browser and cleanup
Wait For Page Load                       # Waits for complete page load
```

### Authentication
```robot
Login As User        ${email}  ${password}    # User login
Login As Admin                               # Admin login
Logout User                                  # User logout
```

### API Testing
```robot
Create API Session   ${token}                # Creates authenticated API session
Test API Endpoint    ${method}  ${endpoint}  # Tests API with validation
Authenticate User    ${email}  ${password}   # API authentication
```

### Form Handling
```robot
Fill Form Field      ${locator}  ${value}    # Fills and validates form field
Submit Form                                  # Submits form with wait
Test Form Submission ${form_data}            # Complete form testing
```

### Component Testing
```robot
Verify Component Loaded    ${selector}       # Verifies component presence
Test Loading State         ${action}         # Tests loading indicators
Test Error Boundary        ${error_trigger}  # Tests error handling
Verify Data Grid                            # Validates data grid functionality
```

### Performance Testing
```robot
Measure Page Load Time     ${url}           # Measures and validates load time
Test Mobile View                            # Tests mobile responsiveness
Test Tablet View                            # Tests tablet responsiveness
Test Desktop View                           # Tests desktop layout
```

## 📊 Reporting

### Generated Reports
- **`report.html`**: Main HTML test report with custom styling
- **`log.html`**: Detailed execution log
- **`output.xml`**: XML output for CI/CD integration
- **`summary.txt`**: Execution summary

### Report Features
- **Test Execution Timeline**: Visual execution flow
- **Pass/Fail Statistics**: Success rate metrics
- **Performance Metrics**: Load time and response time data
- **Screenshots**: Failure screenshots and on-demand captures
- **Custom Styling**: Enhanced visual presentation
- **Archive Management**: Automatic old report archiving

## 🔧 Configuration Options

### Browser Options
```python
BROWSER_CONFIG = {
    'browser': 'Chrome|Firefox|Edge',
    'headless': True|False,
    'window_size': '1920x1080',
    'implicit_wait': 10,
    'page_load_timeout': 30
}
```

### Performance Thresholds
```python
PERFORMANCE_THRESHOLDS = {
    'page_load_time': 5.0,
    'api_response_time': 2.0,
    'search_response_time': 1.0
}
```

### Module Configuration
```python
MODULE_CONFIG = {
    'dashboard': {'enabled': True, 'critical_tests': ['Test Main Dashboard']},
    'finance': {'enabled': True, 'critical_tests': ['Test Finance Transactions']},
    'sales': {'enabled': True, 'critical_tests': ['Test Complete Sales Cycle']},
    # ... other modules
}
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Selenium Tests
  run: |
    cd tests/selenium
    ./run_tests.sh -e staging -h -t critical
    
- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: tests/selenium/reports/
```

### Jenkins Pipeline
```groovy
stage('Selenium Tests') {
    steps {
        sh 'cd tests/selenium && ./run_tests.sh -e staging -h -p'
        publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'tests/selenium/reports',
            reportFiles: 'report.html',
            reportName: 'Selenium Test Report'
        ])
    }
}
```

## 📈 Best Practices

### Test Organization
- **Tag-based execution**: Use tags for test categorization
- **Modular design**: Separate concerns in different files
- **Reusable keywords**: Common functionality in shared resources
- **Data-driven testing**: Parameterized test cases

### Performance Optimization
- **Parallel execution**: Use pabot for faster test runs
- **Smart waits**: Explicit waits over implicit waits
- **Resource cleanup**: Always clean up test data
- **Browser optimization**: Headless mode for CI/CD

### Maintenance
- **Regular updates**: Keep dependencies updated
- **Test review**: Regular review of test effectiveness
- **Documentation**: Keep documentation synchronized
- **Monitoring**: Track test execution metrics

## 🔍 Troubleshooting

### Common Issues
1. **WebDriver Issues**: Use WebDriver Manager for automatic updates
2. **Element Not Found**: Improve element locators and waits
3. **Timeout Errors**: Adjust timeout values in configuration
4. **Database Connection**: Verify database credentials and connectivity
5. **API Authentication**: Check token generation and headers

### Debug Mode
```bash
# Enable debug logging
./run_tests.sh -l DEBUG

# Run with console output
./run_tests.sh -l DEBUG --no-cleanup
```

### Viewing Test Results
- Open `reports/report.html` in browser for detailed results
- Check `reports/log.html` for execution logs
- Review `reports/summary.txt` for quick overview
- Screenshots available in `reports/` directory for failures

This comprehensive Selenium Robot Framework test suite provides complete automated testing coverage for the DoganHubStore application, ensuring quality and reliability across all modules and functionalities.