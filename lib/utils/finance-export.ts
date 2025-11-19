// Finance Export Utilities for PDF and Excel

export interface FinanceExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  filename?: string;
  title?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export finance data to Excel using server-side API or client-side fallback
 */
export async function exportToExcel(
  data: any[],
  options: FinanceExportOptions
): Promise<void> {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Try to use server-side export first (more secure)
    try {
      const response = await fetch('/api/finance/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, options }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = options.filename || `finance-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (serverError) {
      console.warn('Server-side export failed, trying client-side fallback:', serverError);
    }

    // Fallback: Use CSV export if server-side fails
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(data, options);
    console.warn('Excel export unavailable, exported as CSV instead');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please try again or use CSV export.');
  }
}

/**
 * Export finance data to PDF using jsPDF (client-side)
 */
export async function exportToPDF(
  data: any[],
  options: FinanceExportOptions,
  columns?: Array<{ header: string; dataKey: string; width?: number }>
): Promise<void> {
  try {
    // Dynamically import PDF generator
    const { generateTablePDF } = await import('@/lib/utils/pdf-generator');
    
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Auto-generate columns if not provided
    const autoColumns = columns || (data.length > 0 
      ? Object.keys(data[0]).map(key => ({
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          dataKey: key
        }))
      : []);

    const headers = autoColumns.map(col => col.header);
    const normalizedData = data.map(row => {
      const mapped: Record<string, any> = {};
      for (const col of autoColumns) {
        mapped[col.header] = row[col.dataKey] ?? row[col.dataKey as keyof typeof row];
      }
      return mapped;
    });

    generateTablePDF(normalizedData, headers, {
      title: options.title,
      filename: options.filename || `finance-report-${new Date().toISOString().slice(0, 10)}.pdf`
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF. Please ensure jspdf is installed.');
  }
}

/**
 * Export cash flow statement
 */
export async function exportCashFlow(
  data: any[],
  format: 'pdf' | 'excel' | 'csv',
  options?: Partial<FinanceExportOptions>
): Promise<void> {
  const exportOptions: FinanceExportOptions = {
    format,
    filename: options?.filename || `cash-flow-statement-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
    title: options?.title || 'Cash Flow Statement',
    ...options
  };

  // Format data for export
  const formattedData = data.map(item => ({
    Period: item.period,
    'Operating Income': item.operating?.income || 0,
    'Operating Expenses': item.operating?.expenses || 0,
    'Operating Net': item.operating?.net || 0,
    'Investing Purchases': item.investing?.purchases || 0,
    'Investing Sales': item.investing?.sales || 0,
    'Investing Net': item.investing?.net || 0,
    'Financing Borrowings': item.financing?.borrowings || 0,
    'Financing Repayments': item.financing?.repayments || 0,
    'Financing Dividends': item.financing?.dividends || 0,
    'Financing Net': item.financing?.net || 0,
    'Net Cash Flow': item.netCashFlow || 0,
    'Beginning Balance': item.beginningBalance || 0,
    'Ending Balance': item.endingBalance || 0
  }));

  if (format === 'excel') {
    await exportToExcel(formattedData, exportOptions);
  } else if (format === 'pdf') {
    await exportToPDF(formattedData, exportOptions, [
      { header: 'Period', dataKey: 'Period' },
      { header: 'Operating Income', dataKey: 'Operating Income' },
      { header: 'Operating Expenses', dataKey: 'Operating Expenses' },
      { header: 'Operating Net', dataKey: 'Operating Net' },
      { header: 'Investing Purchases', dataKey: 'Investing Purchases' },
      { header: 'Investing Sales', dataKey: 'Investing Sales' },
      { header: 'Investing Net', dataKey: 'Investing Net' },
      { header: 'Financing Borrowings', dataKey: 'Financing Borrowings' },
      { header: 'Financing Repayments', dataKey: 'Financing Repayments' },
      { header: 'Financing Dividends', dataKey: 'Financing Dividends' },
      { header: 'Financing Net', dataKey: 'Financing Net' },
      { header: 'Net Cash Flow', dataKey: 'Net Cash Flow' },
      { header: 'Beginning Balance', dataKey: 'Beginning Balance' },
      { header: 'Ending Balance', dataKey: 'Ending Balance' }
    ]);
  } else {
    // CSV export
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(formattedData, exportOptions);
  }
}

/**
 * Export accounts payable
 */
export async function exportAccountsPayable(
  data: any[],
  format: 'pdf' | 'excel' | 'csv',
  options?: Partial<FinanceExportOptions>
): Promise<void> {
  const exportOptions: FinanceExportOptions = {
    format,
    filename: options?.filename || `accounts-payable-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
    title: options?.title || 'Accounts Payable',
    ...options
  };

  const formattedData = data.map(item => ({
    'Vendor Name': item.vendorName,
    'Invoice Number': item.invoiceNumber,
    'Invoice Date': item.invoiceDate,
    'Due Date': item.dueDate,
    'Amount': item.amount,
    'Paid Amount': item.paidAmount,
    'Balance': item.balance,
    'Status': item.status,
    'Category': item.category,
    'Description': item.description
  }));

  if (format === 'excel') {
    await exportToExcel(formattedData, exportOptions);
  } else if (format === 'pdf') {
    await exportToPDF(formattedData, exportOptions, [
      { header: 'Vendor Name', dataKey: 'Vendor Name' },
      { header: 'Invoice Number', dataKey: 'Invoice Number' },
      { header: 'Invoice Date', dataKey: 'Invoice Date' },
      { header: 'Due Date', dataKey: 'Due Date' },
      { header: 'Amount', dataKey: 'Amount' },
      { header: 'Paid Amount', dataKey: 'Paid Amount' },
      { header: 'Balance', dataKey: 'Balance' },
      { header: 'Status', dataKey: 'Status' },
      { header: 'Category', dataKey: 'Category' },
      { header: 'Description', dataKey: 'Description' }
    ]);
  } else {
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(formattedData, exportOptions);
  }
}

/**
 * Export accounts receivable
 */
export async function exportAccountsReceivable(
  data: any[],
  format: 'pdf' | 'excel' | 'csv',
  options?: Partial<FinanceExportOptions>
): Promise<void> {
  const exportOptions: FinanceExportOptions = {
    format,
    filename: options?.filename || `accounts-receivable-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
    title: options?.title || 'Accounts Receivable',
    ...options
  };

  const formattedData = data.map(item => ({
    'Customer Name': item.customerName,
    'Invoice Number': item.invoiceNumber,
    'Invoice Date': item.invoiceDate,
    'Due Date': item.dueDate,
    'Amount': item.amount,
    'Paid Amount': item.paidAmount,
    'Balance': item.balance,
    'Status': item.status,
    'Category': item.category,
    'Description': item.description
  }));

  if (format === 'excel') {
    await exportToExcel(formattedData, exportOptions);
  } else if (format === 'pdf') {
    await exportToPDF(formattedData, exportOptions, [
      { header: 'Customer Name', dataKey: 'Customer Name' },
      { header: 'Invoice Number', dataKey: 'Invoice Number' },
      { header: 'Invoice Date', dataKey: 'Invoice Date' },
      { header: 'Due Date', dataKey: 'Due Date' },
      { header: 'Amount', dataKey: 'Amount' },
      { header: 'Paid Amount', dataKey: 'Paid Amount' },
      { header: 'Balance', dataKey: 'Balance' },
      { header: 'Status', dataKey: 'Status' },
      { header: 'Category', dataKey: 'Category' },
      { header: 'Description', dataKey: 'Description' }
    ]);
  } else {
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(formattedData, exportOptions);
  }
}

/**
 * Export budgets
 */
export async function exportBudgets(
  data: any[],
  format: 'pdf' | 'excel' | 'csv',
  options?: Partial<FinanceExportOptions>
): Promise<void> {
  const exportOptions: FinanceExportOptions = {
    format,
    filename: options?.filename || `budgets-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
    title: options?.title || 'Budget Report',
    ...options
  };

  const formattedData = data.map(item => ({
    'Budget Name': item.name,
    'Category': item.category,
    'Period': item.period,
    'Budgeted Amount': item.budgetedAmount,
    'Actual Amount': item.actualAmount,
    'Variance': item.variance,
    'Variance %': item.variancePercent,
    'Status': item.status
  }));

  if (format === 'excel') {
    await exportToExcel(formattedData, exportOptions);
  } else if (format === 'pdf') {
    await exportToPDF(formattedData, exportOptions, [
      { header: 'Budget Name', dataKey: 'Budget Name' },
      { header: 'Category', dataKey: 'Category' },
      { header: 'Period', dataKey: 'Period' },
      { header: 'Budgeted Amount', dataKey: 'Budgeted Amount' },
      { header: 'Actual Amount', dataKey: 'Actual Amount' },
      { header: 'Variance', dataKey: 'Variance' },
      { header: 'Variance %', dataKey: 'Variance %' },
      { header: 'Status', dataKey: 'Status' }
    ]);
  } else {
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(formattedData, exportOptions);
  }
}

/**
 * Export transactions
 */
export async function exportTransactions(
  data: any[],
  format: 'pdf' | 'excel' | 'csv',
  options?: Partial<FinanceExportOptions>
): Promise<void> {
  const exportOptions: FinanceExportOptions = {
    format,
    filename: options?.filename || `transactions-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : format}`,
    title: options?.title || 'Transactions Report',
    ...options
  };

  const formattedData = data.map(item => ({
    'Date': item.date,
    'Transaction #': item.transactionNumber,
    'Description': item.description,
    'Account': item.account,
    'Category': item.category,
    'Type': item.type,
    'Amount': item.amount,
    'Balance': item.balance,
    'Status': item.status
  }));

  if (format === 'excel') {
    await exportToExcel(formattedData, exportOptions);
  } else if (format === 'pdf') {
    await exportToPDF(formattedData, exportOptions, [
      { header: 'Date', dataKey: 'Date' },
      { header: 'Transaction #', dataKey: 'Transaction #' },
      { header: 'Description', dataKey: 'Description' },
      { header: 'Account', dataKey: 'Account' },
      { header: 'Category', dataKey: 'Category' },
      { header: 'Type', dataKey: 'Type' },
      { header: 'Amount', dataKey: 'Amount' },
      { header: 'Balance', dataKey: 'Balance' },
      { header: 'Status', dataKey: 'Status' }
    ]);
  } else {
    const { ExportService } = await import('./export-utils');
    ExportService.exportToCSV(formattedData, exportOptions);
  }
}

