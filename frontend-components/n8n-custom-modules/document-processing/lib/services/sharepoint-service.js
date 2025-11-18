/**
 * SharePoint & OneDrive Service Integration
 * Handles document storage, versioning, and collaboration
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/tokenCredentialAuthenticationProvider');
const { ClientSecretCredential } = require('@azure/identity');
const logger = require('../logger');
const { SharePointError } = require('../error-handler');

class SharePointService {
  constructor(config) {
    this.config = config;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const credential = new ClientSecretCredential(
        this.config.MICROSOFT_TENANT_ID,
        this.config.MICROSOFT_CLIENT_ID,
        this.config.MICROSOFT_CLIENT_SECRET
      );

      this.client = Client.initWithMiddleware({
        authProvider: new TokenCredentialAuthenticationProvider({
          credential,
          scopes: ['https://graph.microsoft.com/.default']
        })
      });

      logger.info('SharePoint service initialized');
    } catch (error) {
      logger.error(`Failed to initialize SharePoint: ${error.message}`);
      throw new SharePointError(`SharePoint initialization failed: ${error.message}`);
    }
  }

  /**
   * Upload document to SharePoint
   */
  async uploadToSharePoint(file, siteName, libraryName, folderPath = '') {
    try {
      const filePath = folderPath ? `${folderPath}/${file.filename}` : file.filename;

      const response = await this.client
        .api(`/sites/${siteName}/drive/root:/${libraryName}/${filePath}:/content`)
        .put(file.buffer);

      logger.info(`Document uploaded to SharePoint: ${filePath}`, {
        siteName,
        libraryName,
        size: file.size
      });

      return {
        success: true,
        documentId: response.id,
        webUrl: response.webUrl,
        fileName: response.name,
        size: response.size,
        created: response.createdDateTime,
        lastModified: response.lastModifiedDateTime
      };
    } catch (error) {
      logger.error(`Failed to upload to SharePoint: ${error.message}`);
      throw new SharePointError(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload to OneDrive
   */
  async uploadToOneDrive(file, folderPath = '') {
    try {
      const filePath = folderPath ? `${folderPath}/${file.filename}` : file.filename;

      const response = await this.client
        .api(`/me/drive/root:/${filePath}:/content`)
        .put(file.buffer);

      logger.info(`Document uploaded to OneDrive: ${filePath}`);

      return {
        success: true,
        documentId: response.id,
        webUrl: response.webUrl,
        fileName: response.name,
        size: response.size,
        created: response.createdDateTime,
        lastModified: response.lastModifiedDateTime
      };
    } catch (error) {
      logger.error(`Failed to upload to OneDrive: ${error.message}`);
      throw new SharePointError(`OneDrive upload failed: ${error.message}`);
    }
  }

  /**
   * Download document from SharePoint
   */
  async downloadFromSharePoint(siteName, libraryName, documentId) {
    try {
      const response = await this.client
        .api(`/sites/${siteName}/drive/items/${documentId}/content`)
        .get();

      logger.info(`Document downloaded from SharePoint: ${documentId}`);

      return {
        success: true,
        content: response,
        documentId
      };
    } catch (error) {
      logger.error(`Failed to download from SharePoint: ${error.message}`);
      throw new SharePointError(`Download failed: ${error.message}`);
    }
  }

  /**
   * Download from OneDrive
   */
  async downloadFromOneDrive(documentId) {
    try {
      const response = await this.client
        .api(`/me/drive/items/${documentId}/content`)
        .get();

      logger.info(`Document downloaded from OneDrive: ${documentId}`);

      return {
        success: true,
        content: response,
        documentId
      };
    } catch (error) {
      logger.error(`Failed to download from OneDrive: ${error.message}`);
      throw new SharePointError(`OneDrive download failed: ${error.message}`);
    }
  }

  /**
   * Create SharePoint folder
   */
  async createSharePointFolder(siteName, libraryName, folderName) {
    try {
      const response = await this.client
        .api(`/sites/${siteName}/drive/root/children`)
        .post({
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        });

      logger.info(`SharePoint folder created: ${folderName}`);

      return {
        success: true,
        folderId: response.id,
        folderName: response.name
      };
    } catch (error) {
      logger.error(`Failed to create SharePoint folder: ${error.message}`);
      throw new SharePointError(`Folder creation failed: ${error.message}`);
    }
  }

  /**
   * List documents in SharePoint folder
   */
  async listSharePointDocuments(siteName, libraryName, folderPath = '') {
    try {
      const path = folderPath ? `/${folderPath}` : '';
      const response = await this.client
        .api(`/sites/${siteName}/drive/root:/${libraryName}${path}:/children`)
        .get();

      const documents = (response.value || []).map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        created: item.createdDateTime,
        lastModified: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        isFolder: !!item.folder
      }));

      logger.info(`Listed ${documents.length} documents in SharePoint`);

      return {
        success: true,
        documents,
        count: documents.length
      };
    } catch (error) {
      logger.error(`Failed to list SharePoint documents: ${error.message}`);
      throw new SharePointError(`List failed: ${error.message}`);
    }
  }

  /**
   * List OneDrive documents
   */
  async listOneDriveDocuments(folderPath = '') {
    try {
      const path = folderPath ? `:/${folderPath}` : '';
      const response = await this.client
        .api(`/me/drive/root${path}:/children`)
        .get();

      const documents = (response.value || []).map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        created: item.createdDateTime,
        lastModified: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        isFolder: !!item.folder
      }));

      logger.info(`Listed ${documents.length} documents in OneDrive`);

      return {
        success: true,
        documents,
        count: documents.length
      };
    } catch (error) {
      logger.error(`Failed to list OneDrive documents: ${error.message}`);
      throw new SharePointError(`OneDrive list failed: ${error.message}`);
    }
  }

  /**
   * Delete document from SharePoint
   */
  async deleteFromSharePoint(siteName, documentId) {
    try {
      await this.client
        .api(`/sites/${siteName}/drive/items/${documentId}`)
        .delete();

      logger.info(`Document deleted from SharePoint: ${documentId}`);

      return {
        success: true,
        documentId
      };
    } catch (error) {
      logger.error(`Failed to delete from SharePoint: ${error.message}`);
      throw new SharePointError(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(siteName, documentId) {
    try {
      const response = await this.client
        .api(`/sites/${siteName}/drive/items/${documentId}/versions`)
        .get();

      const versions = (response.value || []).map(version => ({
        id: version.id,
        versionNumber: version.name,
        created: version.createdDateTime,
        lastModified: version.lastModifiedDateTime,
        size: version.size
      }));

      logger.info(`Retrieved ${versions.length} versions for document: ${documentId}`);

      return {
        success: true,
        versions,
        count: versions.length
      };
    } catch (error) {
      logger.error(`Failed to get document versions: ${error.message}`);
      throw new SharePointError(`Version retrieval failed: ${error.message}`);
    }
  }

  /**
   * Share document
   */
  async shareDocument(siteName, documentId, grantId, roles = ['read']) {
    try {
      const response = await this.client
        .api(`/sites/${siteName}/drive/items/${documentId}/createLink`)
        .post({
          type: 'view',
          scope: 'organization',
          recipients: [{ email: grantId }],
          roles
        });

      logger.info(`Document shared: ${documentId} with ${grantId}`);

      return {
        success: true,
        shareLink: response.link.webUrl,
        documentId,
        sharedWith: grantId
      };
    } catch (error) {
      logger.error(`Failed to share document: ${error.message}`);
      throw new SharePointError(`Share failed: ${error.message}`);
    }
  }

  /**
   * Search documents in SharePoint
   */
  async searchSharePoint(query, siteName) {
    try {
      const response = await this.client
        .api(`/sites/${siteName}/drive/root/search(q='${query}')`)
        .get();

      const results = (response.value || []).map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        webUrl: item.webUrl,
        created: item.createdDateTime
      }));

      logger.info(`Search completed: ${results.length} results for "${query}"`);

      return {
        success: true,
        results,
        count: results.length
      };
    } catch (error) {
      logger.error(`Failed to search SharePoint: ${error.message}`);
      throw new SharePointError(`Search failed: ${error.message}`);
    }
  }
}

module.exports = SharePointService;