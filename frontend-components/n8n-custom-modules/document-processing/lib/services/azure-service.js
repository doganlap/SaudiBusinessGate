/**
 * Azure Services Integration
 * Handles Azure Storage, Cognitive Services, and AI capabilities
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const { TextAnalyticsClient } = require('@azure/ai-text-analytics');
const logger = require('../logger');
const { AzureServiceError } = require('../error-handler');

class AzureService {
  constructor(config) {
    this.config = config;
    this.initializeClients();
  }

  initializeClients() {
    try {
      // Azure Blob Storage
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        this.config.AZURE_STORAGE_CONNECTION_STRING
      );

      // Azure Form Recognizer (Document Analysis)
      this.formRecognizerClient = new DocumentAnalysisClient(
        this.config.AZURE_FORM_RECOGNIZER_ENDPOINT,
        new AzureKeyCredential(this.config.AZURE_FORM_RECOGNIZER_KEY)
      );

      // Azure Text Analytics
      this.textAnalyticsClient = new TextAnalyticsClient(
        this.config.AZURE_TEXT_ANALYTICS_ENDPOINT,
        new AzureKeyCredential(this.config.AZURE_TEXT_ANALYTICS_KEY)
      );

      logger.info('Azure service clients initialized');
    } catch (error) {
      throw new AzureServiceError(`Failed to initialize Azure clients: ${error.message}`);
    }
  }

  /**
   * Upload document to Azure Blob Storage
   */
  async uploadDocument(file, container, metadata = {}) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(container);
      
      // Ensure container exists
      await containerClient.createIfNotExists();

      const blobClient = containerClient.getBlockBlobClient(file.filename);
      
      const uploadOptions = {
        metadata: {
          uploadedAt: new Date().toISOString(),
          uploadedBy: metadata.userId || 'system',
          documentType: metadata.documentType || 'unknown',
          ...metadata
        }
      };

      const uploadResponse = await blobClient.uploadData(file.buffer, uploadOptions);
      
      logger.info(`Document uploaded to Azure: ${file.filename}`, {
        container,
        blobName: file.filename,
        size: file.size,
        requestId: uploadResponse.requestId
      });

      return {
        success: true,
        blobUrl: blobClient.url,
        blobName: file.filename,
        container,
        metadata: uploadOptions.metadata
      };
    } catch (error) {
      logger.error(`Failed to upload document to Azure: ${error.message}`);
      throw new AzureServiceError(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Download document from Azure Blob Storage
   */
  async downloadDocument(container, blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(container);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadBlockBlobResponse = await blobClient.download();
      const buffer = await downloadBlockBlobResponse.blobBody.text();

      logger.info(`Document downloaded from Azure: ${blobName}`);

      return {
        success: true,
        buffer,
        blobName,
        contentType: downloadBlockBlobResponse.contentType
      };
    } catch (error) {
      logger.error(`Failed to download document from Azure: ${error.message}`);
      throw new AzureServiceError(`Download failed: ${error.message}`);
    }
  }

  /**
   * Analyze document using Azure Form Recognizer
   */
  async analyzeDocument(fileBuffer, documentType = 'document') {
    try {
      const poller = await this.formRecognizerClient.beginAnalyzeDocument(
        documentType,
        fileBuffer
      );

      const result = await poller.pollUntilDone();

      logger.info('Document analyzed using Form Recognizer');

      return {
        success: true,
        pages: result.pages,
        tables: result.tables,
        keyValuePairs: result.keyValuePairs,
        paragraphs: result.paragraphs,
        entities: result.entities,
        confidence: this.calculateConfidence(result)
      };
    } catch (error) {
      logger.error(`Failed to analyze document: ${error.message}`);
      throw new AzureServiceError(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract text using Azure Cognitive Services
   */
  async extractText(fileBuffer, language = 'en') {
    try {
      const [result] = await this.textAnalyticsClient.extractKeyPhrases(
        [{ id: '1', language, text: fileBuffer.toString() }],
        language
      );

      logger.info('Text extracted using Text Analytics');

      return {
        success: true,
        keyPhrases: result.keyPhrases,
        language,
        statistics: result.statistics
      };
    } catch (error) {
      logger.error(`Failed to extract text: ${error.message}`);
      throw new AzureServiceError(`Text extraction failed: ${error.message}`);
    }
  }

  /**
   * Translate document using Azure Cognitive Services
   */
  async translateText(text, targetLanguage = 'en') {
    try {
      const axios = require('axios');
      
      const response = await axios.post(
        `${this.config.AZURE_TRANSLATOR_ENDPOINT}/translate`,
        [{ text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.AZURE_TRANSLATOR_KEY,
            'Ocp-Apim-Subscription-Region': this.config.AZURE_REGION,
            'Content-Type': 'application/json'
          },
          params: {
            'api-version': '3.0',
            from: 'auto',
            to: targetLanguage
          }
        }
      );

      logger.info(`Text translated to ${targetLanguage}`);

      return {
        success: true,
        originalText: text,
        translatedText: response.data[0].translations[0].text,
        targetLanguage
      };
    } catch (error) {
      logger.error(`Failed to translate text: ${error.message}`);
      throw new AzureServiceError(`Translation failed: ${error.message}`);
    }
  }

  /**
   * List documents in container
   */
  async listDocuments(container, prefix = '') {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(container);
      const blobs = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobs.push({
          name: blob.name,
          size: blob.properties.contentLength,
          created: blob.properties.createdOn,
          modified: blob.properties.lastModified,
          metadata: blob.metadata
        });
      }

      logger.info(`Listed ${blobs.length} documents in container: ${container}`);

      return {
        success: true,
        documents: blobs,
        count: blobs.length
      };
    } catch (error) {
      logger.error(`Failed to list documents: ${error.message}`);
      throw new AzureServiceError(`List failed: ${error.message}`);
    }
  }

  /**
   * Delete document from Azure
   */
  async deleteDocument(container, blobName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(container);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      
      await blobClient.delete();

      logger.info(`Document deleted from Azure: ${blobName}`);

      return {
        success: true,
        blobName,
        container
      };
    } catch (error) {
      logger.error(`Failed to delete document: ${error.message}`);
      throw new AzureServiceError(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(result) {
    const scores = [];
    
    if (result.pages) {
      result.pages.forEach(page => {
        if (page.lines) {
          page.lines.forEach(line => {
            if (line.confidence) scores.push(line.confidence);
          });
        }
      });
    }

    if (scores.length === 0) return 1.0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
}

module.exports = AzureService;