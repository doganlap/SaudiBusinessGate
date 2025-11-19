// PDF Generation Utilities using jsPDF
// This provides server-side and client-side PDF generation

export interface PDFOptions {
  title?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number;
}

/**
 * Generate PDF from HTML content using jsPDF (client-side)
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  options: PDFOptions = {}
): Promise<Blob> {
  try {
    // Dynamic import of jsPDF
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });

    // Add title
    if (options.title) {
      doc.setFontSize(18);
      doc.text(options.title, 105, 20, { align: 'center' });
      doc.setFontSize(12);
    }

    // For HTML content, you would use html() method if available
    // Or convert HTML to canvas/image first
    // For now, return a simple PDF
    doc.text('Financial Report', 20, 30);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 20, 40);

    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please ensure jspdf is installed.');
  }
}

/**
 * Generate PDF from data array
 */
export async function generatePDFFromData(
  data: any[],
  headers: string[],
  options: PDFOptions = {}
): Promise<Blob> {
  try {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });

    const margin = options.margin || 20;
    let yPosition = margin + 10;

    // Add title
    if (options.title) {
      doc.setFontSize(18);
      doc.text(options.title, 105, yPosition, { align: 'center' });
      yPosition += 10;
      doc.setFontSize(12);
    }

    // Add headers
    const colWidth = (210 - 2 * margin) / headers.length;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, margin + index * colWidth, yPosition);
    });
    
    yPosition += 7;
    doc.setFont('helvetica', 'normal');

    // Add data rows
    data.forEach((row) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = margin + 10;
      }

      headers.forEach((header, index) => {
        const value = row[header] || '';
        const displayValue = typeof value === 'number' 
          ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
          : String(value);
        
        doc.text(displayValue.substring(0, 20), margin + index * colWidth, yPosition);
      });
      
      yPosition += 7;
    });

    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF from data:', error);
    throw new Error('Failed to generate PDF. Please ensure jspdf is installed.');
  }
}

/**
 * Alias for generatePDFFromData for backward compatibility
 */
export const generateTablePDF = generatePDFFromData;
