*** Settings ***
Documentation    Page Navigation and UI Tests for DoganHubStore
Resource         ../resources/common.robot
Suite Setup      Run Keywords    Open Test Browser    AND    Login As User
Suite Teardown   Close Test Browser
Test Tags        ui    pages    regression

*** Test Cases ***
# Authentication Pages
Test Login Page
    [Documentation]    Tests login page functionality and UI elements
    [Tags]    auth    login
    Logout User
    Go To    ${LOGIN_URL}
    Wait For Page Load
    
    # Verify page elements
    Page Should Contain Element    ${EMAIL_FIELD}
    Page Should Contain Element    ${PASSWORD_FIELD}
    Page Should Contain Element    ${SUBMIT_BUTTON}
    Page Should Contain    Sign In
    
    # Test login functionality
    Input Text    ${EMAIL_FIELD}    ${TEST_EMAIL}
    Input Password    ${PASSWORD_FIELD}    ${TEST_PASSWORD}
    Click Element    ${SUBMIT_BUTTON}
    Wait For Dashboard
    Location Should Contain    dashboard

Test Registration Page
    [Documentation]    Tests registration page functionality
    [Tags]    auth    register
    Go To    ${REGISTER_URL}
    Wait For Page Load
    
    # Verify page elements
    Page Should Contain Element    css:input[name="name"]
    Page Should Contain Element    ${EMAIL_FIELD}
    Page Should Contain Element    ${PASSWORD_FIELD}
    Page Should Contain Element    css:input[name="confirmPassword"]
    Page Should Contain Element    ${SUBMIT_BUTTON}
    Page Should Contain    Create Account

# Dashboard Pages
Test Main Dashboard
    [Documentation]    Tests main dashboard page and components
    [Tags]    dashboard    main
    Navigate To Page    /dashboard
    
    # Verify dashboard components
    Verify Component Loaded    css:div[class*="stats-card"]
    Verify Component Loaded    css:div[class*="chart-container"]
    Verify Component Loaded    css:div[class*="activity-feed"]
    Verify Data Grid
    
    # Test responsive design
    Test Mobile View
    Test Tablet View
    Test Desktop View

Test API Dashboard
    [Documentation]    Tests API dashboard page
    [Tags]    dashboard    api
    Navigate To Page    /api-dashboard
    
    # Verify API dashboard components
    Page Should Contain    API Dashboard
    Verify Component Loaded    css:div[class*="api-card"]
    Verify Component Loaded    css:div[class*="module-section"]
    
    # Test view switching
    Click Element    css:button:contains("Pages")
    Wait For Page Load
    Verify Component Loaded    css:div[class*="page-connection"]
    
    Click Element    css:button:contains("Connections")
    Wait For Page Load
    Verify Component Loaded    css:div[class*="connection-matrix"]

# Finance Module Pages
Test Finance Dashboard
    [Documentation]    Tests finance dashboard page
    [Tags]    finance    dashboard
    Navigate To Page    /en/platform/finance/dashboard
    
    # Verify finance components
    Page Should Contain    Finance Dashboard
    Verify Component Loaded    css:div[class*="financial-stats"]
    Verify Component Loaded    css:div[class*="revenue-chart"]
    Verify Data Grid

Test Finance Transactions
    [Documentation]    Tests finance transactions page
    [Tags]    finance    transactions
    Navigate To Page    /finance/transactions
    
    # Verify transactions components
    Page Should Contain    Transactions
    Verify Data Grid
    Verify Component Loaded    ${LOADING_SPINNER}
    
    # Test search functionality
    Search In Data Grid    test transaction
    Wait For Page Load
    
    # Test pagination
    ${pagination_exists}=    Run Keyword And Return Status    Page Should Contain Element    ${PAGINATION}
    Run Keyword If    ${pagination_exists}    Click Element    css:button:contains("Next")

Test Finance Accounts
    [Documentation]    Tests finance accounts page
    [Tags]    finance    accounts
    Navigate To Page    /en/platform/finance/accounts
    
    # Verify accounts components
    Page Should Contain    Accounts
    Verify Data Grid
    Verify Component Loaded    css:div[class*="account-summary"]

# Sales Module Pages
Test Sales Dashboard
    [Documentation]    Tests sales dashboard page
    [Tags]    sales    dashboard
    Navigate To Page    /en/platform/sales/dashboard
    
    # Verify sales components
    Page Should Contain    Sales Dashboard
    Verify Component Loaded    css:div[class*="sales-metrics"]
    Verify Component Loaded    css:div[class*="pipeline-chart"]

Test Sales Leads
    [Documentation]    Tests sales leads page
    [Tags]    sales    leads
    Navigate To Page    /en/platform/sales/leads
    
    # Verify leads components
    Page Should Contain    Leads
    Verify Data Grid
    Verify Component Loaded    css:button:contains("Add Lead")
    
    # Test lead creation modal
    Click Element    css:button:contains("Add Lead")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Page Should Contain Element    css:input[name="leadName"]
    Click Element    ${CLOSE_BUTTON}

Test Sales Deals
    [Documentation]    Tests sales deals page
    [Tags]    sales    deals
    Navigate To Page    /en/platform/sales/deals
    
    # Verify deals components
    Page Should Contain    Deals
    Verify Data Grid
    Verify Component Loaded    css:div[class*="deal-stage"]

Test Sales RFQs
    [Documentation]    Tests sales RFQ page
    [Tags]    sales    rfq
    Navigate To Page    /en/platform/sales/rfqs
    
    # Verify RFQ components
    Page Should Contain    RFQs
    Verify Data Grid
    Verify Component Loaded    css:button:contains("Create RFQ")

# HR Module Pages
Test HR Dashboard
    [Documentation]    Tests HR dashboard page
    [Tags]    hr    dashboard
    Navigate To Page    /en/platform/hr/dashboard
    
    # Verify HR components
    Page Should Contain    HR Dashboard
    Verify Component Loaded    css:div[class*="employee-stats"]
    Verify Component Loaded    css:div[class*="department-chart"]

Test HR Employees
    [Documentation]    Tests HR employees page
    [Tags]    hr    employees
    Navigate To Page    /hr/employees
    
    # Verify employees components
    Page Should Contain    Employees
    Verify Data Grid
    Verify Component Loaded    css:div[class*="user-profile-card"]
    
    # Test employee profile view
    ${first_employee}=    Get Element    css:tbody tr:first-child
    Click Element    ${first_employee}
    Wait Until Element Is Visible    css:div[class*="employee-details"]

Test HR Payroll
    [Documentation]    Tests HR payroll page
    [Tags]    hr    payroll
    Navigate To Page    /en/platform/hr/payroll
    
    # Verify payroll components
    Page Should Contain    Payroll
    Verify Data Grid
    Verify Component Loaded    css:div[class*="payroll-summary"]

# Analytics Module Pages
Test Analytics Dashboard
    [Documentation]    Tests analytics dashboard page
    [Tags]    analytics    dashboard
    Navigate To Page    /en/platform/analytics
    
    # Verify analytics components
    Page Should Contain    Analytics
    Verify Component Loaded    css:div[class*="kpi-card"]
    Verify Component Loaded    css:div[class*="trend-chart"]

Test Analytics Trends
    [Documentation]    Tests analytics trends page
    [Tags]    analytics    trends
    Navigate To Page    /analytics/trends
    
    # Verify trends components
    Page Should Contain    Trend Analysis
    Verify Component Loaded    css:div[class*="forecast-chart"]
    Verify Component Loaded    css:div[class*="insights-panel"]

# Billing Module Pages
Test Billing Dashboard
    [Documentation]    Tests billing dashboard page
    [Tags]    billing    dashboard
    Navigate To Page    /en/platform/billing
    
    # Verify billing components
    Page Should Contain    Billing
    Verify Component Loaded    css:div[class*="subscription-card"]
    Verify Component Loaded    css:div[class*="usage-metrics"]

Test Billing Plans
    [Documentation]    Tests billing plans page
    [Tags]    billing    plans
    Navigate To Page    /billing/plans
    
    # Verify plans components
    Page Should Contain    Plans
    Verify Component Loaded    css:div[class*="plan-card"]
    Verify Component Loaded    css:button:contains("Upgrade")

# Admin Module Pages
Test Admin Licenses
    [Documentation]    Tests admin licenses page
    [Tags]    admin    licenses
    Login As Admin
    Navigate To Page    /admin/licenses
    
    # Verify admin components
    Page Should Contain    License Management
    Verify Data Grid
    Verify Component Loaded    css:button:contains("Send Activation")

Test Admin Users
    [Documentation]    Tests admin users management page
    [Tags]    admin    users
    Navigate To Page    /admin/users
    
    # Verify user management components
    Page Should Contain    User Management
    Verify Data Grid
    Verify Component Loaded    css:button:contains("Add User")

# System Pages
Test Themes Page
    [Documentation]    Tests themes customization page
    [Tags]    system    themes
    Navigate To Page    /en/platform/themes
    
    # Verify themes components
    Page Should Contain    Themes
    Verify Component Loaded    css:div[class*="theme-customizer"]
    Verify Component Loaded    css:div[class*="color-picker"]

Test Settings Page
    [Documentation]    Tests system settings page
    [Tags]    system    settings
    Navigate To Page    /settings
    
    # Verify settings components
    Page Should Contain    Settings
    Verify Component Loaded    css:div[class*="settings-panel"]
    Verify Component Loaded    css:form[class*="settings-form"]

# Workflow Pages
Test Workflows Page
    [Documentation]    Tests workflows management page
    [Tags]    workflows
    Navigate To Page    /workflows
    
    # Verify workflow components
    Page Should Contain    Workflows
    Verify Component Loaded    css:div[class*="workflow-builder"]
    Verify Data Grid

# Component Demo Page
Test Component Demo Page
    [Documentation]    Tests component demonstration page
    [Tags]    demo    components
    Navigate To Page    /demo/components
    
    # Verify demo components
    Page Should Contain    Component Showcase
    Verify Component Loaded    css:div[class*="loading-state"]
    Verify Component Loaded    css:div[class*="error-boundary"]
    Verify Component Loaded    css:div[class*="data-grid"]
    Verify Component Loaded    css:div[class*="enterprise-toolbar"]

# Error Pages
Test 404 Page
    [Documentation]    Tests 404 error page
    [Tags]    error    404
    Navigate To Page    /nonexistent-page
    
    # Verify 404 page
    Page Should Contain    404
    Page Should Contain    Page Not Found
    Verify Component Loaded    css:a[href="/"]

# Performance Tests
Test Page Load Performance
    [Documentation]    Tests page load performance across key pages
    [Tags]    performance
    ${pages}=    Create List    /dashboard    /finance/transactions    /sales/leads    /hr/employees
    FOR    ${page}    IN    @{pages}
        ${load_time}=    Measure Page Load Time    ${page}
        Log    Page ${page} loaded in ${load_time}s
        Should Be True    ${load_time} < 5.0    Page ${page} load time ${load_time}s exceeds threshold
    END

# Accessibility Tests
Test Page Accessibility
    [Documentation]    Tests basic accessibility compliance
    [Tags]    accessibility
    Navigate To Page    /dashboard
    
    # Check for accessibility elements
    Page Should Contain Element    css:nav[role="navigation"]
    Page Should Contain Element    css:main[role="main"]
    Page Should Contain Element    css:button[aria-label]
    Page Should Contain Element    css:input[aria-label]

# Cross-Browser Tests
Test Chrome Browser
    [Documentation]    Tests application in Chrome browser
    [Tags]    browser    chrome
    Close Test Browser
    Set Global Variable    ${BROWSER}    Chrome
    Open Test Browser
    Login As User
    Navigate To Page    /dashboard
    Verify Component Loaded    ${MAIN_CONTENT}

Test Firefox Browser
    [Documentation]    Tests application in Firefox browser
    [Tags]    browser    firefox
    Close Test Browser
    Set Global Variable    ${BROWSER}    Firefox
    Open Test Browser
    Login As User
    Navigate To Page    /dashboard
    Verify Component Loaded    ${MAIN_CONTENT}

Test Edge Browser
    [Documentation]    Tests application in Edge browser
    [Tags]    browser    edge
    Close Test Browser
    Set Global Variable    ${BROWSER}    Edge
    Open Test Browser
    Login As User
    Navigate To Page    /dashboard
    Verify Component Loaded    ${MAIN_CONTENT}

*** Keywords ***
Verify Page Navigation
    [Documentation]    Verifies page navigation works correctly
    [Arguments]    ${from_page}    ${to_page}    ${nav_element}
    Navigate To Page    ${from_page}
    Click Element    ${nav_element}
    Wait Until Location Contains    ${to_page}
    Wait For Page Load

Test Form Submission
    [Documentation]    Tests form submission with validation
    [Arguments]    ${form_data}
    FOR    ${field}    ${value}    IN    &{form_data}
        Fill Form Field    css:input[name="${field}"]    ${value}
    END
    Submit Form
    Verify No Errors

Verify Responsive Navigation
    [Documentation]    Tests responsive navigation menu
    # Test mobile navigation
    Set Window Size    375    667
    Click Element    css:button[aria-label="Menu"]
    Wait Until Element Is Visible    css:nav[class*="mobile-menu"]
    
    # Test desktop navigation
    Set Window Size    1920    1080
    Element Should Be Visible    css:nav[class*="desktop-menu"]