/**
 * SAP Integration Service
 * Handles SAP connections, document posting, and data synchronization
 */

const axios = require('axios');
const logger = require('../logger');
const { SAPServiceError } = require('../error-handler');

class SAPService {
  constructor(config) {
    this.config = config;
    this.initializeConnection();
  }

  initializeConnection() {
    try {
      this.sapClient = axios.create({
        baseURL: this.config.SAP_API_GATEWAY_URL,
        auth: {
          username: this.config.SAP_USERNAME,
          password: this.config.SAP_PASSWORD
        },
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info('SAP service initialized');
    } catch (error) {
      logger.error(`Failed to initialize SAP service: ${error.message}`);
      throw new SAPServiceError(`SAP initialization failed: ${error.message}`);
    }
  }

  /**
   * Create purchase order in SAP
   */
  async createPurchaseOrder(orderData) {
    try {
      const payload = {
        PurchasingDocumentType: orderData.type || 'NB',
        Vendor: orderData.vendor,
        DocumentDate: new Date().toISOString().split('T')[0],
        PurchasingOrganization: orderData.purchasingOrg || this.config.SAP_DEFAULT_PO_ORG,
        PurchasingGroup: orderData.purchasingGroup || this.config.SAP_DEFAULT_PO_GROUP,
        CompanyCode: orderData.companyCode || this.config.SAP_COMPANY_CODE,
        Currency: orderData.currency || 'USD',
        to_PurchasingDocumentItem: this.formatPOItems(orderData.items)
      };

      const response = await this.sapClient.post('/odata/v4/PurchasingOrderService', payload);

      logger.info(`Purchase Order created in SAP: ${response.data.PurchasingDocument}`);

      return {
        success: true,
        poNumber: response.data.PurchasingDocument,
        poItem: response.data.PurchasingDocumentItem,
        status: response.data.DocumentStatus,
        createdAt: response.data.DocumentDate
      };
    } catch (error) {
      logger.error(`Failed to create PO in SAP: ${error.message}`);
      throw new SAPServiceError(`PO creation failed: ${error.message}`);
    }
  }

  /**
   * Post invoice to SAP
   */
  async postInvoice(invoiceData) {
    try {
      const payload = {
        CompanyCode: invoiceData.companyCode || this.config.SAP_COMPANY_CODE,
        DocumentType: invoiceData.type || 'RE',
        PostingDate: new Date().toISOString().split('T')[0],
        DocumentDate: invoiceData.documentDate || new Date().toISOString().split('T')[0],
        DocumentCurrency: invoiceData.currency || 'USD',
        Vendor: invoiceData.vendor,
        InvoiceNumber: invoiceData.invoiceNumber,
        GrossInvoiceAmount: invoiceData.amount,
        to_AccountingDocumentLineItem: this.formatInvoiceItems(invoiceData.items)
      };

      const response = await this.sapClient.post('/odata/v4/AccountingDocumentService', payload);

      logger.info(`Invoice posted in SAP: ${response.data.AccountingDocument}`);

      return {
        success: true,
        documentNumber: response.data.AccountingDocument,
        fiscalYear: response.data.FiscalYear,
        status: 'Posted',
        reference: response.data.reference
      };
    } catch (error) {
      logger.error(`Failed to post invoice in SAP: ${error.message}`);
      throw new SAPServiceError(`Invoice posting failed: ${error.message}`);
    }
  }

  /**
   * Format PO items for SAP
   */
  formatPOItems(items) {
    return items.map((item, index) => ({
      PurchasingDocumentLineItemNumber: (index + 1) * 10,
      Material: item.material || item.sku,
      Quantity: item.quantity,
      UnitOfMeasure: item.unit || 'EA',
      NetPrice: item.unitPrice,
      PurchasingUnitOfMeasure: item.unit || 'EA',
      DeliveryDate: item.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Plant: item.plant || this.config.SAP_DEFAULT_PLANT,
      StorageLocation: item.storageLocation || this.config.SAP_DEFAULT_STORAGE_LOCATION
    }));
  }

  /**
   * Format invoice items for SAP
   */
  formatInvoiceItems(items) {
    return items.map((item, index) => ({
      CompanyCodeLineItemNumber: index + 1,
      GLAccount: item.glAccount,
      DebitCreditCode: item.debitCredit || 'D',
      Amount: item.amount,
      TaxCode: item.taxCode || '1',
      CostCenter: item.costCenter,
      ProfitCenter: item.profitCenter
    }));
  }

  /**
   * Get vendor master data from SAP
   */
  async getVendorData(vendorNumber) {
    try {
      const response = await this.sapClient.get(`/odata/v4/VendorService/${vendorNumber}`);

      logger.info(`Vendor data retrieved: ${vendorNumber}`);

      return {
        success: true,
        vendor: response.data
      };
    } catch (error) {
      logger.error(`Failed to retrieve vendor data: ${error.message}`);
      throw new SAPServiceError(`Vendor retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get material master data from SAP
   */
  async getMaterialData(material) {
    try {
      const response = await this.sapClient.get(`/odata/v4/MaterialService/${material}`);

      logger.info(`Material data retrieved: ${material}`);

      return {
        success: true,
        material: response.data
      };
    } catch (error) {
      logger.error(`Failed to retrieve material data: ${error.message}`);
      throw new SAPServiceError(`Material retrieval failed: ${error.message}`);
    }
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(poNumber, approverComments = '') {
    try {
      const payload = {
        PurchasingDocument: poNumber,
        DocumentStatus: 'Released',
        ApprovalComments: approverComments,
        ApprovalDate: new Date().toISOString().split('T')[0]
      };

      const response = await this.sapClient.patch(`/odata/v4/PurchasingOrderService/${poNumber}`, payload);

      logger.info(`PO approved in SAP: ${poNumber}`);

      return {
        success: true,
        poNumber,
        status: 'Released',
        approvedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to approve PO: ${error.message}`);
      throw new SAPServiceError(`PO approval failed: ${error.message}`);
    }
  }

  /**
   * Get PO status
   */
  async getPOStatus(poNumber) {
    try {
      const response = await this.sapClient.get(`/odata/v4/PurchasingOrderService/${poNumber}`);

      logger.info(`PO status retrieved: ${poNumber}`);

      return {
        success: true,
        poNumber,
        status: response.data.DocumentStatus,
        vendor: response.data.Vendor,
        amount: response.data.GrossAmount,
        items: response.data.to_PurchasingDocumentItem.length,
        createdDate: response.data.DocumentDate
      };
    } catch (error) {
      logger.error(`Failed to get PO status: ${error.message}`);
      throw new SAPServiceError(`PO status retrieval failed: ${error.message}`);
    }
  }

  /**
   * Sync invoice to SAP from document processing
   */
  async syncInvoiceToSAP(documentData) {
    try {
      const invoiceData = {
        companyCode: documentData.companyCode || this.config.SAP_COMPANY_CODE,
        vendor: documentData.vendor || documentData.vendorCode,
        invoiceNumber: documentData.invoiceNumber || documentData.documentNumber,
        amount: documentData.totalAmount || documentData.amount,
        documentDate: documentData.documentDate,
        currency: documentData.currency || 'USD',
        items: (documentData.items || []).map(item => ({
          glAccount: item.glAccount || this.config.SAP_DEFAULT_GL_ACCOUNT,
          amount: item.amount,
          taxCode: item.taxCode || '1',
          costCenter: item.costCenter || this.config.SAP_DEFAULT_COST_CENTER
        }))
      };

      const result = await this.postInvoice(invoiceData);

      logger.info(`Invoice synced to SAP from document: ${documentData.id}`);

      return {
        success: true,
        documentId: documentData.id,
        sapDocumentNumber: result.documentNumber,
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to sync invoice to SAP: ${error.message}`);
      throw new SAPServiceError(`Invoice sync failed: ${error.message}`);
    }
  }

  /**
   * Get SAP GL account master
   */
  async getGLAccount(glAccount) {
    try {
      const response = await this.sapClient.get(`/odata/v4/GLAccountService/${glAccount}`);

      logger.info(`GL Account data retrieved: ${glAccount}`);

      return {
        success: true,
        glAccount: response.data
      };
    } catch (error) {
      logger.error(`Failed to retrieve GL account: ${error.message}`);
      throw new SAPServiceError(`GL Account retrieval failed: ${error.message}`);
    }
  }

  /**
   * Create purchase requisition in SAP
   */
  async createPurchaseRequisition(requisitionData) {
    try {
      const payload = {
        PurchaseRequisitionType: requisitionData.type || 'NB',
        PurchasingOrganization: requisitionData.purchasingOrg || this.config.SAP_DEFAULT_PO_ORG,
        PurchasingGroup: requisitionData.purchasingGroup || this.config.SAP_DEFAULT_PO_GROUP,
        CreationDate: new Date().toISOString().split('T')[0],
        to_PurchaseRequisitionItem: this.formatPRItems(requisitionData.items)
      };

      const response = await this.sapClient.post('/odata/v4/PurchaseRequisitionService', payload);

      logger.info(`Purchase Requisition created in SAP: ${response.data.PurchaseRequisition}`);

      return {
        success: true,
        prNumber: response.data.PurchaseRequisition,
        status: response.data.DocumentStatus,
        createdAt: response.data.CreationDate
      };
    } catch (error) {
      logger.error(`Failed to create PR in SAP: ${error.message}`);
      throw new SAPServiceError(`PR creation failed: ${error.message}`);
    }
  }

  /**
   * Format PR items for SAP
   */
  formatPRItems(items) {
    return items.map((item, index) => ({
      PurchaseRequisitionLineItemNumber: (index + 1) * 10,
      Material: item.material || item.sku,
      Quantity: item.quantity,
      UnitOfMeasure: item.unit || 'EA',
      DesiredPrice: item.desiredPrice,
      DeliveryDate: item.deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Plant: item.plant || this.config.SAP_DEFAULT_PLANT,
      StorageLocation: item.storageLocation || this.config.SAP_DEFAULT_STORAGE_LOCATION,
      CostCenter: item.costCenter
    }));
  }
}

module.exports = SAPService;