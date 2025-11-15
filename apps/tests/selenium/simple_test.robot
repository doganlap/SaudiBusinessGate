*** Settings ***
Documentation    Simple test to verify application connectivity
Library          SeleniumLibrary

*** Variables ***
${BASE_URL}      http://localhost:3003
${BROWSER}       Chrome

*** Test Cases ***
Test Application Homepage
    [Documentation]    Test that the application homepage loads successfully
    [Tags]             smoke
    Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage")
    Title Should Contain    DoganHub
    Page Should Contain Element    tag:h1
    Page Should Contain    DoganHub Store
    Close Browser

Test Application Health Check
    [Documentation]    Test basic connectivity to the application
    [Tags]             smoke
    Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage")
    Wait Until Page Contains    DoganHub    timeout=10s
    Page Should Not Contain    404
    Page Should Not Contain    Error
    Close Browser