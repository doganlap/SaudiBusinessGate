/**
 * Data Export/Import Service
 * Easy data migration and backup
 * 
 * Features:
 * - Export to CSV, Excel, JSON
 * - Import from CSV, Excel, JSON
 * - Bulk operations
 * - Data validation
 * - Progress tracking
 */

import ExcelJS from 'exceljs';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields?: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
}

export interface ImportOptions {
  format: 'csv' | 'excel' | 'json';
  validate?: boolean;
  skipErrors?: boolean;
  batchSize?: number;
}

export interface ExportResult {
  filename: string;
  contentType: string;
  data: Buffer | string;
  recordCount: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors?: Array<{ row: number; error: string }>;
}

export class DataExportImportService {
  /**
   * Export data to file
   */
  async export(
    module: string,
    data: any[],
    options: ExportOptions
  ): Promise<ExportResult> {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'json':
        return this.exportToJSON(data, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(
    data: any[],
    options: ExportOptions
  ): Promise<ExportResult> {
    if (data.length === 0) {
      return {
        filename: 'export.csv',
        contentType: 'text/csv',
        data: '',
        recordCount: 0,
      };
    }

    const fields = options.fields || Object.keys(data[0]);
    let csvContent = '';

    // Add headers if requested
    if (options.includeHeaders !== false) {
      csvContent += fields.map(f => this.escapeCSV(f)).join(',') + '\n';
    }

    // Add data rows
    data.forEach(row => {
      const values = fields.map(field => {
        const value = row[field];
        return value !== undefined && value !== null ? this.escapeCSV(String(value)) : '';
      });
      csvContent += values.join(',') + '\n';
    });

    return {
      filename: `export-${Date.now()}.csv`,
      contentType: 'text/csv',
      data: csvContent,
      recordCount: data.length,
    };
  }

  /**
   * Export to Excel
   */
  private async exportToExcel(
    data: any[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    if (data.length === 0) {
      return {
        filename: 'export.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: Buffer.from([]),
        recordCount: 0,
      };
    }

    const fields = options.fields || Object.keys(data[0]);

    // Add headers
    if (options.includeHeaders !== false) {
      worksheet.addRow(fields);
      
      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Add data rows
    data.forEach(row => {
      const values = fields.map(field => row[field] ?? '');
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      filename: `export-${Date.now()}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data: Buffer.from(buffer),
      recordCount: data.length,
    };
  }

  /**
   * Export to JSON
   */
  private async exportToJSON(
    data: any[],
    options: ExportOptions
  ): Promise<ExportResult> {
    const fields = options.fields;
    const jsonData = fields
      ? data.map(row => {
          const filtered: Record<string, any> = {};
          fields.forEach(field => {
            filtered[field] = row[field];
          });
          return filtered;
        })
      : data;

    const jsonContent = JSON.stringify(jsonData, null, 2);

    return {
      filename: `export-${Date.now()}.json`,
      contentType: 'application/json',
      data: jsonContent,
      recordCount: data.length,
    };
  }

  /**
   * Import data from file
   */
  async import(
    module: string,
    file: Buffer | string,
    options: ImportOptions
  ): Promise<ImportResult> {
    switch (options.format) {
      case 'csv':
        return this.importFromCSV(module, file, options);
      case 'excel':
        return this.importFromExcel(module, file, options);
      case 'json':
        return this.importFromJSON(module, file, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Import from CSV
   */
  private async importFromCSV(
    module: string,
    file: Buffer | string,
    options: ImportOptions
  ): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      let rowIndex = 0;

      const stream = Readable.from(file instanceof Buffer ? file.toString() : file)
        .pipe(csv())
        .on('data', (row) => {
          rowIndex++;
          try {
            if (options.validate && !this.validateRow(row, module)) {
              if (!options.skipErrors) {
                errors.push({ row: rowIndex, error: 'Validation failed' });
                return;
              }
            }
            results.push(row);
          } catch (error: any) {
            if (!options.skipErrors) {
              errors.push({ row: rowIndex, error: error.message });
            }
          }
        })
        .on('end', () => {
          resolve({
            success: results.length,
            failed: errors.length,
            errors: errors.length > 0 ? errors : undefined,
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Import from Excel
   */
  private async importFromExcel(
    module: string,
    file: Buffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);

        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
          reject(new Error('Worksheet not found'));
          return;
        }

        const results: any[] = [];
        const errors: Array<{ row: number; error: string }> = [];

        // Get headers from first row
        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value?.toString() || '';
        });

        // Process data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          try {
            const rowData: Record<string, any> = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber - 1];
              if (header) {
                rowData[header] = cell.value;
              }
            });

            if (options.validate && !this.validateRow(rowData, module)) {
              if (!options.skipErrors) {
                errors.push({ row: rowNumber, error: 'Validation failed' });
                return;
              }
            }

            results.push(rowData);
          } catch (error: any) {
            if (!options.skipErrors) {
              errors.push({ row: rowNumber, error: error.message });
            }
          }
        });

        resolve({
          success: results.length,
          failed: errors.length,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }

  /**
   * Import from JSON
   */
  private async importFromJSON(
    module: string,
    file: Buffer | string,
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      const jsonData = JSON.parse(file instanceof Buffer ? file.toString() : file);
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      const results: any[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      dataArray.forEach((row, index) => {
        try {
          if (options.validate && !this.validateRow(row, module)) {
            if (!options.skipErrors) {
              errors.push({ row: index + 1, error: 'Validation failed' });
              return;
            }
          }
          results.push(row);
        } catch (error: any) {
          if (!options.skipErrors) {
            errors.push({ row: index + 1, error: error.message });
          }
        }
      });

      return {
        success: results.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      throw new Error(`JSON parse error: ${error.message}`);
    }
  }

  /**
   * Validate row data
   */
  private validateRow(row: any, module: string): boolean {
    // Basic validation - can be extended with module-specific rules
    return row && typeof row === 'object' && Object.keys(row).length > 0;
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

// Export singleton instance
export const dataExportImport = new DataExportImportService();

