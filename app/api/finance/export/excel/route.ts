import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

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

    try {
      // Use exceljs library for secure Excel generation
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      
      // Prepare worksheet data
      if (data.length > 0) {
        // Get headers from first row
        const headers = Object.keys(data[0]);
        worksheet.columns = headers.map(header => ({
          header: header,
          key: header,
          width: 15
        }));

        // Add rows
        data.forEach(row => {
          const formattedRow: any = {};
          Object.keys(row).forEach(key => {
            const value = row[key];
            if (value instanceof Date) {
              formattedRow[key] = value;
            } else if (typeof value === 'object' && value !== null) {
              formattedRow[key] = JSON.stringify(value);
            } else {
              formattedRow[key] = value ?? '';
            }
          });
          worksheet.addRow(formattedRow);
        });
      }

      // Generate Excel file buffer
      const excelBuffer = await workbook.xlsx.writeBuffer();

      const filename = options?.filename || `finance-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } catch (importError) {
      console.error('Error importing exceljs:', importError);
      // If exceljs is not available, return JSON for client-side processing
      return NextResponse.json({
        data,
        options,
        message: 'Excel library not available on server. Please use client-side export.'
      });
    }
  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

