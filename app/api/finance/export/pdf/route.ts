import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// For better PDF generation, you can use jsPDF or puppeteer
// For now, we return HTML that can be printed to PDF

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, options } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'No data provided for export' },
        { status: 400 }
      );
    }

    // Try to use jsPDF for server-side PDF generation
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const title = options?.title || 'Financial Report';
      const date = new Date().toLocaleDateString();

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${date}`, 14, 28);
      
      if (options?.dateRange) {
        doc.text(`Period: ${options.dateRange.start} to ${options.dateRange.end}`, 14, 33);
      }

      // Prepare table data
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const rows = data.map(row => 
        headers.map(header => {
          const value = row[header];
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
          return String(value || '');
        })
      );

      // Add table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: options?.dateRange ? 40 : 35,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 35 }
      });

      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      const filename = options?.filename || `finance-report-${new Date().toISOString().slice(0, 10)}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } catch (importError) {
      // Fallback to HTML if jsPDF is not available
      console.warn('jsPDF not available, using HTML fallback:', importError);
      const htmlContent = generatePDFHTML(data, options);
      
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${options?.filename || 'report'}.html"`
        }
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(data: any[], options: any): string {
  const title = options?.title || 'Financial Report';
  const date = new Date().toLocaleDateString();

  const tableRows = data.map(row => {
    const cells = Object.entries(row).map(([key, value]) => {
      const displayValue = value instanceof Date 
        ? value.toLocaleDateString() 
        : typeof value === 'number' 
          ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
          : String(value || '');
      return `<td>${displayValue}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const headers = data.length > 0 ? Object.keys(data[0]).map(key => `<th>${key}</th>`).join('') : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    .meta {
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p>Generated on: ${date}</p>
    ${options?.dateRange ? `<p>Period: ${options.dateRange.start} to ${options.dateRange.end}</p>` : ''}
  </div>
  <table>
    <thead>
      <tr>${headers}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <div class="footer">
    <p>This report was generated automatically by the Finance Management System</p>
  </div>
</body>
</html>
  `;
}
