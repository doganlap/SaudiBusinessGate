# 📄 Document Processor - User Guide

## What Is It?

The **Document Processor** is a web-based interface that allows you to:
- ✅ Upload documents (PDF, images, Word files)
- ✅ Process them locally using your configured credentials
- ✅ Store results in your local folder
- ✅ Extract structured data automatically
- ✅ Export results in multiple formats

---

## 🚀 Quick Start

### Step 1: Login
1. Open admin panel: **http://localhost:3002/admin**
2. Login with test credentials:
   - Email: `test@example.com`
   - Password: `test123456`

### Step 2: Configure Credentials (Optional)
1. Click **"+ Add Credential"**
2. Select services like:
   - **Azure Form Recognizer** - for invoice/document extraction
   - **OpenAI** - for document classification and summarization
   - **SMTP** - for email notifications
   - Other services as needed

### Step 3: Open Document Processor
1. Open: **http://localhost:3002/document-processor**
2. This is where you process documents locally

---

## 📋 Complete Workflow

```
┌─────────────────────────────────┐
│ 1. SELECT LOCAL DOCUMENTS       │
│    (Drag & drop or click)       │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 2. CHOOSE SETTINGS              │
│    • Document Type              │
│    • Storage Location           │
│    • Subfolder Path             │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 3. CLICK "PROCESS DOCUMENTS"    │
│    • Uploads to server          │
│    • Processes using services   │
│    • Stores results locally     │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ 4. VIEW RESULTS                 │
│    • Extraction results         │
│    • Storage locations          │
│    • Processing time            │
└──────────────────────────────────┘
```

---

## 📁 File Storage

### Local Storage Location
By default, documents are stored in:
```
/documents
  ├── invoices/
  ├── contracts/
  ├── reports/
  └── [custom subfolders]
```

### What Gets Stored
For each document uploaded:
- ✅ **Original file** (PDF, image, word doc)
- ✅ **Metadata file** (.meta.json) - includes extraction results
- ✅ **Processing results** (extracted fields, classifications)
- ✅ **Timestamps** - when processed and by whom

### Example Storage Structure
```
documents/
└── invoices/2024/
    ├── invoice-001.pdf
    ├── invoice-001.pdf.meta.json
    ├── invoice-002.pdf
    └── invoice-002.pdf.meta.json
```

### Metadata File Content
```json
{
  "filename": "invoice-001.pdf",
  "size": 245632,
  "mimetype": "application/pdf",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "uploadedBy": "test@example.com",
  "documentType": "invoice",
  "processingResults": {
    "extractedFields": {
      "invoiceNumber": "INV-2024-001",
      "date": "2024-01-15",
      "amount": 1250.00,
      "vendor": "Acme Corp"
    },
    "status": "completed",
    "processingTime": 1500
  }
}
```

---

## 🎯 Document Types

The system supports:

| Type | Best For | Auto-Extract |
|------|----------|--------------|
| **Invoice** | Billing documents | Invoice #, Date, Amount, Vendor |
| **Contract** | Legal agreements | Parties, Terms, Dates, Amounts |
| **Report** | Business reports | Title, Date, Key Metrics, Summary |
| **Letter** | Correspondence | Sender, Date, Subject, Content |
| **Form** | Data collection | Fields, Values, Checkboxes |
| **Other** | Generic documents | General extraction |

---

## 💾 Storage Destination Options

### Option 1: Local Folder (Recommended for Desktop)
- ✅ Documents stored on your computer
- ✅ No cloud dependency
- ✅ Fast processing
- ✅ Full privacy control
- 📍 Location: `/documents` folder on your machine

### Option 2: Local Folder + Azure
- ✅ Local backup
- ✅ Cloud redundancy
- ✅ Both locations updated
- ⚠️ Requires Azure credentials

### Option 3: Azure Only
- ✅ Cloud storage only
- ✅ Cloud processing
- ⚠️ Requires Azure credentials
- ⚠️ No local backup

---

## 🔄 Processing Steps (Behind the Scenes)

### When you click "Process Documents":

1. **Upload**
   - Files sent to server securely
   - Validated for format and size

2. **Encryption & Storage**
   - Files stored in local folder
   - Encrypted if Azure is enabled

3. **Processing**
   - Your configured credentials retrieved
   - Azure Form Recognizer extracts structure
   - OpenAI classifies and summarizes (if enabled)
   - Email notifications sent (if SMTP enabled)

4. **Results Storage**
   - Extracted data saved as metadata
   - Results indexed in MongoDB
   - Status updated in UI

5. **Return to UI**
   - Processing results displayed
   - Success/error status shown
   - Export options enabled

---

## 📊 Processing Results

After processing, you'll see:

### For Each Document:
```
File Name: invoice-001.pdf
Status: ✅ COMPLETED
Destinations:
  📁 Local Folder Storage: ✅ Stored
  ☁️ Azure: ✅ Uploaded (optional)
Processing Time: 1.5 seconds
```

### Summary Information:
```
✅ Completed: 5 documents
❌ Failed: 0 documents
📁 All files stored locally in /documents
```

---

## 💡 Common Use Cases

### Invoice Processing
1. Select document type: **Invoice**
2. Upload PDF or image
3. System extracts:
   - Invoice number
   - Date
   - Amount
   - Vendor/supplier
   - Line items
4. Results stored in `documents/invoices/`

### Contract Review
1. Select document type: **Contract**
2. Upload contract document
3. System extracts:
   - Party names
   - Key terms
   - Important dates
   - Financial terms
4. Results stored in `documents/contracts/`

### Batch Processing
1. Select multiple documents
2. Choose document type
3. Set subfolder (e.g., "2024-Q1")
4. Click "Process"
5. System processes all files
6. Download results as JSON or CSV

---

## 🔒 Security & Privacy

✅ **All stored locally** - No data sent to external servers by default
✅ **Encrypted credentials** - Service credentials never displayed
✅ **User isolation** - Each user only sees their own documents
✅ **Audit trail** - All operations logged with timestamps
✅ **No retention** - Process and delete as needed

---

## 📤 Export Options

### Export as JSON
- Structured data format
- All extraction results
- Metadata included
- Perfect for integrations

### Export as CSV
- Spreadsheet format
- Easy to import to Excel
- Good for reporting
- One row per document

### Open Results Folder
- Direct access to files
- View original documents
- Edit metadata files
- Manual inspection

---

## ⚙️ Configuration

### Environment Variables
Edit `.env` file in document-processing folder:

```env
# Storage
FOLDER_STORAGE_BASE_PATH=./documents

# Database (if using results storage)
DB_MONGODB_HOST=localhost
DB_MONGODB_PORT=27017

# Services (optional)
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_FORM_RECOGNIZER_ENDPOINT=...
```

---

## 🐛 Troubleshooting

### Documents Not Processing
1. ✅ Check credentials are configured in Admin Panel
2. ✅ Verify document format is supported (PDF, JPEG, PNG, Word)
3. ✅ Check file size is under 50MB
4. ✅ Ensure service is tested and working (Test button in Admin)

### Storage Location Not Found
1. Check `.env` file for `FOLDER_STORAGE_BASE_PATH`
2. Default location: `./documents` in project folder
3. Can be absolute path: `C:\Users\YourName\Documents\ProcessedDocuments`

### Processing Errors
1. Check error message in results
2. Review credentials in Admin Panel
3. Verify credentials are still valid (Test button)
4. Check server logs for detailed errors

### Slow Processing
1. Check file size (large files take longer)
2. Check server load
3. Consider processing fewer documents at once
4. Check network speed if using Azure

---

## 📞 Support

### Check These First
- Admin Panel: Verify credentials are configured
- Test credentials before processing documents
- Check server is running: http://localhost:3002/health
- Review error messages in results section

### Common Issues
| Issue | Solution |
|-------|----------|
| 404 Not Found | Check URL: http://localhost:3002/document-processor |
| Login Failed | Use test@example.com / test123456 |
| Files not saved | Check FOLDER_STORAGE_BASE_PATH in .env |
| Processing slow | Reduce file size or process fewer at once |
| Azure errors | Check Azure credentials in Admin Panel |

---

## 🎓 Examples

### Example 1: Process Single Invoice
```
1. Go to Document Processor
2. Click upload area
3. Select invoice.pdf
4. Document Type: Invoice
5. Destination: Local Folder
6. Click "Process Documents"
7. Result stored in /documents/invoices/
```

### Example 2: Batch Process Multiple Documents
```
1. Go to Document Processor
2. Drag & drop 10 PDF files
3. Document Type: Mixed (other)
4. Destination: Local Folder
5. Subfolder: 2024/Q1
6. Click "Process Documents"
7. All stored in /documents/2024/Q1/
8. Download results as CSV
```

### Example 3: Process with Notifications
```
1. Set up SMTP credentials in Admin
2. Go to Document Processor
3. Upload documents
4. After processing complete
5. Email sent with summary
6. Files stored locally
```

---

## 📈 Batch Processing Tips

- **Optimal batch size**: 5-10 documents per batch
- **Large files**: Process one at a time
- **Different types**: Process same types together
- **Slow server**: Reduce batch size
- **Fast server**: Can process larger batches

---

## 🔄 Workflow Integration

The Document Processor can be integrated with:
- ✅ n8n workflows
- ✅ External APIs
- ✅ Email systems
- ✅ CRM platforms
- ✅ ERP systems

All results are stored locally and can be accessed programmatically.

---

## 📝 Notes

- Documents are processed immediately after upload
- Results are returned within seconds
- All data is stored permanently (until manually deleted)
- You can reprocess the same document multiple times
- Each processing creates new results with fresh timestamp

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Supported Formats**: PDF, JPEG, PNG, Word (.docx)  
**Max File Size**: 50MB  
**Browser Support**: Chrome, Firefox, Safari, Edge