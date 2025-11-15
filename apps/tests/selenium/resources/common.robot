*** Settings ***
Documentation    DoganHubStore Application Test Configuration
Library          SeleniumLibrary
Library          RequestsLibrary
Library          Collections
Library          String
Library          DateTime
Library          OperatingSystem
Library          ../libraries/APILibrary.py
Library          ../libraries/DatabaseLibrary.py
Variables        ../config/test_config.py

*** Variables ***
# Application URLs
${BASE_URL}              http://localhost:3003
${API_BASE_URL}          ${BASE_URL}/api
${DASHBOARD_URL}         ${BASE_URL}/dashboard
${LOGIN_URL}             ${BASE_URL}/en/login
${REGISTER_URL}          ${BASE_URL}/en/register

# Browser Configuration  
${BROWSER}               Chrome
${HEADLESS}              False
${IMPLICIT_WAIT}         10
${PAGE_LOAD_TIMEOUT}     30
${ELEMENT_TIMEOUT}       15

# Test Data
${TEST_EMAIL}            test@doganhubstore.com
${TEST_PASSWORD}         TestPassword123!
${TEST_USERNAME}         testuser
${ADMIN_EMAIL}           admin@doganhubstore.com
${ADMIN_PASSWORD}        AdminPassword123!

# API Headers
&{API_HEADERS}           Content-Type=application/json    Accept=application/json

# Common Selectors
${LOADING_SPINNER}       css:div[class*="loading"]
${ERROR_MESSAGE}         css:div[class*="error"]
${SUCCESS_MESSAGE}       css:div[class*="success"]
${MODAL_DIALOG}          css:div[role="dialog"]
${CLOSE_BUTTON}          css:button[aria-label="Close"]

# Page Elements
${HEADER_NAVIGATION}     css:nav[role="navigation"]
${SIDEBAR_MENU}          css:aside[class*="sidebar"]
${MAIN_CONTENT}          css:main[role="main"]
${FOOTER_SECTION}        css:footer

# Form Elements
${SUBMIT_BUTTON}         css:button[type="submit"]
${CANCEL_BUTTON}         css:button[type="button"]
${INPUT_FIELD}           css:input[type="text"]
${EMAIL_FIELD}           css:input[type="email"]
${PASSWORD_FIELD}        css:input[type="password"]

# Data Grid Elements
${DATA_GRID}             css:div[class*="data-grid"]
${GRID_HEADER}           css:thead tr
${GRID_ROW}              css:tbody tr
${GRID_CELL}             css:td
${PAGINATION}            css:div[class*="pagination"]

# Navigation Elements
${HOME_LINK}             css:a[href="/"]
${DASHBOARD_LINK}        css:a[href*="/dashboard"]
${PROFILE_LINK}          css:a[href*="/profile"]
${LOGOUT_LINK}           css:a[href*="/logout"]

*** Keywords ***
# Browser Management
Open Test Browser
    [Documentation]    Opens browser with optimal settings for testing
    [Arguments]    ${url}=${BASE_URL}
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    Run Keyword If    ${HEADLESS}    Call Method    ${options}    add_argument    --headless
    Call Method    ${options}    add_argument    --no-sandbox
    Call Method    ${options}    add_argument    --disable-dev-shm-usage
    Call Method    ${options}    add_argument    --disable-gpu
    Call Method    ${options}    add_argument    --window-size=1920,1080
    Create Webdriver    Chrome    options=${options}
    Set Window Size    1920    1080
    Set Browser Implicit Wait    ${IMPLICIT_WAIT}
    Set Browser Page Load Timeout    ${PAGE_LOAD_TIMEOUT}
    Go To    ${url}

Close Test Browser
    [Documentation]    Closes browser and cleans up
    Close All Browsers

# Authentication
Login As User
    [Documentation]    Logs in as regular user
    [Arguments]    ${email}=${TEST_EMAIL}    ${password}=${TEST_PASSWORD}
    Go To    ${LOGIN_URL}
    Wait For Page Load
    Input Text    ${EMAIL_FIELD}    ${email}
    Input Password    ${PASSWORD_FIELD}    ${password}
    Click Element    ${SUBMIT_BUTTON}
    Wait For Dashboard

Login As Admin
    [Documentation]    Logs in as admin user
    Login As User    ${ADMIN_EMAIL}    ${ADMIN_PASSWORD}

Logout User
    [Documentation]    Logs out current user
    Click Element    ${LOGOUT_LINK}
    Wait Until Location Is    ${LOGIN_URL}

# Page Navigation
Wait For Page Load
    [Documentation]    Waits for page to fully load
    Wait Until Element Is Not Visible    ${LOADING_SPINNER}    timeout=${PAGE_LOAD_TIMEOUT}
    Wait Until Page Contains Element    ${MAIN_CONTENT}    timeout=${PAGE_LOAD_TIMEOUT}

Wait For Dashboard
    [Documentation]    Waits for dashboard to load after login
    Wait Until Location Contains    dashboard
    Wait For Page Load

Navigate To Page
    [Documentation]    Navigates to specific page and waits for load
    [Arguments]    ${page_url}
    Go To    ${BASE_URL}${page_url}
    Wait For Page Load

# API Testing
Create API Session
    [Documentation]    Creates API session with authentication
    [Arguments]    ${token}=${EMPTY}
    Create Session    api    ${API_BASE_URL}    headers=${API_HEADERS}
    Run Keyword If    '${token}' != '${EMPTY}'    Set To Dictionary    ${API_HEADERS}    Authorization=Bearer ${token}

Test API Endpoint
    [Documentation]    Tests API endpoint with expected response
    [Arguments]    ${method}    ${endpoint}    ${expected_status}=200    ${data}=${NONE}
    ${response}=    Run Keyword    ${method} Request    api    ${endpoint}    json=${data}
    Should Be Equal As Integers    ${response.status_code}    ${expected_status}
    RETURN    ${response}

# Form Handling
Fill Form Field
    [Documentation]    Fills form field with validation
    [Arguments]    ${locator}    ${value}
    Wait Until Element Is Visible    ${locator}
    Clear Element Text    ${locator}
    Input Text    ${locator}    ${value}
    Element Should Contain    ${locator}    ${value}

Submit Form
    [Documentation]    Submits form and waits for response
    Click Element    ${SUBMIT_BUTTON}
    Wait Until Element Is Not Visible    ${LOADING_SPINNER}

# Data Grid Operations
Verify Data Grid
    [Documentation]    Verifies data grid is loaded and functional
    Wait Until Element Is Visible    ${DATA_GRID}
    Element Should Be Visible    ${GRID_HEADER}
    ${row_count}=    Get Element Count    ${GRID_ROW}
    Should Be True    ${row_count} > 0

Search In Data Grid
    [Documentation]    Performs search in data grid
    [Arguments]    ${search_term}
    Input Text    css:input[placeholder*="Search"]    ${search_term}
    Press Keys    css:input[placeholder*="Search"]    ENTER
    Wait For Page Load

# Error Handling
Verify No Errors
    [Documentation]    Verifies no error messages are displayed
    Element Should Not Be Visible    ${ERROR_MESSAGE}

Handle Expected Error
    [Documentation]    Handles expected error message
    [Arguments]    ${expected_message}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}
    Element Should Contain    ${ERROR_MESSAGE}    ${expected_message}

# Component Testing
Verify Component Loaded
    [Documentation]    Verifies specific component is loaded
    [Arguments]    ${component_selector}
    Wait Until Element Is Visible    ${component_selector}
    Element Should Be Visible    ${component_selector}

Test Loading State
    [Documentation]    Tests loading state component
    [Arguments]    ${trigger_action}
    ${trigger_action}
    Wait Until Element Is Visible    ${LOADING_SPINNER}
    Wait Until Element Is Not Visible    ${LOADING_SPINNER}

Test Error Boundary
    [Documentation]    Tests error boundary component
    [Arguments]    ${error_trigger}
    ${error_trigger}
    Verify Component Loaded    css:div[class*="error-boundary"]

# Responsive Testing
Test Mobile View
    [Documentation]    Tests mobile responsive view
    Set Window Size    375    667
    Wait For Page Load
    Verify Component Loaded    ${MAIN_CONTENT}

Test Tablet View
    [Documentation]    Tests tablet responsive view
    Set Window Size    768    1024
    Wait For Page Load
    Verify Component Loaded    ${MAIN_CONTENT}

Test Desktop View
    [Documentation]    Tests desktop responsive view
    Set Window Size    1920    1080
    Wait For Page Load
    Verify Component Loaded    ${MAIN_CONTENT}

# Performance Testing
Measure Page Load Time
    [Documentation]    Measures page load time
    [Arguments]    ${page_url}
    ${start_time}=    Get Time    epoch
    Navigate To Page    ${page_url}
    ${end_time}=    Get Time    epoch
    ${load_time}=    Evaluate    ${end_time} - ${start_time}
    Should Be True    ${load_time} < 5    Page load time ${load_time}s exceeds 5s threshold
    RETURN    ${load_time}

# Screenshot Utilities
Take Page Screenshot
    [Documentation]    Takes screenshot with timestamp
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Page Screenshot    screenshot_${timestamp}.png

Take Element Screenshot
    [Documentation]    Takes element screenshot
    [Arguments]    ${locator}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Element Screenshot    ${locator}    element_${timestamp}.png

# Test Data Management
Generate Test Data
    [Documentation]    Generates test data for forms
    [Arguments]    ${data_type}
    ${test_data}=    Run Keyword    Generate ${data_type} Data
    RETURN    ${test_data}

Cleanup Test Data
    [Documentation]    Cleans up test data after test
    [Arguments]    ${data_id}
    Delete Test Data    ${data_id}