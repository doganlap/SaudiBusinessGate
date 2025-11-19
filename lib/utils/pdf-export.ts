// PDF Export using jsPDF

import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  title?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'mm' | 'pt' | 'px' | 'in';
  format?: 'a4' | 'letter';
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export data to PDF using jsPDF
 */
export function exportToPDF(
  data: any[],
  columns: string[],
  options: PDFExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: options.unit || 'mm',
    format: options.format || 'a4'
  });

  // Add title
  if (options.title) {
    doc.setFontSize(18);
    doc.text(options.title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 14, 22);
    
    if (options.dateRange) {
      doc.text(
        `Period: ${options.dateRange.start} to ${options.dateRange.end}`,
        14,
        27
      );
    }
  }

  // Prepare table data
  const tableData = data.map(row => 
    columns.map(col => {
      const value = row[col];
      if (value instanceof Date) {
        return value.toLocaleDateString();
      } else if (typeof value === 'number') {
        return value.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0
        });
      } else if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value || '');
    })
  );

  // Add table
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: options.title ? 35 : 15,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Light gray
    },
    margin: { top: 15, right: 14, bottom: 15, left: 14 },
  });

  // Save PDF
  const filename = options.filename || `finance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Export cash flow statement to PDF
 */
export function exportCashFlowPDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const columns = [
    'Period',
    'Operating Income',
    'Operating Expenses',
    'Operating Net',
    'Investing Purchases',
    'Investing Sales',
    'Investing Net',
    'Financing Borrowings',
    'Financing Repayments',
    'Financing Dividends',
    'Financing Net',
    'Net Cash Flow',
    'Beginning Balance',
    'Ending Balance'
  ];

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

  exportToPDF(formattedData, columns, {
    title: options.title || 'Cash Flow Statement',
    filename: options.filename || `cash-flow-statement-${new Date().toISOString().slice(0, 10)}.pdf`,
    ...options
  });
}

/**
 * Export accounts payable to PDF
 */
export function exportAccountsPayablePDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const columns = [
    'Vendor Name',
    'Invoice Number',
    'Invoice Date',
    'Due Date',
    'Amount',
    'Paid Amount',
    'Balance',
    'Status',
    'Category'
  ];

  exportToPDF(data, columns, {
    title: options.title || 'Accounts Payable',
    filename: options.filename || `accounts-payable-${new Date().toISOString().slice(0, 10)}.pdf`,
    ...options
  });
}

/**
 * Export accounts receivable to PDF
 */
export function exportAccountsReceivablePDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const columns = [
    'Customer Name',
    'Invoice Number',
    'Invoice Date',
    'Due Date',
    'Amount',
    'Paid Amount',
    'Balance',
    'Status',
    'Category'
  ];

  exportToPDF(data, columns, {
    title: options.title || 'Accounts Receivable',
    filename: options.filename || `accounts-receivable-${new Date().toISOString().slice(0, 10)}.pdf`,
    ...options
  });
}

/**
 * Export budgets to PDF
 */
export function exportBudgetsPDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const columns = [
    'Budget Name',
    'Category',
    'Period',
    'Budgeted Amount',
    'Actual Amount',
    'Variance',
    'Variance %',
    'Status'
  ];

  exportToPDF(data, columns, {
    title: options.title || 'Budget Report',
    filename: options.filename || `budgets-${new Date().toISOString().slice(0, 10)}.pdf`,
    ...options
  });
}

/**
 * Export transactions to PDF
 */
export function exportTransactionsPDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const columns = [
    'Date',
    'Transaction #',
    'Description',
    'Account',
    'Category',
    'Type',
    'Amount',
    'Balance',
    'Status'
  ];

  exportToPDF(data, columns, {
    title: options.title || 'Transactions Report',
    filename: options.filename || `transactions-${new Date().toISOString().slice(0, 10)}.pdf`,
    ...options
  });
}

