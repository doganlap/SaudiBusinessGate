*** Settings ***
Documentation    API Endpoint Tests for DoganHubStore
Resource         ../resources/common.robot
Suite Setup      Create API Session
Suite Teardown   Delete All Sessions
Test Tags        api    regression

*** Test Cases ***
# Dashboard API Tests
Test Dashboard Stats API
    [Documentation]    Tests dashboard statistics endpoint
    [Tags]    dashboard    stats
    ${response}=    Test API Endpoint    GET    /dashboard/stats    200
    Dictionary Should Contain Key    ${response.json()}    totalUsers
    Dictionary Should Contain Key    ${response.json()}    totalRevenue
    Dictionary Should Contain Key    ${response.json()}    activeProjects

Test Dashboard Activity API
    [Documentation]    Tests dashboard activity feed endpoint
    [Tags]    dashboard    activity
    ${response}=    Test API Endpoint    GET    /dashboard/activity    200
    Should Be True    len(${response.json()}) > 0
    Dictionary Should Contain Key    ${response.json()[0]}    timestamp
    Dictionary Should Contain Key    ${response.json()[0]}    activity

# Finance API Tests
Test Finance Transactions API
    [Documentation]    Tests finance transactions endpoint
    [Tags]    finance    transactions
    ${response}=    Test API Endpoint    GET    /finance/transactions    200
    Dictionary Should Contain Key    ${response.json()}    transactions
    Dictionary Should Contain Key    ${response.json()}    totalAmount
    Dictionary Should Contain Key    ${response.json()}    pagination

Test Finance Accounts API
    [Documentation]    Tests finance accounts endpoint
    [Tags]    finance    accounts
    ${response}=    Test API Endpoint    GET    /finance/accounts    200
    Should Be True    len(${response.json()}) > 0
    Dictionary Should Contain Key    ${response.json()[0]}    accountId
    Dictionary Should Contain Key    ${response.json()[0]}    balance

Test Finance Stats API
    [Documentation]    Tests finance statistics endpoint
    [Tags]    finance    stats
    ${response}=    Test API Endpoint    GET    /finance/stats    200
    Dictionary Should Contain Key    ${response.json()}    monthlyRevenue
    Dictionary Should Contain Key    ${response.json()}    expenses
    Dictionary Should Contain Key    ${response.json()}    profit

# Sales API Tests
Test Sales Leads API
    [Documentation]    Tests sales leads endpoint
    [Tags]    sales    leads
    ${response}=    Test API Endpoint    GET    /sales/leads    200
    Dictionary Should Contain Key    ${response.json()}    leads
    Dictionary Should Contain Key    ${response.json()}    totalCount
    Should Be True    len(${response.json()['leads']}) >= 0

Test Sales Deals API
    [Documentation]    Tests sales deals endpoint
    [Tags]    sales    deals
    ${response}=    Test API Endpoint    GET    /sales/deals    200
    Dictionary Should Contain Key    ${response.json()}    deals
    Dictionary Should Contain Key    ${response.json()}    pipelineValue
    Dictionary Should Contain Key    ${response.json()}    stages

Test Sales RFQs API
    [Documentation]    Tests sales RFQ endpoint
    [Tags]    sales    rfq
    ${response}=    Test API Endpoint    GET    /sales/rfqs    200
    Dictionary Should Contain Key    ${response.json()}    rfqs
    Dictionary Should Contain Key    ${response.json()}    status
    Should Be True    len(${response.json()['rfqs']}) >= 0

# HR API Tests
Test HR Employees API
    [Documentation]    Tests HR employees endpoint
    [Tags]    hr    employees
    ${response}=    Test API Endpoint    GET    /hr/employees    200
    Dictionary Should Contain Key    ${response.json()}    employees
    Dictionary Should Contain Key    ${response.json()}    totalCount
    Dictionary Should Contain Key    ${response.json()}    departments

Test HR Payroll API
    [Documentation]    Tests HR payroll endpoint
    [Tags]    hr    payroll
    ${response}=    Test API Endpoint    GET    /hr/payroll    200
    Dictionary Should Contain Key    ${response.json()}    payrollData
    Dictionary Should Contain Key    ${response.json()}    totalPayroll
    Dictionary Should Contain Key    ${response.json()}    period

# Analytics API Tests
Test Analytics Business KPIs API
    [Documentation]    Tests analytics business KPIs endpoint
    [Tags]    analytics    kpis
    ${response}=    Test API Endpoint    GET    /analytics/kpis/business    200
    Dictionary Should Contain Key    ${response.json()}    kpis
    Dictionary Should Contain Key    ${response.json()}    period
    Should Be True    len(${response.json()['kpis']}) > 0

Test Analytics Trend Analysis API
    [Documentation]    Tests analytics trend analysis endpoint
    [Tags]    analytics    trends
    ${response}=    Test API Endpoint    GET    /analytics/trend-analysis    200
    Dictionary Should Contain Key    ${response.json()}    trends
    Dictionary Should Contain Key    ${response.json()}    forecast
    Dictionary Should Contain Key    ${response.json()}    insights

# Auth API Tests
Test Auth Me API
    [Documentation]    Tests authentication user profile endpoint
    [Tags]    auth    profile
    ${response}=    Test API Endpoint    GET    /auth/me    200
    Dictionary Should Contain Key    ${response.json()}    user
    Dictionary Should Contain Key    ${response.json()}    permissions
    Dictionary Should Contain Key    ${response.json()}    preferences

Test Auth Login API
    [Documentation]    Tests authentication login endpoint
    [Tags]    auth    login
    ${login_data}=    Create Dictionary    email=${TEST_EMAIL}    password=${TEST_PASSWORD}
    ${response}=    Test API Endpoint    POST    /auth/login    200    ${login_data}
    Dictionary Should Contain Key    ${response.json()}    token
    Dictionary Should Contain Key    ${response.json()}    user
    Dictionary Should Contain Key    ${response.json()}    expiresIn

# Billing API Tests
Test Billing Plans API
    [Documentation]    Tests billing plans endpoint
    [Tags]    billing    plans
    ${response}=    Test API Endpoint    GET    /billing/plans    200
    Should Be True    len(${response.json()}) > 0
    Dictionary Should Contain Key    ${response.json()[0]}    planId
    Dictionary Should Contain Key    ${response.json()[0]}    price
    Dictionary Should Contain Key    ${response.json()[0]}    features

Test Billing Activation API
    [Documentation]    Tests billing activation endpoint
    [Tags]    billing    activation
    ${activation_data}=    Create Dictionary    licenseKey=TEST-LICENSE-123    email=${TEST_EMAIL}
    ${response}=    Test API Endpoint    POST    /billing/send-activation    200    ${activation_data}
    Dictionary Should Contain Key    ${response.json()}    success
    Dictionary Should Contain Key    ${response.json()}    message

# System API Tests
Test Themes API
    [Documentation]    Tests themes endpoint
    [Tags]    system    themes
    ${response}=    Test API Endpoint    GET    /themes/demo-org    200
    Dictionary Should Contain Key    ${response.json()}    themes
    Dictionary Should Contain Key    ${response.json()}    currentTheme
    Should Be True    len(${response.json()['themes']}) > 0

# Workflows API Tests
Test Workflows API
    [Documentation]    Tests workflows endpoint
    [Tags]    workflows
    ${response}=    Test API Endpoint    GET    /workflows    200
    Dictionary Should Contain Key    ${response.json()}    workflows
    Dictionary Should Contain Key    ${response.json()}    categories
    Should Be True    len(${response.json()['workflows']}) >= 0

# Error Handling Tests
Test API Error Handling 404
    [Documentation]    Tests API 404 error handling
    [Tags]    error    404
    ${response}=    Test API Endpoint    GET    /nonexistent-endpoint    404
    Dictionary Should Contain Key    ${response.json()}    error
    Dictionary Should Contain Key    ${response.json()}    message

Test API Error Handling 401
    [Documentation]    Tests API 401 unauthorized error
    [Tags]    error    401
    Delete All Sessions
    Create Session    api    ${API_BASE_URL}    headers=${API_HEADERS}
    ${response}=    Test API Endpoint    GET    /auth/protected-endpoint    401
    Dictionary Should Contain Key    ${response.json()}    error

Test API Error Handling 500
    [Documentation]    Tests API 500 server error handling
    [Tags]    error    500
    ${response}=    Test API Endpoint    GET    /test/server-error    500
    Dictionary Should Contain Key    ${response.json()}    error
    Dictionary Should Contain Key    ${response.json()}    message

# Performance Tests
Test API Response Times
    [Documentation]    Tests API response times are within acceptable limits
    [Tags]    performance
    ${start_time}=    Get Time    epoch
    ${response}=    Test API Endpoint    GET    /dashboard/stats    200
    ${end_time}=    Get Time    epoch
    ${response_time}=    Evaluate    ${end_time} - ${start_time}
    Should Be True    ${response_time} < 2.0    API response time ${response_time}s exceeds 2s threshold

Test API Rate Limiting
    [Documentation]    Tests API rate limiting functionality
    [Tags]    performance    rate-limit
    FOR    ${i}    IN RANGE    1    11
        ${response}=    Test API Endpoint    GET    /dashboard/stats
        Exit For Loop If    ${response.status_code} == 429
    END
    Should Be Equal As Integers    ${response.status_code}    429

# Data Validation Tests
Test API Data Validation
    [Documentation]    Tests API data validation for required fields
    [Tags]    validation
    ${invalid_data}=    Create Dictionary    email=invalid-email    password=
    ${response}=    Test API Endpoint    POST    /auth/login    400    ${invalid_data}
    Dictionary Should Contain Key    ${response.json()}    errors
    Dictionary Should Contain Key    ${response.json()}    message

Test API Input Sanitization
    [Documentation]    Tests API input sanitization for security
    [Tags]    security    sanitization
    ${malicious_data}=    Create Dictionary    name=<script>alert('xss')</script>    email=${TEST_EMAIL}
    ${response}=    Test API Endpoint    POST    /test/sanitization    200    ${malicious_data}
    Dictionary Should Contain Key    ${response.json()}    sanitizedData
    Should Not Contain    ${response.json()['sanitizedData']['name']}    <script>

*** Keywords ***
Generate Test API Data
    [Documentation]    Generates test data for API testing
    [Arguments]    ${data_type}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    ${data}=    Run Keyword If    '${data_type}' == 'user'    Create Dictionary    
    ...    name=Test User ${timestamp}    
    ...    email=test_${timestamp}@example.com    
    ...    password=TestPassword123!
    ...    ELSE IF    '${data_type}' == 'transaction'    Create Dictionary    
    ...    amount=100.50    
    ...    description=Test Transaction ${timestamp}    
    ...    category=testing
    ...    ELSE    Create Dictionary    id=${timestamp}    name=Test ${data_type} ${timestamp}
    RETURN    ${data}