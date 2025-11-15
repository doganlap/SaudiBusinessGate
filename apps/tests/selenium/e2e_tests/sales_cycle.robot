*** Settings ***
Documentation    End-to-End Sales Cycle Tests for DoganHubStore
Resource         ../resources/common.robot
Suite Setup      Run Keywords    Open Test Browser    AND    Login As User
Suite Teardown   Close Test Browser
Test Tags        e2e    sales    critical

*** Test Cases ***
Test Complete Sales Cycle
    [Documentation]    Tests complete sales cycle from lead to invoice
    [Tags]    sales-cycle    end-to-end
    
    # Step 1: Create Lead
    ${lead_data}=    Generate Test Data    lead
    ${lead_id}=    Create Sales Lead    ${lead_data}
    
    # Step 2: Qualify Lead
    Qualify Sales Lead    ${lead_id}
    
    # Step 3: Convert to Opportunity
    ${opportunity_id}=    Convert Lead To Opportunity    ${lead_id}
    
    # Step 4: Create Proposal/RFQ
    ${rfq_data}=    Generate Test Data    rfq
    ${rfq_id}=    Create RFQ    ${opportunity_id}    ${rfq_data}
    
    # Step 5: Approve RFQ
    Approve RFQ    ${rfq_id}
    
    # Step 6: Convert to Deal
    ${deal_id}=    Convert RFQ To Deal    ${rfq_id}
    
    # Step 7: Close Deal
    Close Deal    ${deal_id}
    
    # Step 8: Generate Invoice
    ${invoice_id}=    Generate Invoice    ${deal_id}
    
    # Step 9: Process Payment
    Process Payment    ${invoice_id}
    
    # Step 10: Verify Complete Cycle
    Verify Sales Cycle Completion    ${lead_id}    ${deal_id}    ${invoice_id}

Test Lead Management Workflow
    [Documentation]    Tests lead management workflow
    [Tags]    lead-management    workflow
    
    # Navigate to leads page
    Navigate To Page    /en/platform/sales/leads
    
    # Create new lead
    Click Element    css:button:contains("Add Lead")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    
    ${lead_data}=    Create Dictionary    
    ...    name=Test Lead Company    
    ...    contact=John Doe    
    ...    email=john@testlead.com    
    ...    phone=+1-555-0123    
    ...    source=Website
    
    Test Form Submission    ${lead_data}
    
    # Verify lead appears in grid
    Wait For Page Load
    Page Should Contain    Test Lead Company
    
    # Edit lead
    Click Element    css:tr:contains("Test Lead Company") button[aria-label="Edit"]
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Fill Form Field    css:input[name="status"]    Qualified
    Submit Form
    
    # Verify lead status updated
    Wait For Page Load
    Page Should Contain    Qualified

Test Deal Pipeline Management
    [Documentation]    Tests deal pipeline management
    [Tags]    deals    pipeline
    
    # Navigate to deals page
    Navigate To Page    /en/platform/sales/deals
    
    # Create new deal
    Click Element    css:button:contains("Create Deal")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    
    ${deal_data}=    Create Dictionary    
    ...    title=Enterprise Software License    
    ...    value=50000    
    ...    stage=Negotiation    
    ...    probability=75    
    ...    closeDate=2025-12-31
    
    Test Form Submission    ${deal_data}
    
    # Verify deal in pipeline
    Wait For Page Load
    Page Should Contain    Enterprise Software License
    Page Should Contain    $50,000
    
    # Move deal through stages
    ${deal_row}=    Get Element    css:tr:contains("Enterprise Software License")
    Click Element    ${deal_row} css:select[name="stage"]
    Select From List By Value    ${deal_row} css:select[name="stage"]    Won
    
    # Verify deal closed
    Wait For Page Load
    Page Should Contain    Won

Test RFQ Creation and Approval
    [Documentation]    Tests RFQ creation and approval workflow
    [Tags]    rfq    approval
    
    # Navigate to RFQ page
    Navigate To Page    /en/platform/sales/rfqs
    
    # Create new RFQ
    Click Element    css:button:contains("Create RFQ")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    
    ${rfq_data}=    Create Dictionary    
    ...    title=Software Development Services    
    ...    description=Custom web application development    
    ...    budget=100000    
    ...    deadline=2025-12-31    
    ...    requirements=Full stack development with React and Node.js
    
    Test Form Submission    ${rfq_data}
    
    # Verify RFQ created
    Wait For Page Load
    Page Should Contain    Software Development Services
    
    # Submit for approval
    Click Element    css:tr:contains("Software Development Services") button:contains("Submit")
    Wait For Page Load
    Page Should Contain    Pending Approval
    
    # Approve RFQ (as admin)
    Login As Admin
    Navigate To Page    /admin/rfq-approvals
    Click Element    css:tr:contains("Software Development Services") button:contains("Approve")
    Wait For Page Load
    Page Should Contain    Approved

Test Customer Journey Tracking
    [Documentation]    Tests customer journey from first contact to purchase
    [Tags]    customer-journey    tracking
    
    # Step 1: Lead Registration
    Navigate To Page    /leads/register
    ${customer_data}=    Create Dictionary    
    ...    company=TechCorp Inc    
    ...    contact=Jane Smith    
    ...    email=jane@techcorp.com    
    ...    interest=Enterprise Solution
    
    Test Form Submission    ${customer_data}
    
    # Step 2: Track lead engagement
    Navigate To Page    /sales/analytics/engagement
    Search In Data Grid    TechCorp Inc
    Page Should Contain    Email Opened
    Page Should Contain    Website Visit
    
    # Step 3: Schedule demo
    Navigate To Page    /sales/demos
    Click Element    css:button:contains("Schedule Demo")
    ${demo_data}=    Create Dictionary    
    ...    prospect=TechCorp Inc    
    ...    date=2025-11-20    
    ...    type=Product Demo
    
    Test Form Submission    ${demo_data}
    
    # Step 4: Track demo completion
    Navigate To Page    /sales/demos/completed
    Page Should Contain    TechCorp Inc
    
    # Step 5: Generate proposal
    Click Element    css:tr:contains("TechCorp Inc") button:contains("Generate Proposal")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Submit Form
    
    # Step 6: Track proposal status
    Navigate To Page    /sales/proposals
    Page Should Contain    TechCorp Inc
    Page Should Contain    Sent

Test Sales Reporting and Analytics
    [Documentation]    Tests sales reporting and analytics features
    [Tags]    reporting    analytics
    
    # Navigate to sales analytics
    Navigate To Page    /en/platform/analytics
    
    # Verify sales metrics
    Verify Component Loaded    css:div[class*="revenue-chart"]
    Verify Component Loaded    css:div[class*="conversion-funnel"]
    Verify Component Loaded    css:div[class*="performance-metrics"]
    
    # Test date range filtering
    Click Element    css:button:contains("Last Quarter")
    Wait For Page Load
    Verify Component Loaded    css:div[class*="updated-chart"]
    
    # Test export functionality
    Click Element    css:button:contains("Export Report")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Select From List By Value    css:select[name="format"]    PDF
    Click Element    css:button:contains("Download")
    
    # Verify export completed
    Wait For Page Load
    Page Should Contain    Export Completed

Test Sales Team Performance
    [Documentation]    Tests sales team performance tracking
    [Tags]    team-performance    sales
    
    # Navigate to team performance
    Navigate To Page    /sales/team-performance
    
    # Verify team metrics
    Verify Data Grid
    Page Should Contain    Sales Rep
    Page Should Contain    Deals Closed
    Page Should Contain    Revenue Generated
    
    # Test individual performance view
    Click Element    css:tr:first-child css:button:contains("View Details")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Page Should Contain    Individual Performance
    Page Should Contain    Achievement Rate
    
    # Test performance comparison
    Navigate To Page    /sales/team-comparison
    Verify Component Loaded    css:div[class*="comparison-chart"]
    
    # Filter by time period
    Select From List By Value    css:select[name="period"]    Last 6 Months
    Wait For Page Load
    Verify Component Loaded    css:div[class*="updated-comparison"]

Test Integration with Finance
    [Documentation]    Tests sales-finance integration workflow
    [Tags]    integration    finance
    
    # Create closed deal
    Navigate To Page    /en/platform/sales/deals
    ${deal_data}=    Create Dictionary    
    ...    title=Annual Subscription    
    ...    value=25000    
    ...    stage=Won    
    ...    closeDate=2025-11-13
    
    Create Deal    ${deal_data}
    
    # Verify invoice generation
    Navigate To Page    /finance/invoices
    Page Should Contain    Annual Subscription
    Page Should Contain    $25,000
    
    # Process payment
    Click Element    css:tr:contains("Annual Subscription") button:contains("Record Payment")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    ${payment_data}=    Create Dictionary    
    ...    amount=25000    
    ...    method=Bank Transfer    
    ...    reference=TXN-001
    
    Test Form Submission    ${payment_data}
    
    # Verify financial records updated
    Navigate To Page    /finance/dashboard
    Page Should Contain    Revenue: $25,000
    Verify Component Loaded    css:div[class*="revenue-chart"]

*** Keywords ***
Create Sales Lead
    [Documentation]    Creates a new sales lead
    [Arguments]    ${lead_data}
    Navigate To Page    /en/platform/sales/leads
    Click Element    css:button:contains("Add Lead")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Test Form Submission    ${lead_data}
    Wait For Page Load
    ${lead_id}=    Get Element Attribute    css:tr:contains("${lead_data['name']}")    data-id
    RETURN    ${lead_id}

Qualify Sales Lead
    [Documentation]    Qualifies a sales lead
    [Arguments]    ${lead_id}
    Navigate To Page    /en/platform/sales/leads
    Click Element    css:tr[data-id="${lead_id}"] button:contains("Qualify")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Fill Form Field    css:select[name="status"]    Qualified
    Submit Form
    Wait For Page Load

Convert Lead To Opportunity
    [Documentation]    Converts lead to opportunity
    [Arguments]    ${lead_id}
    Navigate To Page    /en/platform/sales/leads
    Click Element    css:tr[data-id="${lead_id}"] button:contains("Convert")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Submit Form
    Wait For Page Load
    ${opportunity_id}=    Get Element Attribute    css:tr:contains("Opportunity")    data-id
    RETURN    ${opportunity_id}

Create RFQ
    [Documentation]    Creates RFQ for opportunity
    [Arguments]    ${opportunity_id}    ${rfq_data}
    Navigate To Page    /en/platform/sales/rfqs
    Click Element    css:button:contains("Create RFQ")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Fill Form Field    css:input[name="opportunityId"]    ${opportunity_id}
    Test Form Submission    ${rfq_data}
    Wait For Page Load
    ${rfq_id}=    Get Element Attribute    css:tr:contains("${rfq_data['title']}")    data-id
    RETURN    ${rfq_id}

Approve RFQ
    [Documentation]    Approves RFQ
    [Arguments]    ${rfq_id}
    Login As Admin
    Navigate To Page    /admin/rfq-approvals
    Click Element    css:tr[data-id="${rfq_id}"] button:contains("Approve")
    Wait For Page Load

Convert RFQ To Deal
    [Documentation]    Converts approved RFQ to deal
    [Arguments]    ${rfq_id}
    Navigate To Page    /en/platform/sales/rfqs
    Click Element    css:tr[data-id="${rfq_id}"] button:contains("Convert to Deal")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Submit Form
    Wait For Page Load
    ${deal_id}=    Get Element Attribute    css:tr:contains("Deal")    data-id
    RETURN    ${deal_id}

Close Deal
    [Documentation]    Closes deal as won
    [Arguments]    ${deal_id}
    Navigate To Page    /en/platform/sales/deals
    Click Element    css:tr[data-id="${deal_id}"] select[name="stage"]
    Select From List By Value    css:tr[data-id="${deal_id}"] select[name="stage"]    Won
    Wait For Page Load

Generate Invoice
    [Documentation]    Generates invoice from closed deal
    [Arguments]    ${deal_id}
    Navigate To Page    /en/platform/sales/deals
    Click Element    css:tr[data-id="${deal_id}"] button:contains("Generate Invoice")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Submit Form
    Wait For Page Load
    ${invoice_id}=    Get Element Attribute    css:tr:contains("Invoice")    data-id
    RETURN    ${invoice_id}

Process Payment
    [Documentation]    Processes payment for invoice
    [Arguments]    ${invoice_id}
    Navigate To Page    /finance/invoices
    Click Element    css:tr[data-id="${invoice_id}"] button:contains("Record Payment")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    ${payment_data}=    Create Dictionary    amount=50000    method=Credit Card
    Test Form Submission    ${payment_data}
    Wait For Page Load

Verify Sales Cycle Completion
    [Documentation]    Verifies complete sales cycle
    [Arguments]    ${lead_id}    ${deal_id}    ${invoice_id}
    # Verify lead converted
    Navigate To Page    /en/platform/sales/leads
    Page Should Contain    Converted
    
    # Verify deal closed
    Navigate To Page    /en/platform/sales/deals
    Page Should Contain    Won
    
    # Verify invoice paid
    Navigate To Page    /finance/invoices
    Page Should Contain    Paid

Create Deal
    [Documentation]    Creates a new deal
    [Arguments]    ${deal_data}
    Navigate To Page    /en/platform/sales/deals
    Click Element    css:button:contains("Create Deal")
    Wait Until Element Is Visible    ${MODAL_DIALOG}
    Test Form Submission    ${deal_data}
    Wait For Page Load