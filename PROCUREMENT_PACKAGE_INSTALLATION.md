# Procurement Module - Package Installation Guide

## Required npm Packages

To complete the implementation, install the following packages:

```bash
npm install pdf-lib csv-stringify qrcode @types/qrcode
```

### Package Details

1. **pdf-lib** - PDF generation library
   - Used for: Exporting purchase orders, vendors, inventory to PDF
   - Version: Latest

2. **csv-stringify** - CSV generation library
   - Used for: Exporting data to CSV format
   - Version: Latest

3. **qrcode** - QR code generation library
   - Used for: Generating QR codes for inventory items
   - Version: Latest
   - Types: `@types/qrcode` (for TypeScript)

### Already Installed

- ✅ **exceljs** - Excel file generation (already in package.json)
- ✅ **csv-parser** - CSV parsing (already in package.json)

## Installation Command

Run this single command to install all required packages:

```bash
npm install pdf-lib csv-stringify qrcode @types/qrcode
```

## Verification

After installation, verify packages are installed:

```bash
npm list pdf-lib csv-stringify qrcode
```

You should see all three packages listed.

## Notes

- All services are already created and ready to use
- Database tables will be auto-created on first use
- APIs are ready and functional
- Only package installation is needed to complete the implementation

