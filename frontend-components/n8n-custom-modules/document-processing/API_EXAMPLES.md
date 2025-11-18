# API Examples

Complete examples for using the Document Processing Module APIs.

## Document Processor API

### 1. Process an Invoice

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "INVOICE\nInvoice #INV-2024-001\nDate: January 15, 2024\nVendor: ABC Corporation\nAmount: $5,250.00\nItems:\n- Consulting Services: 40 hours @ $150/hr = $6,000\n- Travel Expenses: $500\nTax (10%): $650\nTotal: $7,150",
    "metadata": {
      "source": "email",
      "sender": "vendor@abc.com"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315200000-789",
  "message": "Document processed successfully",
  "processingResults": {
    "extracted_fields": {
      "invoiceNumber": "INV-2024-001",
      "date": "2024-01-15",
      "vendor": "ABC Corporation",
      "amount": 7150.00,
      "tax": 650.00,
      "items": [
        {
          "description": "Consulting Services",
          "quantity": 40,
          "price": 150,
          "lineTotal": 6000
        },
        {
          "description": "Travel Expenses",
          "quantity": 1,
          "price": 500,
          "lineTotal": 500
        }
      ]
    },
    "validation": {
      "amountsMatch": true,
      "taxCalculationCorrect": true
    },
    "category": "business_expense"
  }
}
```

### 2. Process a Contract

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "contract",
    "content": "SERVICE AGREEMENT\n\nBetween: Company A Inc. and Company B LLC\n\nTerms:\n1. Payment Terms: Net 30 days\n2. Termination: Either party may terminate with 30 days notice\n3. Liability: Limited to contract value\n4. Confidentiality: All information is confidential\n\nSignatures: _________ and _________",
    "metadata": {
      "source": "system",
      "department": "Legal"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315300000-123",
  "processingResults": {
    "parties": ["Company A Inc.", "Company B LLC"],
    "clauses": [
      {"type": "payment_terms", "risk": "low"},
      {"type": "termination", "risk": "low"},
      {"type": "liability", "risk": "medium"},
      {"type": "confidentiality", "risk": "low"}
    ],
    "risk_assessment": {
      "overall_risk": "low",
      "recommendations": ["Review liability clause for higher limits"]
    }
  }
}
```

### 3. Process a Report

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "report",
    "content": "Q4 FINANCIAL REPORT 2023\n\nExecutive Summary:\nRevenue Growth: 25% YoY\nProfit Margin: 18%\nCustomer Satisfaction: 92%\n\nKey Metrics:\n- Total Revenue: $5.2M\n- Operating Expenses: $4.1M\n- Net Profit: $930K\n- Market Share: 12%\n\nOutlook: Strong growth expected in Q1 2024",
    "metadata": {
      "source": "system",
      "reportType": "financial"
    }
  }'
```

### 4. Process a Letter

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "letter",
    "content": "Dear Mr. Johnson,\n\nThank you for your excellent work on the project. Your contributions have significantly improved our product quality. We are very pleased with the results and look forward to our continued partnership.\n\nWe would like to discuss opportunities for expanding our collaboration.\n\nBest regards,\nManagement Team",
    "metadata": {
      "source": "email",
      "sender": "manager@company.com"
    }
  }'
```

### 5. Process a Form

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "form",
    "content": "APPLICATION FORM\nName: John Smith\nEmail: john@example.com\nPhone: +1-555-123-4567\nAddress: 123 Main St, City, State 12345\nEducation: B.S. Computer Science\nExperience: 5 years in software development\nPosition Applied: Senior Developer",
    "metadata": {
      "source": "web_form",
      "formId": "app_form_001"
    }
  }'
```

### 6. Retrieve All Processed Documents

```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "documentId": "DOC-1705315200000-789",
      "documentType": "invoice",
      "timestamp": "2024-01-15T10:30:00Z",
      "processingResults": {...},
      "processingMetadata": {
        "processingTime": 1245,
        "processingDate": "2024-01-15T10:30:05Z",
        "processorVersion": "1.0.0"
      }
    }
  ]
}
```

## Document Transformer API

### 1. Convert JSON to CSV

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "csv",
    "content": "[{\"name\": \"John\", \"email\": \"john@example.com\", \"age\": 30}, {\"name\": \"Jane\", \"email\": \"jane@example.com\", \"age\": 28}]"
  }'
```

**Response:**
```json
{
  "success": true,
  "transformationId": "TRANSFORM-1705315600000-456",
  "sourceFormat": "json",
  "targetFormat": "csv",
  "transformedContent": "name,email,age\nJohn,john@example.com,30\nJane,jane@example.com,28",
  "metadata": {
    "sourceSize": 145,
    "targetSize": 78,
    "compressionRatio": 0.54,
    "transformationTime": 234
  }
}
```

### 2. Convert CSV to JSON

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "csv",
    "targetFormat": "json",
    "content": "product,price,quantity\nLaptop,1200,5\nMouse,25,50\nKeyboard,75,30"
  }'
```

### 3. Convert JSON to XML

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "xml",
    "content": "{\"customer\": {\"id\": 123, \"name\": \"John Doe\", \"email\": \"john@example.com\"}}"
  }'
```

### 4. Convert YAML to JSON

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "yaml",
    "targetFormat": "json",
    "content": "database:\n  host: localhost\n  port: 27017\n  name: myapp\nservers:\n  - name: api\n    port: 3000\n  - name: web\n    port: 80"
  }'
```

## Invoice Generator API

### 1. Generate Simple Invoice

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corporation",
    "customerEmail": "billing@acme.com",
    "items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "unitPrice": 150
      },
      {
        "description": "Software License",
        "quantity": 1,
        "unitPrice": 5000
      }
    ],
    "taxRate": 10,
    "dueDate": "2024-02-15",
    "notes": "Thank you for your business!"
  }'
```

**Response:**
```json
{
  "success": true,
  "invoiceNumber": "INV-20240115-0001",
  "invoiceDate": "2024-01-15",
  "customerName": "Acme Corporation",
  "customerEmail": "billing@acme.com",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 150,
      "lineTotal": "1500.00"
    },
    {
      "description": "Software License",
      "quantity": 1,
      "unitPrice": 5000,
      "lineTotal": "5000.00"
    }
  ],
  "subtotal": "6500.00",
  "taxAmount": "650.00",
  "total": "7150.00",
  "message": "Invoice generated and sent successfully",
  "fileUrl": "https://drive.google.com/file/d/..."
}
```

### 2. Generate Invoice with Custom Terms

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Tech Solutions Inc.",
    "customerEmail": "accounts@techsolutions.com",
    "invoiceNumber": "INV-CUSTOM-2024-001",
    "items": [
      {
        "description": "Development Services - 80 hours",
        "quantity": 80,
        "unitPrice": 175
      },
      {
        "description": "Cloud Infrastructure Setup",
        "quantity": 1,
        "unitPrice": 2500
      },
      {
        "description": "Technical Support - 3 months",
        "quantity": 3,
        "unitPrice": 500
      }
    ],
    "taxRate": 8.5,
    "dueDate": "2024-03-15",
    "notes": "Net 30 payment terms. Please include invoice number in payment reference."
  }'
```

### 3. Generate Invoice with Discount

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Loyal Customer LLC",
    "customerEmail": "finance@loyalcustomer.com",
    "items": [
      {
        "description": "Annual Subscription",
        "quantity": 1,
        "unitPrice": 12000
      }
    ],
    "discount": 1200,
    "discountDescription": "10% Volume Discount",
    "taxRate": 9,
    "dueDate": "2024-02-28"
  }'
```

## Webhook Event Examples

### Document Processing Completed

When a document is successfully processed, a webhook event is sent:

```json
{
  "event": "document_processed",
  "timestamp": "2024-01-15T10:30:00Z",
  "documentId": "DOC-1705315200000-789",
  "documentType": "invoice",
  "status": "success",
  "processingTime": 1245,
  "metadata": {...}
}
```

### Document Processing Failed

When processing fails:

```json
{
  "event": "document_processing_failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "documentId": "DOC-1705315200000-790",
  "error": "Invalid document format",
  "statusCode": 400
}
```

### Invoice Generated

When an invoice is generated successfully:

```json
{
  "event": "invoice_generated",
  "timestamp": "2024-01-15T11:00:00Z",
  "invoiceNumber": "INV-20240115-0001",
  "customerEmail": "billing@acme.com",
  "total": "7150.00",
  "fileUrl": "https://drive.google.com/file/d/..."
}
```

## Error Handling

### Validation Error Example

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invalid_type",
    "content": ""
  }'
```

**Response:**
```json
{
  "success": false,
  "errors": [
    "Invalid document type: invalid_type. Must be one of: invoice, contract, report, letter, form",
    "Missing required field: content"
  ],
  "statusCode": 400
}
```

### File Size Limit Error

```json
{
  "success": false,
  "error": "Document exceeds maximum size of 50MB",
  "statusCode": 413
}
```

## Rate Limiting

API calls are rate-limited to prevent abuse:

- **Default**: 1000 requests per hour per API key
- **Premium**: 10,000 requests per hour

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "statusCode": 429
}
```

## Authentication

All API endpoints can be protected with an API key:

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{...}'
```

## Pagination

For endpoints that return multiple results:

```bash
curl -X GET "http://localhost:5678/webhook/document-processor-api?limit=50&skip=0"
```

Query parameters:
- **limit**: Number of results (default: 100, max: 1000)
- **skip**: Number of results to skip (default: 0)

## Filtering

Filter documents by various criteria:

```bash
curl -X GET "http://localhost:5678/webhook/document-processor-api?type=invoice&status=success&dateFrom=2024-01-01&dateTo=2024-01-31"
```

Query parameters:
- **type**: Document type (invoice, contract, report, letter, form)
- **status**: Processing status (success, failed, pending)
- **dateFrom**: Start date (ISO 8601 format)
- **dateTo**: End date (ISO 8601 format)# API Examples

Complete examples for using the Document Processing Module APIs.

## Document Processor API

### 1. Process an Invoice

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "content": "INVOICE\nInvoice #INV-2024-001\nDate: January 15, 2024\nVendor: ABC Corporation\nAmount: $5,250.00\nItems:\n- Consulting Services: 40 hours @ $150/hr = $6,000\n- Travel Expenses: $500\nTax (10%): $650\nTotal: $7,150",
    "metadata": {
      "source": "email",
      "sender": "vendor@abc.com"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315200000-789",
  "message": "Document processed successfully",
  "processingResults": {
    "extracted_fields": {
      "invoiceNumber": "INV-2024-001",
      "date": "2024-01-15",
      "vendor": "ABC Corporation",
      "amount": 7150.00,
      "tax": 650.00,
      "items": [
        {
          "description": "Consulting Services",
          "quantity": 40,
          "price": 150,
          "lineTotal": 6000
        },
        {
          "description": "Travel Expenses",
          "quantity": 1,
          "price": 500,
          "lineTotal": 500
        }
      ]
    },
    "validation": {
      "amountsMatch": true,
      "taxCalculationCorrect": true
    },
    "category": "business_expense"
  }
}
```

### 2. Process a Contract

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "contract",
    "content": "SERVICE AGREEMENT\n\nBetween: Company A Inc. and Company B LLC\n\nTerms:\n1. Payment Terms: Net 30 days\n2. Termination: Either party may terminate with 30 days notice\n3. Liability: Limited to contract value\n4. Confidentiality: All information is confidential\n\nSignatures: _________ and _________",
    "metadata": {
      "source": "system",
      "department": "Legal"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-1705315300000-123",
  "processingResults": {
    "parties": ["Company A Inc.", "Company B LLC"],
    "clauses": [
      {"type": "payment_terms", "risk": "low"},
      {"type": "termination", "risk": "low"},
      {"type": "liability", "risk": "medium"},
      {"type": "confidentiality", "risk": "low"}
    ],
    "risk_assessment": {
      "overall_risk": "low",
      "recommendations": ["Review liability clause for higher limits"]
    }
  }
}
```

### 3. Process a Report

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "report",
    "content": "Q4 FINANCIAL REPORT 2023\n\nExecutive Summary:\nRevenue Growth: 25% YoY\nProfit Margin: 18%\nCustomer Satisfaction: 92%\n\nKey Metrics:\n- Total Revenue: $5.2M\n- Operating Expenses: $4.1M\n- Net Profit: $930K\n- Market Share: 12%\n\nOutlook: Strong growth expected in Q1 2024",
    "metadata": {
      "source": "system",
      "reportType": "financial"
    }
  }'
```

### 4. Process a Letter

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "letter",
    "content": "Dear Mr. Johnson,\n\nThank you for your excellent work on the project. Your contributions have significantly improved our product quality. We are very pleased with the results and look forward to our continued partnership.\n\nWe would like to discuss opportunities for expanding our collaboration.\n\nBest regards,\nManagement Team",
    "metadata": {
      "source": "email",
      "sender": "manager@company.com"
    }
  }'
```

### 5. Process a Form

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "form",
    "content": "APPLICATION FORM\nName: John Smith\nEmail: john@example.com\nPhone: +1-555-123-4567\nAddress: 123 Main St, City, State 12345\nEducation: B.S. Computer Science\nExperience: 5 years in software development\nPosition Applied: Senior Developer",
    "metadata": {
      "source": "web_form",
      "formId": "app_form_001"
    }
  }'
```

### 6. Retrieve All Processed Documents

```bash
curl -X GET http://localhost:5678/webhook/document-processor-api
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "documentId": "DOC-1705315200000-789",
      "documentType": "invoice",
      "timestamp": "2024-01-15T10:30:00Z",
      "processingResults": {...},
      "processingMetadata": {
        "processingTime": 1245,
        "processingDate": "2024-01-15T10:30:05Z",
        "processorVersion": "1.0.0"
      }
    }
  ]
}
```

## Document Transformer API

### 1. Convert JSON to CSV

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "csv",
    "content": "[{\"name\": \"John\", \"email\": \"john@example.com\", \"age\": 30}, {\"name\": \"Jane\", \"email\": \"jane@example.com\", \"age\": 28}]"
  }'
```

**Response:**
```json
{
  "success": true,
  "transformationId": "TRANSFORM-1705315600000-456",
  "sourceFormat": "json",
  "targetFormat": "csv",
  "transformedContent": "name,email,age\nJohn,john@example.com,30\nJane,jane@example.com,28",
  "metadata": {
    "sourceSize": 145,
    "targetSize": 78,
    "compressionRatio": 0.54,
    "transformationTime": 234
  }
}
```

### 2. Convert CSV to JSON

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "csv",
    "targetFormat": "json",
    "content": "product,price,quantity\nLaptop,1200,5\nMouse,25,50\nKeyboard,75,30"
  }'
```

### 3. Convert JSON to XML

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "json",
    "targetFormat": "xml",
    "content": "{\"customer\": {\"id\": 123, \"name\": \"John Doe\", \"email\": \"john@example.com\"}}"
  }'
```

### 4. Convert YAML to JSON

```bash
curl -X POST http://localhost:5678/webhook/transform \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFormat": "yaml",
    "targetFormat": "json",
    "content": "database:\n  host: localhost\n  port: 27017\n  name: myapp\nservers:\n  - name: api\n    port: 3000\n  - name: web\n    port: 80"
  }'
```

## Invoice Generator API

### 1. Generate Simple Invoice

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corporation",
    "customerEmail": "billing@acme.com",
    "items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "unitPrice": 150
      },
      {
        "description": "Software License",
        "quantity": 1,
        "unitPrice": 5000
      }
    ],
    "taxRate": 10,
    "dueDate": "2024-02-15",
    "notes": "Thank you for your business!"
  }'
```

**Response:**
```json
{
  "success": true,
  "invoiceNumber": "INV-20240115-0001",
  "invoiceDate": "2024-01-15",
  "customerName": "Acme Corporation",
  "customerEmail": "billing@acme.com",
  "items": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 150,
      "lineTotal": "1500.00"
    },
    {
      "description": "Software License",
      "quantity": 1,
      "unitPrice": 5000,
      "lineTotal": "5000.00"
    }
  ],
  "subtotal": "6500.00",
  "taxAmount": "650.00",
  "total": "7150.00",
  "message": "Invoice generated and sent successfully",
  "fileUrl": "https://drive.google.com/file/d/..."
}
```

### 2. Generate Invoice with Custom Terms

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Tech Solutions Inc.",
    "customerEmail": "accounts@techsolutions.com",
    "invoiceNumber": "INV-CUSTOM-2024-001",
    "items": [
      {
        "description": "Development Services - 80 hours",
        "quantity": 80,
        "unitPrice": 175
      },
      {
        "description": "Cloud Infrastructure Setup",
        "quantity": 1,
        "unitPrice": 2500
      },
      {
        "description": "Technical Support - 3 months",
        "quantity": 3,
        "unitPrice": 500
      }
    ],
    "taxRate": 8.5,
    "dueDate": "2024-03-15",
    "notes": "Net 30 payment terms. Please include invoice number in payment reference."
  }'
```

### 3. Generate Invoice with Discount

```bash
curl -X POST http://localhost:5678/webhook/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Loyal Customer LLC",
    "customerEmail": "finance@loyalcustomer.com",
    "items": [
      {
        "description": "Annual Subscription",
        "quantity": 1,
        "unitPrice": 12000
      }
    ],
    "discount": 1200,
    "discountDescription": "10% Volume Discount",
    "taxRate": 9,
    "dueDate": "2024-02-28"
  }'
```

## Webhook Event Examples

### Document Processing Completed

When a document is successfully processed, a webhook event is sent:

```json
{
  "event": "document_processed",
  "timestamp": "2024-01-15T10:30:00Z",
  "documentId": "DOC-1705315200000-789",
  "documentType": "invoice",
  "status": "success",
  "processingTime": 1245,
  "metadata": {...}
}
```

### Document Processing Failed

When processing fails:

```json
{
  "event": "document_processing_failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "documentId": "DOC-1705315200000-790",
  "error": "Invalid document format",
  "statusCode": 400
}
```

### Invoice Generated

When an invoice is generated successfully:

```json
{
  "event": "invoice_generated",
  "timestamp": "2024-01-15T11:00:00Z",
  "invoiceNumber": "INV-20240115-0001",
  "customerEmail": "billing@acme.com",
  "total": "7150.00",
  "fileUrl": "https://drive.google.com/file/d/..."
}
```

## Error Handling

### Validation Error Example

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invalid_type",
    "content": ""
  }'
```

**Response:**
```json
{
  "success": false,
  "errors": [
    "Invalid document type: invalid_type. Must be one of: invoice, contract, report, letter, form",
    "Missing required field: content"
  ],
  "statusCode": 400
}
```

### File Size Limit Error

```json
{
  "success": false,
  "error": "Document exceeds maximum size of 50MB",
  "statusCode": 413
}
```

## Rate Limiting

API calls are rate-limited to prevent abuse:

- **Default**: 1000 requests per hour per API key
- **Premium**: 10,000 requests per hour

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 3600,
  "statusCode": 429
}
```

## Authentication

All API endpoints can be protected with an API key:

```bash
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{...}'
```

## Pagination

For endpoints that return multiple results:

```bash
curl -X GET "http://localhost:5678/webhook/document-processor-api?limit=50&skip=0"
```

Query parameters:
- **limit**: Number of results (default: 100, max: 1000)
- **skip**: Number of results to skip (default: 0)

## Filtering

Filter documents by various criteria:

```bash
curl -X GET "http://localhost:5678/webhook/document-processor-api?type=invoice&status=success&dateFrom=2024-01-01&dateTo=2024-01-31"
```

Query parameters:
- **type**: Document type (invoice, contract, report, letter, form)
- **status**: Processing status (success, failed, pending)
- **dateFrom**: Start date (ISO 8601 format)
- **dateTo**: End date (ISO 8601 format)