// ZATCA (Zakat, Tax and Customs Authority) Integration Service
// For Saudi Arabia E-Invoicing Compliance

export interface ZATCAInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  invoiceType: 'standard' | 'simplified' | 'debit_note' | 'credit_note';
  currency: string;
  
  // Seller Information
  seller: {
    vatNumber: string;
    crNumber: string;
    name: string;
    nameAr: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  
  // Buyer Information
  buyer: {
    vatNumber?: string;
    crNumber?: string;
    name: string;
    nameAr?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  
  // Invoice Lines
  lines: ZATCAInvoiceLine[];
  
  // Tax Information
  taxSummary: {
    totalExcludingVAT: number;
    vatAmount: number;
    totalIncludingVAT: number;
    vatRate: number;
  };
  
  // ZATCA Specific Fields
  zatca: {
    uuid: string;
    hash: string;
    signature?: string;
    qrCode: string;
    submissionStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
    submissionDate?: string;
    rejectionReason?: string;
  };
}

export interface ZATCAInvoiceLine {
  id: string;
  description: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  vatRate: number;
  vatAmount: number;
  totalWithVAT: number;
}

export interface ZATCAConfiguration {
  environment: 'sandbox' | 'production';
  sellerVATNumber: string;
  sellerCRNumber: string;
  certificatePath?: string;
  privateKeyPath?: string;
  apiEndpoint: string;
  username?: string;
  password?: string;
}

class ZATCAService {
  private config: ZATCAConfiguration;

  constructor(config: ZATCAConfiguration) {
    this.config = config;
  }

  // Generate Invoice UUID
  generateInvoiceUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Generate Invoice Hash
  generateInvoiceHash(invoice: ZATCAInvoice): string {
    // Simplified hash generation - in production, use proper cryptographic hashing
    const hashData = `${invoice.invoiceNumber}${invoice.issueDate}${invoice.seller.vatNumber}${invoice.taxSummary.totalIncludingVAT}`;
    return Buffer.from(hashData).toString('base64');
  }

  // Generate QR Code Data
  generateQRCode(invoice: ZATCAInvoice): string {
    // ZATCA QR Code format (simplified)
    const qrData = {
      sellerName: invoice.seller.name,
      vatNumber: invoice.seller.vatNumber,
      timestamp: invoice.issueDate,
      totalWithVAT: invoice.taxSummary.totalIncludingVAT,
      vatAmount: invoice.taxSummary.vatAmount
    };
    
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  // Validate Invoice
  validateInvoice(invoice: ZATCAInvoice): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!invoice.invoiceNumber) errors.push('Invoice number is required');
    if (!invoice.issueDate) errors.push('Issue date is required');
    if (!invoice.seller.vatNumber) errors.push('Seller VAT number is required');
    if (!invoice.seller.crNumber) errors.push('Seller CR number is required');
    if (!invoice.lines || invoice.lines.length === 0) errors.push('Invoice must have at least one line item');

    // VAT number format validation (Saudi format: 15 digits)
    const vatRegex = /^\d{15}$/;
    if (invoice.seller.vatNumber && !vatRegex.test(invoice.seller.vatNumber)) {
      errors.push('Invalid seller VAT number format');
    }

    if (invoice.buyer.vatNumber && !vatRegex.test(invoice.buyer.vatNumber)) {
      errors.push('Invalid buyer VAT number format');
    }

    // Amount validation
    const calculatedTotal = invoice.lines.reduce((sum, line) => sum + line.totalWithVAT, 0);
    if (Math.abs(calculatedTotal - invoice.taxSummary.totalIncludingVAT) > 0.01) {
      errors.push('Invoice total does not match line items total');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create Invoice
  async createInvoice(invoiceData: Partial<ZATCAInvoice>): Promise<ZATCAInvoice> {
    try {
      // Generate required ZATCA fields
      const uuid = this.generateInvoiceUUID();
      
      const invoice: ZATCAInvoice = {
        id: invoiceData.id || `inv-${Date.now()}`,
        invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
        issueDate: invoiceData.issueDate || new Date().toISOString(),
        dueDate: invoiceData.dueDate,
        invoiceType: invoiceData.invoiceType || 'standard',
        currency: invoiceData.currency || 'SAR',
        seller: invoiceData.seller || {
          vatNumber: this.config.sellerVATNumber,
          crNumber: this.config.sellerCRNumber,
          name: 'Saudi Store',
          nameAr: 'المتجر السعودي',
          address: {
            street: 'King Fahd Road',
            city: 'Riyadh',
            postalCode: '12345',
            country: 'SA'
          }
        },
        buyer: invoiceData.buyer || {
          name: 'Customer',
          nameAr: 'العميل'
        },
        lines: invoiceData.lines || [],
        taxSummary: invoiceData.taxSummary || {
          totalExcludingVAT: 0,
          vatAmount: 0,
          totalIncludingVAT: 0,
          vatRate: 15
        },
        zatca: {
          uuid,
          hash: '',
          qrCode: '',
          submissionStatus: 'pending'
        }
      };

      // Calculate tax summary if not provided
      if (invoice.lines.length > 0) {
        const totalExcludingVAT = invoice.lines.reduce((sum, line) => sum + line.totalAmount, 0);
        const vatAmount = invoice.lines.reduce((sum, line) => sum + line.vatAmount, 0);
        const totalIncludingVAT = invoice.lines.reduce((sum, line) => sum + line.totalWithVAT, 0);

        invoice.taxSummary = {
          totalExcludingVAT,
          vatAmount,
          totalIncludingVAT,
          vatRate: 15
        };
      }

      // Generate hash and QR code
      invoice.zatca.hash = this.generateInvoiceHash(invoice);
      invoice.zatca.qrCode = this.generateQRCode(invoice);

      // Validate invoice
      const validation = this.validateInvoice(invoice);
      if (!validation.isValid) {
        throw new Error(`Invoice validation failed: ${validation.errors.join(', ')}`);
      }

      console.log(`✅ ZATCA invoice created: ${invoice.invoiceNumber} (${invoice.zatca.uuid})`);
      return invoice;

    } catch (error) {
      console.error('❌ Failed to create ZATCA invoice:', error);
      throw error;
    }
  }

  // Submit Invoice to ZATCA
  async submitInvoice(invoice: ZATCAInvoice): Promise<{ success: boolean; message: string; submissionId?: string }> {
    try {
      // In production, this would make actual API calls to ZATCA
      // For now, we'll simulate the submission
      
      console.log(`📤 Submitting invoice ${invoice.invoiceNumber} to ZATCA...`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure based on invoice validation
      const validation = this.validateInvoice(invoice);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: `Submission failed: ${validation.errors.join(', ')}`
        };
      }

      // Simulate successful submission
      const submissionId = `ZATCA-${Date.now()}`;
      
      // Update invoice status
      invoice.zatca.submissionStatus = 'submitted';
      invoice.zatca.submissionDate = new Date().toISOString();

      console.log(`✅ Invoice ${invoice.invoiceNumber} submitted successfully to ZATCA`);
      
      return {
        success: true,
        message: 'Invoice submitted successfully to ZATCA',
        submissionId
      };

    } catch (error) {
      console.error('❌ Failed to submit invoice to ZATCA:', error);
      
      // Update invoice status
      invoice.zatca.submissionStatus = 'rejected';
      invoice.zatca.rejectionReason = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        message: `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get Invoice Status from ZATCA
  async getInvoiceStatus(uuid: string): Promise<{ status: string; message: string }> {
    try {
      console.log(`📋 Checking ZATCA status for invoice: ${uuid}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different statuses
      const statuses = ['approved', 'pending', 'rejected'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        status: randomStatus,
        message: `Invoice ${uuid} is ${randomStatus}`
      };

    } catch (error) {
      console.error('❌ Failed to get invoice status from ZATCA:', error);
      throw error;
    }
  }

  // Generate Compliance Report
  async generateComplianceReport(startDate: string, endDate: string): Promise<{
    totalInvoices: number;
    submittedInvoices: number;
    approvedInvoices: number;
    rejectedInvoices: number;
    complianceRate: number;
    invoices: ZATCAInvoice[];
  }> {
    try {
      console.log(`📊 Generating ZATCA compliance report from ${startDate} to ${endDate}`);
      
      // In production, this would query the database for invoices in the date range
      // For now, we'll return mock data
      
      const mockInvoices: ZATCAInvoice[] = [
        // This would be populated from actual database
      ];

      const totalInvoices = mockInvoices.length;
      const submittedInvoices = mockInvoices.filter(inv => inv.zatca.submissionStatus !== 'pending').length;
      const approvedInvoices = mockInvoices.filter(inv => inv.zatca.submissionStatus === 'approved').length;
      const rejectedInvoices = mockInvoices.filter(inv => inv.zatca.submissionStatus === 'rejected').length;
      const complianceRate = totalInvoices > 0 ? (approvedInvoices / totalInvoices) * 100 : 0;

      return {
        totalInvoices,
        submittedInvoices,
        approvedInvoices,
        rejectedInvoices,
        complianceRate,
        invoices: mockInvoices
      };

    } catch (error) {
      console.error('❌ Failed to generate compliance report:', error);
      throw error;
    }
  }

  // Format Amount for Saudi Riyal
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Get Configuration
  getConfiguration(): ZATCAConfiguration {
    return { ...this.config };
  }

  // Update Configuration
  updateConfiguration(newConfig: Partial<ZATCAConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('✅ ZATCA configuration updated');
  }
}

// Default ZATCA Configuration
const defaultZATCAConfig: ZATCAConfiguration = {
  environment: process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
  sellerVATNumber: process.env.ZATCA_VAT_NUMBER || '123456789012345',
  sellerCRNumber: process.env.ZATCA_CR_NUMBER || '1234567890',
  apiEndpoint: process.env.ZATCA_API_ENDPOINT || 'https://gw-fatoora.zatca.gov.sa',
  username: process.env.ZATCA_USERNAME,
  password: process.env.ZATCA_PASSWORD
};

// Export singleton instance
export const zatcaService = new ZATCAService(defaultZATCAConfig);

// Export types and classes
export { ZATCAService };
