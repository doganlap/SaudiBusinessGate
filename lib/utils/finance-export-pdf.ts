// Enhanced PDF Export using jsPDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export data to PDF using jsPDF
 */
export function exportToPDFWithjsPDF(
  data: any[],
  columns: string[],
  options: PDFExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  if (options.title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, 20);
  }

  // Add subtitle
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, 14, 28);
  }

  // Add date range if provided
  if (options.dateRange) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Period: ${options.dateRange.start} to ${options.dateRange.end}`,
      14,
      34
    );
  }

  // Prepare table data
  const tableData = data.map(row => {
    return columns.map(col => {
      const value = row[col];
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === 'number') {
        return value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        });
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value || '');
    });
  });

  // Add table
  (doc as any).autoTable({
    head: [columns],
    body: tableData,
    startY: options.title || options.subtitle ? 40 : 20,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue color
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Light gray
    },
    margin: { top: 20, right: 14, bottom: 20, left: 14 }
  });

  // Add footer with generation date
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

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
    'Investing Net',
    'Financing Net',
    'Net Cash Flow',
    'Ending Balance'
  ];

  const formattedData = data.map(item => ({
    Period: item.period,
    'Operating Income': item.operating?.income || 0,
    'Operating Expenses': item.operating?.expenses || 0,
    'Operating Net': item.operating?.net || 0,
    'Investing Net': item.investing?.net || 0,
    'Financing Net': item.financing?.net || 0,
    'Net Cash Flow': item.netCashFlow || 0,
    'Ending Balance': item.endingBalance || 0
  }));

  exportToPDFWithjsPDF(formattedData, columns, {
    title: options.title || 'Cash Flow Statement',
    ...options
  });
}
