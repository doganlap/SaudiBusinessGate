/**
 * Document Processing API Routes
 * Real routes for document upload, processing, and management
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const logger = require('../logger');
const { authenticate, authorize, rateLimit } = require('../auth');
const ValidationService = require('../validation');
const AzureService = require('./services/azure-service');
const EmailService = require('./services/email-service');
const SharePointService = require('./services/sharepoint-service');
const AILLMService = require('./services/ai-llm-service');
const SAPService = require('./services/sap-service');
const FolderStorageService = require('./services/folder-storage-service');
const AuditLogger = require('../audit-logger');

// Initialize services
let azureService, emailService, sharePointService, aiService, sapService, folderService, auditLogger;

function initializeServices(config) {
  azureService = new AzureService(config);
  emailService = new EmailService(config);
  sharePointService = new SharePointService(config);
  aiService = new AILLMService(config);
  sapService = new SAPService(config);
  folderService = new FolderStorageService(config);
  auditLogger = new AuditLogger(config);
}

// Multer file upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52428800 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * POST /api/documents/upload
 * Upload document to multiple destinations (Azure, SharePoint, Local Folder)
 */
router.post('/upload', authenticate, rateLimit, upload.single('document'), async (req, res, next) => {
  try {
    const { destination = 'all', subfolder = '', documentType = 'document' } = req.body;
    
    // Validate input
    ValidationService.validateDocumentUpload({
      file: req.file,
      destination,
      documentType
    });

    const uploadResults = {
      success: true,
      destinations: []
    };

    const metadata = {
      userId: req.user.id,
      uploadedBy: req.user.email,
      documentType,
      uploadedAt: new Date().toISOString()
    };

    // Upload to Azure Blob Storage
    if (['all', 'azure'].includes(destination)) {
      try {
        const result = await azureService.uploadDocument(req.file, 'documents', metadata);
        uploadResults.destinations.push({ service: 'Azure', ...result });
      } catch (error) {
        logger.error(`Azure upload failed: ${error.message}`);
        uploadResults.destinations.push({ service: 'Azure', success: false, error: error.message });
      }
    }

    // Upload to SharePoint
    if (['all', 'sharepoint'].includes(destination)) {
      try {
        const result = await sharePointService.uploadToSharePoint(req.file, 'site', 'Shared Documents', subfolder);
        uploadResults.destinations.push({ service: 'SharePoint', ...result });
      } catch (error) {
        logger.error(`SharePoint upload failed: ${error.message}`);
        uploadResults.destinations.push({ service: 'SharePoint', success: false, error: error.message });
      }
    }

    // Upload to OneDrive
    if (['all', 'onedrive'].includes(destination)) {
      try {
        const result = await sharePointService.uploadToOneDrive(req.file, subfolder);
        uploadResults.destinations.push({ service: 'OneDrive', ...result });
      } catch (error) {
        logger.error(`OneDrive upload failed: ${error.message}`);
        uploadResults.destinations.push({ service: 'OneDrive', success: false, error: error.message });
      }
    }

    // Save to local folder storage
    if (['all', 'folder'].includes(destination)) {
      try {
        const result = await folderService.saveDocument(req.file, subfolder, metadata);
        uploadResults.destinations.push({ service: 'FolderStorage', ...result });
      } catch (error) {
        logger.error(`Folder storage failed: ${error.message}`);
        uploadResults.destinations.push({ service: 'FolderStorage', success: false, error: error.message });
      }
    }

    // Log audit
    await auditLogger.logDocumentOperation('upload', req.file.filename, req.user.id, { destination });

    res.json(uploadResults);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/analyze
 * Analyze document using Azure and AI services
 */
router.post('/analyze', authenticate, rateLimit, upload.single('document'), async (req, res, next) => {
  try {
    const { method = 'all', documentType = 'invoice' } = req.body;

    ValidationService.validateDocumentUpload({ file: req.file });

    const analysisResults = {
      success: true,
      analysis: {}
    };

    // Azure Form Recognizer analysis
    if (['all', 'azure'].includes(method)) {
      try {
        const result = await azureService.analyzeDocument(req.file.buffer, documentType);
        analysisResults.analysis.azure = result;
      } catch (error) {
        logger.error(`Azure analysis failed: ${error.message}`);
        analysisResults.analysis.azure = { success: false, error: error.message };
      }
    }

    // GPT analysis
    if (['all', 'gpt'].includes(method)) {
      try {
        const textContent = req.file.buffer.toString('utf-8');
        const result = await aiService.analyzeDocumentWithGPT(textContent, documentType);
        analysisResults.analysis.gpt = result;
      } catch (error) {
        logger.error(`GPT analysis failed: ${error.message}`);
        analysisResults.analysis.gpt = { success: false, error: error.message };
      }
    }

    // Classification
    try {
      const textContent = req.file.buffer.toString('utf-8');
      const classification = await aiService.classifyDocument(textContent);
      analysisResults.classification = classification;
    } catch (error) {
      logger.error(`Classification failed: ${error.message}`);
      analysisResults.classification = { success: false, error: error.message };
    }

    // Log audit
    await auditLogger.logDocumentOperation('analyze', req.file.filename, req.user.id);

    res.json(analysisResults);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/extract
 * Extract structured data from document
 */
router.post('/extract', authenticate, rateLimit, upload.single('document'), async (req, res, next) => {
  try {
    const { schema } = req.body;

    ValidationService.validateDocumentUpload({ file: req.file });

    if (!schema) {
      return res.status(400).json({ error: 'Schema is required' });
    }

    const textContent = req.file.buffer.toString('utf-8');
    const extractedData = await aiService.extractStructuredData(textContent, schema);

    await auditLogger.logDocumentOperation('extract', req.file.filename, req.user.id);

    res.json(extractedData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/sap-sync
 * Sync document data to SAP
 */
router.post('/sap-sync', authenticate, authorize(['admin', 'sap_manager']), rateLimit, async (req, res, next) => {
  try {
    const { documentId, documentData, operation = 'invoice' } = req.body;

    ValidationService.validateSAPPayload(documentData);

    let result;

    switch (operation) {
      case 'invoice':
        result = await sapService.syncInvoiceToSAP(documentData);
        break;
      case 'po':
        result = await sapService.createPurchaseOrder(documentData);
        break;
      case 'pr':
        result = await sapService.createPurchaseRequisition(documentData);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    await auditLogger.logDocumentOperation('sap_sync', documentId, req.user.id, { operation, result });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/send-email
 * Send document via email
 */
router.post('/send-email', authenticate, rateLimit, async (req, res, next) => {
  try {
    const { to, subject, body, documentPath, provider = 'smtp' } = req.body;

    ValidationService.validateEmail({ to, subject });

    let result;

    switch (provider) {
      case 'gmail':
        result = await emailService.sendEmailGmail(to, subject, body);
        break;
      case 'outlook':
        result = await emailService.sendEmailOutlook(to, subject, body);
        break;
      case 'smtp':
      default:
        result = await emailService.sendEmailSMTP(to, subject, body);
    }

    await auditLogger.logDocumentOperation('email_sent', to, req.user.id, { provider, subject });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/list
 * List documents from storage
 */
router.get('/list', authenticate, rateLimit, async (req, res, next) => {
  try {
    const { storage = 'folder', subfolder = '' } = req.query;

    let result;

    switch (storage) {
      case 'azure':
        result = await azureService.listDocuments('documents', subfolder);
        break;
      case 'sharepoint':
        result = await sharePointService.listSharePointDocuments('site', 'Shared Documents', subfolder);
        break;
      case 'onedrive':
        result = await sharePointService.listOneDriveDocuments(subfolder);
        break;
      case 'folder':
      default:
        result = await folderService.listDocuments(subfolder);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/search
 * Search documents
 */
router.get('/search', authenticate, rateLimit, async (req, res, next) => {
  try {
    const { query, storage = 'folder', subfolder = '' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let result;

    switch (storage) {
      case 'sharepoint':
        result = await sharePointService.searchSharePoint(query, 'site');
        break;
      case 'folder':
      default:
        result = await folderService.searchDocuments(query, subfolder);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/documents/:id
 * Delete document
 */
router.delete('/:id', authenticate, rateLimit, async (req, res, next) => {
  try {
    const { storage = 'folder' } = req.query;
    const documentPath = req.params.id;

    let result;

    switch (storage) {
      case 'azure':
        result = await azureService.deleteDocument('documents', documentPath);
        break;
      case 'sharepoint':
        result = await sharePointService.deleteFromSharePoint('site', documentPath);
        break;
      case 'folder':
      default:
        result = await folderService.deleteDocument(documentPath);
    }

    await auditLogger.logDocumentOperation('delete', documentPath, req.user.id, { storage });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/batch-process
 * Batch process multiple documents
 */
router.post('/batch-process', authenticate, rateLimit, async (req, res, next) => {
  try {
    const { documents, operation = 'analyze' } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const result = await aiService.batchProcessWithLLM(documents, operation);

    await auditLogger.logDocumentOperation('batch_process', `${documents.length} documents`, req.user.id, { operation });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  router,
  initializeServices
};