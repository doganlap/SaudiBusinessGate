/**
 * Procurement Export/Import Service
 * Handles Excel, PDF, CSV export and bulk import for procurement module
 */

import { procurementService, PurchaseOrder, Vendor, InventoryItem } from './procurement.service';
import ExcelJS from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Parser } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeHeaders?: boolean;
  dateRange?: { from: string; to: string };
  filters?: Record<string, any>;
}

export class ProcurementExportImportService {
  // ============================================================================
  // EXPORT - Purchase Orders
  // ============================================================================

  async exportPurchaseOrders(
    tenantId: string,
    options: ExportOptions
  ): Promise<Buffer> {
    const { format, filters } = options;
    const { orders } = await procurementService.getPurchaseOrders(tenantId, filters);

    switch (format) {
      case 'excel':
        return this.exportOrdersToExcel(orders);
      case 'pdf':
        return this.exportOrdersToPDF(orders);
      case 'csv':
        return this.exportOrdersToCSV(orders);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportOrdersToExcel(orders: PurchaseOrder[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchase Orders');

    // Add headers
    worksheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 20 },
      { header: 'Vendor', key: 'vendorName', width: 30 },
      { header: 'Order Date', key: 'orderDate', width: 15 },
      { header: 'Expected Delivery', key: 'expectedDelivery', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Requested By', key: 'requestedBy', width: 20 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
      { header: 'Notes', key: 'notes', width: 40 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    orders.forEach((order) => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        vendorName: order.vendorName,
        orderDate: order.orderDate,
        expectedDelivery: order.expectedDelivery,
        status: order.status?.toUpperCase(),
        priority: order.priority?.toUpperCase(),
        totalAmount: order.totalAmount || 0,
        currency: order.currency || 'SAR',
        category: order.category || '',
        requestedBy: order.requestedBy,
        approvedBy: order.approvedBy || '',
        notes: order.notes || '',
      });
    });

    // Format currency column
    worksheet.getColumn('totalAmount').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportOrdersToPDF(orders: PurchaseOrder[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const lineHeight = 20;
    let yPosition = pageHeight - margin;

    const addPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      return page;
    };

    let page = addPage();

    // Title
    page.drawText('Purchase Orders Report', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
    });
    yPosition -= 30;

    // Date
    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= 30;

    // Table headers
    const headers = ['Order #', 'Vendor', 'Date', 'Status', 'Amount'];
    const colWidths = [80, 150, 80, 80, 100];
    let xPosition = margin;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition,
        y: yPosition,
        size: 10,
        font: boldFont,
      });
      xPosition += colWidths[index];
    });
    yPosition -= lineHeight;

    // Draw line
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    // Data rows
    orders.forEach((order) => {
      if (yPosition < margin + 100) {
        page = addPage();
      }

      xPosition = margin;
      const rowData = [
        order.orderNumber || '',
        (order.vendorName || '').substring(0, 20),
        order.orderDate?.split('T')[0] || '',
        order.status?.toUpperCase() || '',
        `${order.currency || 'SAR'} ${(order.totalAmount || 0).toFixed(2)}`,
      ];

      rowData.forEach((text, index) => {
        page.drawText(text, {
          x: xPosition,
          y: yPosition,
          size: 9,
          font: font,
        });
        xPosition += colWidths[index];
      });
      yPosition -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private exportOrdersToCSV(orders: PurchaseOrder[]): Buffer {
    const csvData = orders.map((order) => ({
      'Order Number': order.orderNumber,
      Vendor: order.vendorName,
      'Order Date': order.orderDate,
      'Expected Delivery': order.expectedDelivery,
      Status: order.status,
      Priority: order.priority,
      'Total Amount': order.totalAmount || 0,
      Currency: order.currency || 'SAR',
      Category: order.category || '',
      'Requested By': order.requestedBy,
      'Approved By': order.approvedBy || '',
      Notes: order.notes || '',
    }));

    const csv = stringify(csvData, { header: true });
    return Buffer.from(csv, 'utf-8');
  }

  // ============================================================================
  // EXPORT - Vendors
  // ============================================================================

  async exportVendors(
    tenantId: string,
    options: ExportOptions
  ): Promise<Buffer> {
    const { format, filters } = options;
    const { vendors } = await procurementService.getVendors(tenantId, filters);

    switch (format) {
      case 'excel':
        return this.exportVendorsToExcel(vendors);
      case 'pdf':
        return this.exportVendorsToPDF(vendors);
      case 'csv':
        return this.exportVendorsToCSV(vendors);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportVendorsToExcel(vendors: Vendor[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vendors');

    worksheet.columns = [
      { header: 'Vendor Code', key: 'vendorCode', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Contact Person', key: 'contactPerson', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Total Orders', key: 'totalOrders', width: 12 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    vendors.forEach((vendor) => {
      worksheet.addRow({
        vendorCode: vendor.vendorCode,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        city: vendor.city,
        country: vendor.country,
        category: vendor.category,
        status: vendor.status?.toUpperCase(),
        rating: vendor.rating || 0,
        totalOrders: vendor.totalOrders || 0,
        totalValue: vendor.totalValue || 0,
      });
    });

    worksheet.getColumn('totalValue').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportVendorsToPDF(vendors: Vendor[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const lineHeight = 20;
    let yPosition = pageHeight - margin;

    const addPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      return page;
    };

    let page = addPage();

    page.drawText('Vendors Report', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
    });
    yPosition -= 30;

    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= 30;

    const headers = ['Code', 'Name', 'Contact', 'Email', 'Status'];
    const colWidths = [60, 150, 100, 150, 80];
    let xPosition = margin;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition,
        y: yPosition,
        size: 10,
        font: boldFont,
      });
      xPosition += colWidths[index];
    });
    yPosition -= lineHeight;

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    vendors.forEach((vendor) => {
      if (yPosition < margin + 100) {
        page = addPage();
      }

      xPosition = margin;
      const rowData = [
        vendor.vendorCode || '',
        (vendor.name || '').substring(0, 25),
        (vendor.contactPerson || '').substring(0, 15),
        (vendor.email || '').substring(0, 25),
        vendor.status?.toUpperCase() || '',
      ];

      rowData.forEach((text, index) => {
        page.drawText(text, {
          x: xPosition,
          y: yPosition,
          size: 9,
          font: font,
        });
        xPosition += colWidths[index];
      });
      yPosition -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private exportVendorsToCSV(vendors: Vendor[]): Buffer {
    const csvData = vendors.map((vendor) => ({
      'Vendor Code': vendor.vendorCode,
      Name: vendor.name,
      'Contact Person': vendor.contactPerson,
      Email: vendor.email,
      Phone: vendor.phone,
      City: vendor.city,
      Country: vendor.country,
      Category: vendor.category,
      Status: vendor.status,
      Rating: vendor.rating || 0,
      'Total Orders': vendor.totalOrders || 0,
      'Total Value': vendor.totalValue || 0,
    }));

    const csv = stringify(csvData, { header: true });
    return Buffer.from(csv, 'utf-8');
  }

  // ============================================================================
  // EXPORT - Inventory
  // ============================================================================

  async exportInventory(
    tenantId: string,
    options: ExportOptions
  ): Promise<Buffer> {
    const { format, filters } = options;
    const { inventory } = await procurementService.getInventory(tenantId, filters);

    switch (format) {
      case 'excel':
        return this.exportInventoryToExcel(inventory);
      case 'pdf':
        return this.exportInventoryToPDF(inventory);
      case 'csv':
        return this.exportInventoryToCSV(inventory);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportInventoryToExcel(items: InventoryItem[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');

    worksheet.columns = [
      { header: 'Item Code', key: 'itemCode', width: 15 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Current Stock', key: 'currentStock', width: 15 },
      { header: 'Min Stock', key: 'minStock', width: 12 },
      { header: 'Max Stock', key: 'maxStock', width: 12 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Location', key: 'location', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    items.forEach((item) => {
      worksheet.addRow({
        itemCode: item.itemCode,
        sku: item.sku,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock || 0,
        minStock: item.minStock || 0,
        maxStock: item.maxStock || 0,
        unitPrice: item.unitPrice || 0,
        totalValue: item.totalValue || 0,
        status: item.status?.toUpperCase().replace('-', ' '),
        location: item.location || '',
      });
    });

    worksheet.getColumn('unitPrice').numFmt = '#,##0.00';
    worksheet.getColumn('totalValue').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async exportInventoryToPDF(items: InventoryItem[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const lineHeight = 20;
    let yPosition = pageHeight - margin;

    const addPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
      return page;
    };

    let page = addPage();

    page.drawText('Inventory Report', {
      x: margin,
      y: yPosition,
      size: 16,
      font: boldFont,
    });
    yPosition -= 30;

    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= 30;

    const headers = ['Code', 'Name', 'Stock', 'Price', 'Value', 'Status'];
    const colWidths = [70, 180, 60, 70, 80, 80];
    let xPosition = margin;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition,
        y: yPosition,
        size: 10,
        font: boldFont,
      });
      xPosition += colWidths[index];
    });
    yPosition -= lineHeight;

    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    items.forEach((item) => {
      if (yPosition < margin + 100) {
        page = addPage();
      }

      xPosition = margin;
      const rowData = [
        item.itemCode || '',
        (item.name || '').substring(0, 28),
        (item.currentStock || 0).toString(),
        `${item.currency || 'SAR'} ${(item.unitPrice || 0).toFixed(2)}`,
        `${item.currency || 'SAR'} ${(item.totalValue || 0).toFixed(2)}`,
        item.status?.toUpperCase().replace('-', ' ') || '',
      ];

      rowData.forEach((text, index) => {
        page.drawText(text, {
          x: xPosition,
          y: yPosition,
          size: 9,
          font: font,
        });
        xPosition += colWidths[index];
      });
      yPosition -= lineHeight;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private exportInventoryToCSV(items: InventoryItem[]): Buffer {
    const csvData = items.map((item) => ({
      'Item Code': item.itemCode,
      SKU: item.sku,
      Name: item.name,
      Category: item.category,
      'Current Stock': item.currentStock || 0,
      'Min Stock': item.minStock || 0,
      'Max Stock': item.maxStock || 0,
      'Unit Price': item.unitPrice || 0,
      'Total Value': item.totalValue || 0,
      Status: item.status,
      Location: item.location || '',
    }));

    const csv = stringify(csvData, { header: true });
    return Buffer.from(csv, 'utf-8');
  }

  // ============================================================================
  // IMPORT - Vendors
  // ============================================================================

  async importVendors(
    tenantId: string,
    fileBuffer: Buffer,
    format: 'excel' | 'csv'
  ): Promise<{ success: number; errors: string[] }> {
    let vendors: any[] = [];

    if (format === 'csv') {
      vendors = await this.parseCSV(fileBuffer);
    } else if (format === 'excel') {
      vendors = await this.parseExcel(fileBuffer);
    }

    const errors: string[] = [];
    let success = 0;

    for (const vendorData of vendors) {
      try {
        await procurementService.createVendor(tenantId, {
          name: vendorData.name || vendorData['Name'],
          nameAr: vendorData.nameAr || vendorData['Name (Arabic)'],
          contactPerson: vendorData.contactPerson || vendorData['Contact Person'],
          email: vendorData.email || vendorData['Email'],
          phone: vendorData.phone || vendorData['Phone'],
          address: vendorData.address || vendorData['Address'],
          city: vendorData.city || vendorData['City'],
          country: vendorData.country || vendorData['Country'],
          category: vendorData.category || vendorData['Category'],
          vendorType: vendorData.vendorType || vendorData['Vendor Type'],
          status: vendorData.status || vendorData['Status'] || 'pending',
          paymentTerms: vendorData.paymentTerms || vendorData['Payment Terms'],
          notes: vendorData.notes || vendorData['Notes'],
        });
        success++;
      } catch (error: any) {
        errors.push(`Failed to import vendor ${vendorData.name || 'unknown'}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  // ============================================================================
  // IMPORT - Inventory
  // ============================================================================

  async importInventory(
    tenantId: string,
    fileBuffer: Buffer,
    format: 'excel' | 'csv'
  ): Promise<{ success: number; errors: string[] }> {
    let items: any[] = [];

    if (format === 'csv') {
      items = await this.parseCSV(fileBuffer);
    } else if (format === 'excel') {
      items = await this.parseExcel(fileBuffer);
    }

    const errors: string[] = [];
    let success = 0;

    for (const itemData of items) {
      try {
        await procurementService.createInventoryItem(tenantId, {
          name: itemData.name || itemData['Name'],
          nameAr: itemData.nameAr || itemData['Name (Arabic)'],
          category: itemData.category || itemData['Category'],
          subcategory: itemData.subcategory || itemData['Subcategory'],
          sku: itemData.sku || itemData['SKU'],
          barcode: itemData.barcode || itemData['Barcode'],
          currentStock: parseInt(itemData.currentStock || itemData['Current Stock'] || '0'),
          minStock: parseInt(itemData.minStock || itemData['Min Stock'] || '0'),
          maxStock: parseInt(itemData.maxStock || itemData['Max Stock'] || '1000'),
          unitPrice: parseFloat(itemData.unitPrice || itemData['Unit Price'] || '0'),
          location: itemData.location || itemData['Location'],
          unitOfMeasure: itemData.unitOfMeasure || itemData['Unit of Measure'] || 'unit',
        });
        success++;
      } catch (error: any) {
        errors.push(`Failed to import item ${itemData.name || 'unknown'}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const parser = new Parser({
        columns: true,
        skip_empty_lines: true,
      });

      const records: any[] = [];
      parser.on('readable', function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', reject);
      parser.on('end', () => resolve(records));

      parser.write(buffer.toString('utf-8'));
      parser.end();
    });
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const records: any[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const record: any = {};
      row.eachCell((cell, colNumber) => {
        const header = worksheet.getRow(1).getCell(colNumber).value?.toString() || '';
        record[header] = cell.value?.toString() || '';
      });
      records.push(record);
    });

    return records;
  }
}

export const procurementExportImportService = new ProcurementExportImportService();

