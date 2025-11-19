# Finance Export Setup Guide

## Overview

The finance module now supports exporting data to PDF and Excel formats. This guide explains how to set up and use the export functionality.

## Required Dependencies

### For Excel Export

Install the `xlsx` library:

```bash
npm install xlsx
# or
yarn add xlsx
```

### For PDF Export

The PDF export uses HTML-to-PDF conversion. For server-side PDF generation, you can optionally install:

- `puppeteer` (for server-side PDF generation)
- `jsPDF` (for client-side PDF generation)

Currently, the PDF export generates HTML that can be printed to PDF using the browser's print functionality.

## Export Features

### Available Export Formats

1. **Excel (.xlsx)** - Full spreadsheet format with formatting
2. **PDF (.pdf)** - Formatted document for printing/sharing
3. **CSV (.csv)** - Simple comma-separated values

### Components with Export

All finance components now have export buttons:

- ✅ Cash Flow Statement
- ✅ Accounts Payable
- ✅ Accounts Receivable
- ✅ Budgets
- ✅ Transactions

## Usage

### In Components

Each component has export buttons (PDF and Excel) in the header/filter section. Simply click the desired format button to download the current filtered data.

### Programmatic Export

```typescript
import { 
  exportCashFlow, 
  exportAccountsPayable, 
  exportAccountsReceivable,
  exportBudgets,
  exportTransactions 
} from '@/lib/utils/finance-export';

// Export cash flow
await exportCashFlow(data, 'excel', {
  filename: 'cash-flow-report.xlsx',
  title: 'Cash Flow Statement'
});

// Export accounts payable
await exportAccountsPayable(data, 'pdf', {
  filename: 'accounts-payable.pdf',
  title: 'Accounts Payable Report'
});
```

## API Endpoints

### Excel Export

- **POST** `/api/finance/export/excel`
  - Body: `{ data: any[], options: { filename?: string, title?: string } }`
  - Returns: Excel file download

### PDF Export

- **POST** `/api/finance/export/pdf`
  - Body: `{ data: any[], options: { filename?: string, title?: string } }`
  - Returns: HTML file (can be printed to PDF)

## Installation Steps

1. **Install xlsx package:**

   ```bash
   npm install xlsx
   ```

2. **Verify installation:**

   ```bash
   npm list xlsx
   ```

3. **Test export functionality:**
   - Navigate to any finance page
   - Click the Excel or PDF export button
   - Verify the file downloads correctly

## Troubleshooting

### Excel Export Not Working

- Ensure `xlsx` package is installed: `npm install xlsx`
- Check browser console for errors
- Verify data is not empty before exporting

### PDF Export Not Working

- PDF export generates HTML that can be printed
- Use browser's "Print to PDF" option
- For server-side PDF, consider installing `puppeteer`

### Export Buttons Not Visible

- Ensure you're on a finance page with data
- Check that the component is properly imported
- Verify user has export permissions

## Future Enhancements

- [ ] Server-side PDF generation with puppeteer
- [ ] Custom PDF templates
- [ ] Scheduled exports
- [ ] Email export functionality
- [ ] Export with charts and graphs
