/**
 * Backup & Recovery Module
 * Handles database backups, encryption, and recovery procedures
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const zlib = require('zlib');

/**
 * Backup Manager
 */
class BackupManager {
  constructor(config = {}) {
    this.backupDir = process.env.BACKUP_DESTINATION || '/backups';
    this.compression = process.env.BACKUP_COMPRESSION === 'true';
    this.encryption = process.env.BACKUP_ENCRYPTION === 'true';
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-insecure-key';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || 30);
  }

  /**
   * Create a backup
   */
  async createBackup(db, backupName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = backupName || `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, name);

    try {
      // Ensure backup directory exists
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      console.log(`Starting backup: ${name}`);

      // Create backup directory
      fs.mkdirSync(backupPath, { recursive: true });

      // Get all collections
      const collections = await db.listCollections().toArray();

      const backupInfo = {
        timestamp: new Date().toISOString(),
        collections: [],
        totalDocuments: 0,
        totalSize: 0,
        compressed: this.compression,
        encrypted: this.encryption
      };

      // Backup each collection
      for (const collectionMeta of collections) {
        const collectionName = collectionMeta.name;
        const collection = db.collection(collectionName);

        // Get collection stats
        const count = await collection.countDocuments();
        const collectionPath = path.join(backupPath, `${collectionName}.json`);

        // Export collection
        const documents = await collection.find({}).toArray();

        let data = JSON.stringify(documents, null, 2);

        // Compress if enabled
        if (this.compression) {
          data = zlib.gzipSync(data);
          collectionPath = collectionPath + '.gz';
        }

        // Encrypt if enabled
        if (this.encryption) {
          data = this.encrypt(data);
          collectionPath = collectionPath + '.enc';
        }

        // Write to file
        fs.writeFileSync(collectionPath, data);

        backupInfo.collections.push({
          name: collectionName,
          documents: count,
          size: fs.statSync(collectionPath).size
        });

        backupInfo.totalDocuments += count;
        backupInfo.totalSize += fs.statSync(collectionPath).size;

        console.log(`  ✓ Backed up ${collectionName} (${count} documents)`);
      }

      // Write backup metadata
      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(backupInfo, null, 2)
      );

      console.log(`Backup completed: ${name}`);
      return backupInfo;
    } catch (error) {
      console.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restore(db, backupName) {
    const backupPath = path.join(this.backupDir, backupName);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    try {
      console.log(`Starting restore from: ${backupName}`);

      // Read backup info
      const infoPath = path.join(backupPath, 'backup-info.json');
      const backupInfo = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));

      let restoredCount = 0;

      // Restore each collection
      for (const collectionInfo of backupInfo.collections) {
        let filePath = path.join(backupPath, `${collectionInfo.name}.json`);

        // Detect compression/encryption extensions
        if (fs.existsSync(filePath + '.gz')) {
          filePath = filePath + '.gz';
        }
        if (fs.existsSync(filePath + '.enc')) {
          filePath = filePath + '.enc';
        }

        let data = fs.readFileSync(filePath);

        // Decrypt if needed
        if (backupInfo.encrypted) {
          data = this.decrypt(data);
        }

        // Decompress if needed
        if (backupInfo.compressed) {
          data = zlib.gunzipSync(data);
        }

        const documents = JSON.parse(data.toString());

        // Clear existing collection
        const collection = db.collection(collectionInfo.name);
        await collection.deleteMany({});

        // Restore documents
        if (documents.length > 0) {
          await collection.insertMany(documents);
        }

        restoredCount += documents.length;
        console.log(`  ✓ Restored ${collectionInfo.name} (${documents.length} documents)`);
      }

      console.log(`Restore completed: ${restoredCount} documents`);
      return restoredCount;
    } catch (error) {
      console.error(`Restore failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * List available backups
   */
  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    return fs.readdirSync(this.backupDir)
      .filter(f => fs.statSync(path.join(this.backupDir, f)).isDirectory())
      .map(name => {
        const infoPath = path.join(this.backupDir, name, 'backup-info.json');
        if (fs.existsSync(infoPath)) {
          const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          return {
            name,
            timestamp: info.timestamp,
            collections: info.collections.length,
            documents: info.totalDocuments,
            size: info.totalSize
          };
        }
        return { name, error: 'Invalid backup' };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Delete old backups
   */
  deleteOldBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    let deletedCount = 0;

    fs.readdirSync(this.backupDir).forEach(name => {
      const backupPath = path.join(this.backupDir, name);
      const stats = fs.statSync(backupPath);

      if (stats.mtime < cutoffDate) {
        this.removeDirectoryRecursive(backupPath);
        deletedCount++;
        console.log(`Deleted old backup: ${name}`);
      }
    });

    return deletedCount;
  }

  /**
   * Verify backup integrity
   */
  verifyBackup(backupName) {
    const backupPath = path.join(this.backupDir, backupName);

    if (!fs.existsSync(backupPath)) {
      return { valid: false, error: 'Backup not found' };
    }

    try {
      const infoPath = path.join(backupPath, 'backup-info.json');
      if (!fs.existsSync(infoPath)) {
        return { valid: false, error: 'Backup metadata missing' };
      }

      const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));

      // Check all collection files exist
      for (const collection of info.collections) {
        let filePath = path.join(backupPath, `${collection.name}.json`);
        if (info.compressed) filePath += '.gz';
        if (info.encrypted) filePath += '.enc';

        if (!fs.existsSync(filePath)) {
          return { 
            valid: false, 
            error: `Collection file missing: ${collection.name}` 
          };
        }
      }

      return {
        valid: true,
        info
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Encrypt data
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)),
      iv
    );

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    const iv = encryptedData.slice(0, 16);
    const encrypted = encryptedData.slice(16);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)),
      iv
    );

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  /**
   * Remove directory recursively
   */
  removeDirectoryRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          this.removeDirectoryRecursive(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Schedule automatic backups
   */
  scheduleBackups(db) {
    const schedule = process.env.BACKUP_SCHEDULE || '0 3 * * *';
    
    // Parse cron and create schedule
    console.log(`Backup schedule: ${schedule}`);
    
    // Simple daily backup at 3 AM
    const hour = 3;
    const minute = 0;

    const checkBackup = () => {
      const now = new Date();
      if (now.getHours() === hour && now.getMinutes() === minute) {
        this.createBackup(db).catch(error => {
          console.error('Scheduled backup failed:', error);
        });
      }
    };

    setInterval(checkBackup, 60000); // Check every minute
    console.log(`Backup scheduler started`);
  }
}

/**
 * Database dump utility for MongoDB
 */
async function mongoDump(outputPath) {
  try {
    const host = process.env.DB_MONGODB_HOST || 'mongodb';
    const port = process.env.DB_MONGODB_PORT || 27017;
    const database = process.env.DB_MONGODB_DATABASE || 'document_processing';
    const username = process.env.DB_MONGODB_USERNAME;
    const password = process.env.DB_MONGODB_PASSWORD;

    let cmd = `mongodump --host ${host}:${port} --db ${database} --out ${outputPath}`;

    if (username && password) {
      cmd += ` --username ${username} --password ${password}`;
    }

    console.log('Executing mongodump...');
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Database dumped to: ${outputPath}`);
  } catch (error) {
    console.error('mongodump failed:', error.message);
    throw error;
  }
}

/**
 * Database restore utility
 */
async function mongoRestore(dumpPath) {
  try {
    const host = process.env.DB_MONGODB_HOST || 'mongodb';
    const port = process.env.DB_MONGODB_PORT || 27017;
    const username = process.env.DB_MONGODB_USERNAME;
    const password = process.env.DB_MONGODB_PASSWORD;

    let cmd = `mongorestore --host ${host}:${port} ${dumpPath}`;

    if (username && password) {
      cmd += ` --username ${username} --password ${password}`;
    }

    console.log('Executing mongorestore...');
    execSync(cmd, { stdio: 'inherit' });
    console.log('Database restored successfully');
  } catch (error) {
    console.error('mongorestore failed:', error.message);
    throw error;
  }
}

module.exports = {
  BackupManager,
  mongoDump,
  mongoRestore
};