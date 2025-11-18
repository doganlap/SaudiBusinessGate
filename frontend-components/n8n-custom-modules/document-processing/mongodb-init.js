// MongoDB initialization script - Production Setup
// This script runs when MongoDB container starts
// NO MOCK DATA - Clean production schema

const adminDb = db.getSiblingDB('admin');
const appDb = db.getSiblingDB('document_processing');

print("\n=== MongoDB Production Initialization ===\n");

// Switch to document_processing database
db = appDb;

// Create collections with schema validation
try {
  db.createCollection("processed_documents", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["documentId", "documentType", "timestamp"],
        properties: {
          documentId: { bsonType: "string", description: "Unique document identifier" },
          documentType: { 
            enum: ["invoice", "contract", "report", "letter", "form"],
            description: "Type of document"
          },
          content: { bsonType: "string" },
          status: { 
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
          },
          processingResults: { bsonType: "object" },
          processingMetadata: { bsonType: "object" },
          timestamp: { bsonType: "date" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" }
        }
      }
    }
  });
  print("✓ processed_documents collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating processed_documents: " + e.message);
  }
}

try {
  db.createCollection("analytics", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["date"],
        properties: {
          date: { bsonType: "date" },
          metrics: { bsonType: "object" },
          performance: { bsonType: "object" }
        }
      }
    }
  });
  print("✓ analytics collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating analytics: " + e.message);
  }
}

try {
  db.createCollection("transformations", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["transformationId", "sourceFormat", "targetFormat"],
        properties: {
          transformationId: { bsonType: "string" },
          sourceFormat: { bsonType: "string" },
          targetFormat: { bsonType: "string" },
          status: { enum: ["pending", "completed", "failed"] },
          timestamp: { bsonType: "date" }
        }
      }
    }
  });
  print("✓ transformations collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating transformations: " + e.message);
  }
}

try {
  db.createCollection("audit_log", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["event", "timestamp"],
        properties: {
          event: { bsonType: "string" },
          userId: { bsonType: "string" },
          action: { bsonType: "string" },
          resource: { bsonType: "string" },
          timestamp: { bsonType: "date" },
          details: { bsonType: "object" },
          ipAddress: { bsonType: "string" },
          status: { enum: ["success", "failure", "warning"] }
        }
      }
    }
  });
  print("✓ audit_log collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating audit_log: " + e.message);
  }
}

try {
  db.createCollection("sessions", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["sessionId", "userId", "expiresAt"],
        properties: {
          sessionId: { bsonType: "string" },
          userId: { bsonType: "string" },
          token: { bsonType: "string" },
          expiresAt: { bsonType: "date" },
          createdAt: { bsonType: "date" },
          ipAddress: { bsonType: "string" }
        }
      }
    }
  });
  print("✓ sessions collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating sessions: " + e.message);
  }
}

try {
  db.createCollection("workflow_logs", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["workflowId", "timestamp"],
        properties: {
          workflowId: { bsonType: "string" },
          workflowName: { bsonType: "string" },
          executionId: { bsonType: "string" },
          status: { enum: ["success", "failure", "timeout", "error"] },
          duration: { bsonType: "int" },
          timestamp: { bsonType: "date" },
          error: { bsonType: "string" }
        }
      }
    }
  });
  print("✓ workflow_logs collection created with schema validation");
} catch (e) {
  if (e.codeName !== "NamespaceExists") {
    print("✗ Error creating workflow_logs: " + e.message);
  }
}

// Create indexes for performance
try {
  db.processed_documents.createIndex({ "timestamp": -1 }, { background: true });
  db.processed_documents.createIndex({ "documentType": 1 }, { background: true });
  db.processed_documents.createIndex({ "documentId": 1 }, { unique: true });
  db.processed_documents.createIndex({ "status": 1 }, { background: true });
  db.processed_documents.createIndex({ "documentType": 1, "timestamp": -1 }, { background: true });
  db.processed_documents.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
  print("✓ Indexes created for processed_documents");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

try {
  db.analytics.createIndex({ "date": -1 }, { background: true });
  db.analytics.createIndex({ "date": 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
  print("✓ Indexes created for analytics");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

try {
  db.transformations.createIndex({ "transformationId": 1 }, { unique: true });
  db.transformations.createIndex({ "timestamp": -1 }, { background: true });
  db.transformations.createIndex({ "sourceFormat": 1, "targetFormat": 1 }, { background: true });
  print("✓ Indexes created for transformations");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

try {
  db.audit_log.createIndex({ "timestamp": -1 }, { background: true });
  db.audit_log.createIndex({ "event": 1 }, { background: true });
  db.audit_log.createIndex({ "userId": 1 }, { background: true });
  db.audit_log.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
  print("✓ Indexes created for audit_log");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

try {
  db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired
  db.sessions.createIndex({ "sessionId": 1 }, { unique: true });
  print("✓ Indexes created for sessions");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

try {
  db.workflow_logs.createIndex({ "timestamp": -1 }, { background: true });
  db.workflow_logs.createIndex({ "workflowId": 1 }, { background: true });
  db.workflow_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
  print("✓ Indexes created for workflow_logs");
} catch (e) {
  print("⚠ Index creation notice: " + e.message);
}

// Create application user with minimal permissions
try {
  const user = os.getenv('DB_MONGODB_USERNAME') || 'app_user';
  const pwd = os.getenv('DB_MONGODB_PASSWORD') || 'changeme_in_production';
  
  db.createUser({
    user: user,
    pwd: pwd,
    roles: [
      {
        role: "readWrite",
        db: "document_processing"
      }
    ]
  });
  print("✓ Application user created: " + user);
} catch (e) {
  if (e.codeName === "DuplicateKey") {
    print("⚠ Application user already exists");
  } else {
    print("✗ Error creating user: " + e.message);
  }
}

// Create backup user with read-only permissions
try {
  const backupUser = os.getenv('DB_BACKUP_USER') || 'backup_user';
  const backupPwd = os.getenv('DB_BACKUP_PASSWORD') || 'backup_password_change_me';
  
  db.createUser({
    user: backupUser,
    pwd: backupPwd,
    roles: [
      {
        role: "read",
        db: "document_processing"
      }
    ]
  });
  print("✓ Backup user created: " + backupUser);
} catch (e) {
  if (e.codeName === "DuplicateKey") {
    print("⚠ Backup user already exists");
  } else {
    print("✗ Error creating backup user: " + e.message);
  }
}

print("\n=== Database Initialization Complete ===");
print("Environment: " + (os.getenv('NODE_ENV') || 'development'));
print("Database: document_processing");
print("Timestamp: " + new Date().toISOString());
print("Status: READY FOR PRODUCTION\n");