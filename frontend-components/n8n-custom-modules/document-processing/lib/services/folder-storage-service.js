/**
 * Folder Storage Service
 * Handles local file system and network folder operations
 */

const fs = require('fs').promises;
const path = require('path');
const fsCb = require('fs');
const logger = require('../logger');
const { StorageServiceError } = require('../error-handler');

class FolderStorageService {
  constructor(config) {
    this.config = config;
    this.basePath = config.FOLDER_STORAGE_BASE_PATH || './documents';
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      logger.info(`Folder storage initialized at: ${this.basePath}`);
    } catch (error) {
      logger.error(`Failed to initialize storage: ${error.message}`);
      throw new StorageServiceError(`Storage initialization failed: ${error.message}`);
    }
  }

  /**
   * Save document to folder
   */
  async saveDocument(file, subfolder = '', metadata = {}) {
    try {
      const folderPath = path.join(this.basePath, subfolder);
      await fs.mkdir(folderPath, { recursive: true });

      const filePath = path.join(folderPath, file.filename);
      await fs.writeFile(filePath, file.buffer);

      // Save metadata
      const metadataPath = path.join(folderPath, `${file.filename}.meta.json`);
      const metadataContent = {
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        uploadedBy: metadata.userId || 'system',
        documentType: metadata.documentType,
        ...metadata
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));

      logger.info(`Document saved to folder: ${filePath}`);

      return {
        success: true,
        path: filePath,
        relativePath: path.relative(this.basePath, filePath),
        folder: subfolder,
        size: file.size,
        metadata: metadataContent
      };
    } catch (error) {
      logger.error(`Failed to save document: ${error.message}`);
      throw new StorageServiceError(`Save failed: ${error.message}`);
    }
  }

  /**
   * Read document from folder
   */
  async readDocument(relativePath) {
    try {
      const filePath = path.join(this.basePath, relativePath);
      
      // Security check - prevent directory traversal
      if (!filePath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      const buffer = await fs.readFile(filePath);

      logger.info(`Document read from folder: ${relativePath}`);

      return {
        success: true,
        buffer,
        path: filePath,
        size: buffer.length
      };
    } catch (error) {
      logger.error(`Failed to read document: ${error.message}`);
      throw new StorageServiceError(`Read failed: ${error.message}`);
    }
  }

  /**
   * List documents in folder
   */
  async listDocuments(subfolder = '', includeMetadata = true) {
    try {
      const folderPath = path.join(this.basePath, subfolder);
      
      // Security check
      if (!folderPath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      await fs.mkdir(folderPath, { recursive: true });
      const files = await fs.readdir(folderPath);

      const documents = [];
      for (const file of files) {
        if (file.endsWith('.meta.json')) continue;

        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);

        let metadata = null;
        if (includeMetadata) {
          try {
            const metadataPath = path.join(folderPath, `${file}.meta.json`);
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            metadata = JSON.parse(metadataContent);
          } catch (e) {
            // No metadata file
          }
        }

        documents.push({
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: path.relative(this.basePath, filePath),
          metadata
        });
      }

      logger.info(`Listed ${documents.length} documents in: ${subfolder}`);

      return {
        success: true,
        documents,
        count: documents.length,
        folder: subfolder
      };
    } catch (error) {
      logger.error(`Failed to list documents: ${error.message}`);
      throw new StorageServiceError(`List failed: ${error.message}`);
    }
  }

  /**
   * Delete document from folder
   */
  async deleteDocument(relativePath) {
    try {
      const filePath = path.join(this.basePath, relativePath);
      
      // Security check
      if (!filePath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      await fs.unlink(filePath);

      // Delete metadata if exists
      try {
        const metadataPath = `${filePath}.meta.json`;
        await fs.unlink(metadataPath);
      } catch (e) {
        // Metadata file doesn't exist, ignore
      }

      logger.info(`Document deleted: ${relativePath}`);

      return {
        success: true,
        path: relativePath
      };
    } catch (error) {
      logger.error(`Failed to delete document: ${error.message}`);
      throw new StorageServiceError(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Create folder
   */
  async createFolder(folderName) {
    try {
      const folderPath = path.join(this.basePath, folderName);
      
      // Security check
      if (!folderPath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      await fs.mkdir(folderPath, { recursive: true });

      logger.info(`Folder created: ${folderName}`);

      return {
        success: true,
        folderName,
        path: path.relative(this.basePath, folderPath)
      };
    } catch (error) {
      logger.error(`Failed to create folder: ${error.message}`);
      throw new StorageServiceError(`Folder creation failed: ${error.message}`);
    }
  }

  /**
   * Search documents by pattern
   */
  async searchDocuments(pattern, subfolder = '') {
    try {
      const folderPath = path.join(this.basePath, subfolder);
      
      if (!folderPath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      await fs.mkdir(folderPath, { recursive: true });
      const files = await fs.readdir(folderPath);

      const regex = new RegExp(pattern, 'i');
      const matches = files.filter(f => regex.test(f) && !f.endsWith('.meta.json'));

      logger.info(`Search found ${matches.length} documents matching: ${pattern}`);

      return {
        success: true,
        results: matches,
        count: matches.length,
        pattern,
        folder: subfolder
      };
    } catch (error) {
      logger.error(`Failed to search documents: ${error.message}`);
      throw new StorageServiceError(`Search failed: ${error.message}`);
    }
  }

  /**
   * Archive old documents
   */
  async archiveDocuments(subfolder = '', olderThanDays = 90) {
    try {
      const folderPath = path.join(this.basePath, subfolder);
      const archiveFolder = path.join(this.basePath, subfolder, 'archive');
      
      if (!folderPath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      await fs.mkdir(archiveFolder, { recursive: true });

      const files = await fs.readdir(folderPath);
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      let archivedCount = 0;

      for (const file of files) {
        if (file === 'archive' || file.endsWith('.meta.json')) continue;

        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          const archivePath = path.join(archiveFolder, file);
          await fs.rename(filePath, archivePath);
          archivedCount++;

          // Move metadata too
          try {
            const metadataPath = path.join(folderPath, `${file}.meta.json`);
            const archiveMetadataPath = path.join(archiveFolder, `${file}.meta.json`);
            await fs.rename(metadataPath, archiveMetadataPath);
          } catch (e) {
            // No metadata
          }
        }
      }

      logger.info(`Archived ${archivedCount} documents older than ${olderThanDays} days`);

      return {
        success: true,
        archivedCount,
        archiveFolder: path.relative(this.basePath, archiveFolder)
      };
    } catch (error) {
      logger.error(`Failed to archive documents: ${error.message}`);
      throw new StorageServiceError(`Archive failed: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(relativePath) {
    try {
      const filePath = path.join(this.basePath, relativePath);
      const metadataPath = `${filePath}.meta.json`;

      if (!filePath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      logger.info(`Document metadata retrieved: ${relativePath}`);

      return {
        success: true,
        metadata,
        path: relativePath
      };
    } catch (error) {
      logger.error(`Failed to get document metadata: ${error.message}`);
      throw new StorageServiceError(`Metadata retrieval failed: ${error.message}`);
    }
  }

  /**
   * Calculate folder size
   */
  async calculateFolderSize(subfolder = '') {
    try {
      const folderPath = path.join(this.basePath, subfolder);
      
      if (!folderPath.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      let totalSize = 0;
      let fileCount = 0;

      const calculateSize = async (dir) => {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            await calculateSize(filePath);
          } else if (!file.endsWith('.meta.json')) {
            totalSize += stats.size;
            fileCount++;
          }
        }
      };

      await calculateSize(folderPath);

      logger.info(`Folder size calculated: ${subfolder} (${fileCount} files, ${totalSize} bytes)`);

      return {
        success: true,
        folder: subfolder,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        fileCount
      };
    } catch (error) {
      logger.error(`Failed to calculate folder size: ${error.message}`);
      throw new StorageServiceError(`Size calculation failed: ${error.message}`);
    }
  }

  /**
   * Copy document
   */
  async copyDocument(sourcePath, destPath) {
    try {
      const sourceFile = path.join(this.basePath, sourcePath);
      const destFile = path.join(this.basePath, destPath);

      if (!sourceFile.startsWith(this.basePath) || !destFile.startsWith(this.basePath)) {
        throw new Error('Invalid path - directory traversal detected');
      }

      // Create destination directory
      await fs.mkdir(path.dirname(destFile), { recursive: true });
      
      // Copy file
      await fs.copyFile(sourceFile, destFile);

      // Copy metadata if exists
      try {
        const sourceMetadata = `${sourceFile}.meta.json`;
        const destMetadata = `${destFile}.meta.json`;
        await fs.copyFile(sourceMetadata, destMetadata);
      } catch (e) {
        // No metadata
      }

      logger.info(`Document copied: ${sourcePath} -> ${destPath}`);

      return {
        success: true,
        source: sourcePath,
        destination: destPath
      };
    } catch (error) {
      logger.error(`Failed to copy document: ${error.message}`);
      throw new StorageServiceError(`Copy failed: ${error.message}`);
    }
  }
}

module.exports = FolderStorageService;