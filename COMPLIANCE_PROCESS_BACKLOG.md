# Compliance & Process Engineering Backlog
**Concrete Deliverables for Post-P0 Implementation**

Generated: 2025-11-19
Status: Ready for Engineering

---

## 🎯 Overview

This document defines **actionable engineering tasks** for compliance, governance, and operational processes. Each item includes:
- **Clear acceptance criteria**
- **Database schema requirements**
- **API specifications**
- **Test requirements**
- **Documentation needs**

---

## 📋 EPIC 1: Audit Trail & Compliance Logging

### Story 1.1: Comprehensive Audit Log System
**Priority:** P0 - Compliance Blocker
**Estimate:** 5 story points (2-3 days)
**Owner:** Backend Team

**User Story:**
```
As a compliance officer
I need complete audit trails of all data changes
So that I can prove regulatory compliance and investigate incidents
```

**Acceptance Criteria:**
- [ ] All CUD operations logged with before/after snapshots
- [ ] User context captured (IP, user agent, geo-location)
- [ ] Immutable log storage (append-only, no deletes)
- [ ] Tamper detection using cryptographic hashing
- [ ] Query API for audit log searches
- [ ] Export capability (CSV, JSON) for external auditors
- [ ] 7-year retention policy automated

**Database Schema:**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, ACCESS
  entity_type VARCHAR(100) NOT NULL, -- 'invoice', 'transaction', etc
  entity_id VARCHAR(255) NOT NULL,

  -- Change tracking
  old_value JSONB,
  new_value JSONB,
  delta JSONB, -- Computed diff

  -- Context
  ip_address INET,
  user_agent TEXT,
  geo_location JSONB,
  session_id VARCHAR(255),
  request_id UUID,

  -- Tamper protection
  hash VARCHAR(64), -- SHA-256 of previous hash + current record
  previous_hash VARCHAR(64),

  -- Metadata
  timestamp TIMESTAMP DEFAULT NOW(),
  retention_until TIMESTAMP DEFAULT NOW() + INTERVAL '7 years',

  -- Compliance flags
  pii_accessed BOOLEAN DEFAULT false,
  financial_data BOOLEAN DEFAULT false,
  sensitive BOOLEAN DEFAULT false
);

CREATE INDEX idx_audit_tenant ON audit_log(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

**API Specification:**
```typescript
// GET /api/audit/logs
interface AuditLogQuery {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  hasMore: boolean;
}

// GET /api/audit/logs/verify
// Verify tamper protection by checking hash chain
interface VerificationResponse {
  valid: boolean;
  lastVerifiedId: string;
  tamperedRecords?: string[];
}

// POST /api/audit/export
// Export audit logs for compliance
interface ExportRequest {
  format: 'csv' | 'json' | 'pdf';
  filters: AuditLogQuery;
  purpose: string; // Reason for export
  requestedBy: string;
}
```

**Implementation Files:**
- `lib/audit/audit-logger.ts` - Core logging service
- `lib/audit/tamper-detection.ts` - Hash chain verification
- `lib/audit/retention-policy.ts` - Auto-cleanup after retention period
- `app/api/audit/logs/route.ts` - Query API
- `app/api/audit/export/route.ts` - Export API

**Tests Required:**
- [ ] Unit: Hash chain verification
- [ ] Unit: Delta computation
- [ ] Integration: Log all CRUD operations
- [ ] Integration: Query performance with 1M+ records
- [ ] E2E: Export and verify exported data

---

### Story 1.2: Data Access Logging (PII/Financial)
**Priority:** P0 - Compliance Blocker
**Estimate:** 3 story points (1-2 days)

**User Story:**
```
As a DPO (Data Protection Officer)
I need to track every access to PII and financial data
So that I can respond to GDPR Article 15 requests and detect unauthorized access
```

**Acceptance Criteria:**
- [ ] Auto-detect PII fields (email, phone, SSN, etc)
- [ ] Log all SELECT operations on sensitive tables
- [ ] Track who accessed what data when
- [ ] Alert on suspicious access patterns
- [ ] Generate GDPR Article 15 reports automatically

**Database Schema:**
```sql
CREATE TABLE data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW(),

  -- What was accessed
  table_name VARCHAR(100) NOT NULL,
  record_ids TEXT[] NOT NULL,
  columns_accessed TEXT[],

  -- Classification
  data_classification VARCHAR(50), -- 'pii', 'financial', 'confidential'
  pii_types TEXT[], -- ['email', 'phone', 'ssn']

  -- Context
  access_reason VARCHAR(500),
  ip_address INET,
  session_id VARCHAR(255),

  -- Compliance
  legal_basis VARCHAR(100), -- GDPR: 'consent', 'contract', 'legal_obligation'
  retention_until TIMESTAMP
);

CREATE INDEX idx_access_user ON data_access_log(user_id, accessed_at DESC);
CREATE INDEX idx_access_tenant ON data_access_log(tenant_id, accessed_at DESC);
CREATE INDEX idx_access_classification ON data_access_log(data_classification);
```

**API Specification:**
```typescript
// GET /api/compliance/data-access/:userId
// Get all data accessed by a user (GDPR Article 15)
interface DataAccessReport {
  userId: string;
  period: { start: Date; end: Date };
  accessLog: Array<{
    timestamp: Date;
    dataType: string;
    recordIds: string[];
    purpose: string;
  }>;
  totalAccesses: number;
}

// GET /api/compliance/suspicious-access
// Detect anomalous access patterns
interface SuspiciousAccessAlert {
  userId: string;
  anomaly: 'bulk_download' | 'after_hours' | 'unusual_volume' | 'geo_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  timestamp: Date;
}
```

---

## 📋 EPIC 2: ZATCA E-Invoicing Compliance (Saudi Arabia)

### Story 2.1: Phase 1 - E-Invoice Generation
**Priority:** P1 - Revenue Blocker
**Estimate:** 13 story points (1 week)

**User Story:**
```
As a Saudi business owner
I need to generate ZATCA-compliant e-invoices
So that I can legally issue invoices and avoid penalties
```

**Acceptance Criteria:**
- [ ] Generate XML invoices per ZATCA spec
- [ ] Include mandatory fields (VAT #, QR code, Arabic/English)
- [ ] Generate QR code with TLV encoding
- [ ] Store XML alongside PDF invoice
- [ ] Validate against ZATCA XSD schema
- [ ] Support simplified invoices (B2C) and standard (B2B)

**Database Schema:**
```sql
CREATE TABLE zatca_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),

  -- ZATCA specific
  invoice_type VARCHAR(20), -- 'standard' or 'simplified'
  zatca_uuid UUID UNIQUE NOT NULL, -- Globally unique per ZATCA
  invoice_counter_value INTEGER NOT NULL,

  -- XML document
  xml_content TEXT NOT NULL,
  xml_hash VARCHAR(64), -- SHA-256 of XML
  xml_signed_at TIMESTAMP,

  -- QR Code
  qr_code_data TEXT NOT NULL, -- TLV encoded
  qr_code_image BYTEA,

  -- Validation
  validated_at TIMESTAMP,
  validation_errors JSONB,
  xsd_valid BOOLEAN DEFAULT false,

  -- Submission (Phase 2)
  submitted_to_zatca BOOLEAN DEFAULT false,
  submission_uuid UUID,
  submission_response JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_zatca_tenant ON zatca_invoices(tenant_id);
CREATE INDEX idx_zatca_invoice ON zatca_invoices(invoice_id);
CREATE INDEX idx_zatca_uuid ON zatca_invoices(zatca_uuid);
```

**API Specification:**
```typescript
// POST /api/finance/invoices/:id/zatca
// Generate ZATCA-compliant e-invoice
interface ZATCAGenerateRequest {
  invoiceId: string;
  type: 'standard' | 'simplified';
  includeQRCode: true;
}

interface ZATCAGenerateResponse {
  success: boolean;
  zatcaUuid: string;
  xmlContent: string; // Base64 encoded
  qrCodeData: string;
  qrCodeImage: string; // Base64 PNG
  validation: {
    xsdValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// GET /api/finance/invoices/:id/zatca/xml
// Download XML
// GET /api/finance/invoices/:id/zatca/qr
// Download QR code image
```

**Implementation Files:**
- `lib/finance/zatca/xml-generator.ts` - Generate XML per spec
- `lib/finance/zatca/qr-encoder.ts` - TLV QR code encoding
- `lib/finance/zatca/validator.ts` - XSD validation
- `lib/finance/zatca/counter-manager.ts` - Invoice counter per device
- `app/api/finance/zatca/route.ts` - API endpoints

**Tests Required:**
- [ ] Unit: XML generation matches ZATCA samples
- [ ] Unit: QR TLV encoding/decoding
- [ ] Unit: XSD validation
- [ ] Integration: End-to-end invoice → ZATCA XML
- [ ] E2E: Generate and verify with ZATCA validator tool

**Documentation:**
- ZATCA E-Invoicing Implementation Guide
- QR Code Specification
- Common validation errors and fixes

---

### Story 2.2: Phase 2 - ZATCA API Integration
**Priority:** P1 - Compliance Blocker
**Estimate:** 21 story points (2 weeks)

**User Story:**
```
As a Saudi business
I need to submit invoices to ZATCA in real-time
So that I comply with Phase 2 regulations
```

**Acceptance Criteria:**
- [ ] Register devices with ZATCA (CSR generation)
- [ ] Submit invoices to ZATCA API within 24 hours
- [ ] Handle clearance invoices (standard/B2B)
- [ ] Handle reporting invoices (simplified/B2C)
- [ ] Store clearance certificates
- [ ] Retry logic for API failures
- [ ] Monitor submission success rate
- [ ] Alert on submission failures

**Database Schema:**
```sql
CREATE TABLE zatca_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  device_name VARCHAR(255) NOT NULL,

  -- CSR & Certificates
  csr_content TEXT,
  certificate TEXT,
  private_key TEXT, -- Encrypted
  certificate_expires_at TIMESTAMP,

  -- ZATCA IDs
  otp VARCHAR(6),
  compliance_request_id VARCHAR(255),

  -- Status
  status VARCHAR(50), -- 'registered', 'active', 'expired', 'revoked'
  registered_at TIMESTAMP,
  last_used_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE zatca_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  zatca_invoice_id UUID NOT NULL REFERENCES zatca_invoices(id),
  device_id UUID NOT NULL REFERENCES zatca_devices(id),

  -- Submission details
  submission_type VARCHAR(20), -- 'clearance' or 'reporting'
  submitted_at TIMESTAMP NOT NULL,
  response_received_at TIMESTAMP,

  -- ZATCA response
  clearance_status VARCHAR(50), -- 'CLEARED', 'REJECTED', 'REPORTED'
  zatca_invoice_hash VARCHAR(64),
  clearance_certificate TEXT,

  -- Error handling
  attempts INTEGER DEFAULT 1,
  last_error TEXT,

  -- Compliance
  submitted_within_24h BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_tenant ON zatca_submissions(tenant_id);
CREATE INDEX idx_submissions_invoice ON zatca_submissions(invoice_id);
CREATE INDEX idx_submissions_status ON zatca_submissions(clearance_status);
```

**API Specification:**
```typescript
// POST /api/zatca/devices/register
// Register new device with ZATCA
interface DeviceRegistrationRequest {
  deviceName: string;
  otp: string; // From ZATCA portal
}

// POST /api/zatca/invoices/:id/submit
// Submit invoice to ZATCA
interface ZATCASubmissionRequest {
  invoiceId: string;
  deviceId: string;
}

interface ZATCASubmissionResponse {
  success: boolean;
  submissionId: string;
  status: 'CLEARED' | 'REJECTED' | 'REPORTED';
  clearanceCertificate?: string;
  errors?: string[];
  submittedAt: Date;
}

// GET /api/zatca/submissions/status
// Monitor submission health
interface SubmissionHealthResponse {
  last24h: {
    total: number;
    cleared: number;
    rejected: number;
    pending: number;
  };
  avgResponseTime: number; // ms
  failureRate: number; // percentage
}
```

**Implementation Files:**
- `lib/finance/zatca/api-client.ts` - ZATCA API client
- `lib/finance/zatca/device-manager.ts` - CSR generation, registration
- `lib/finance/zatca/submission-queue.ts` - Queue for reliable submission
- `lib/finance/zatca/retry-logic.ts` - Exponential backoff
- `app/api/zatca/*/route.ts` - API endpoints

**External Dependencies:**
- ZATCA SDK (if available) or custom HTTP client
- OpenSSL for CSR generation
- X.509 certificate handling

**Tests Required:**
- [ ] Unit: CSR generation
- [ ] Unit: API request signing
- [ ] Integration: Mock ZATCA API responses
- [ ] Integration: Retry logic
- [ ] E2E: Register device (sandbox)
- [ ] E2E: Submit test invoice (sandbox)
- [ ] Load: 1000 invoices/hour submission

---

## 📋 EPIC 3: GDPR Compliance

### Story 3.1: Right to Access (Article 15)
**Priority:** P1 - Legal Requirement
**Estimate:** 8 story points (4-5 days)

**User Story:**
```
As a data subject
I want to request all my personal data
So that I can exercise my GDPR right to access
```

**Acceptance Criteria:**
- [ ] Self-service data export in user portal
- [ ] Include all personal data across all tables
- [ ] Machine-readable format (JSON) + human-readable (PDF)
- [ ] Deliver within 30 days (automate within 24 hours)
- [ ] Verify identity before releasing data
- [ ] Log all access requests

**Database Schema:**
```sql
CREATE TABLE gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  request_type VARCHAR(50), -- 'access', 'erasure', 'rectification', 'portability'
  status VARCHAR(50), -- 'submitted', 'verified', 'processing', 'completed', 'rejected'

  -- Identity verification
  verification_method VARCHAR(50), -- 'email_otp', 'government_id', 'two_factor'
  verified_at TIMESTAMP,

  -- Processing
  requested_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  completed_at TIMESTAMP,

  -- Data export (for access requests)
  export_file_url TEXT,
  export_format VARCHAR(20), -- 'json', 'pdf', 'csv'
  export_size_bytes BIGINT,

  -- Notes
  rejection_reason TEXT,
  admin_notes TEXT,

  created_by UUID,
  processed_by UUID
);

CREATE INDEX idx_gdpr_user ON gdpr_requests(user_id, requested_at DESC);
CREATE INDEX idx_gdpr_status ON gdpr_requests(status, due_date);
```

**API Specification:**
```typescript
// POST /api/gdpr/request-data
// User requests their data
interface DataAccessRequest {
  format: 'json' | 'pdf' | 'both';
  verificationCode: string; // OTP sent to email
}

interface DataAccessResponse {
  requestId: string;
  status: 'processing';
  estimatedCompletion: Date;
  message: string;
}

// GET /api/gdpr/requests/:id
// Check request status
interface RequestStatus {
  id: string;
  status: 'processing' | 'completed';
  downloadUrl?: string;
  expiresAt?: Date; // Download link expires in 7 days
}

// GET /api/gdpr/data-export/:token
// Download data export
```

**Data Collection:**
```typescript
// Gather data from all tables containing user PII
const dataExport = {
  profile: {...},
  invoices: [...],
  transactions: [...],
  communications: [...],
  auditLog: [...],
  preferences: {...},
  consents: [...],
};
```

---

### Story 3.2: Right to Erasure (Article 17)
**Priority:** P1 - Legal Requirement
**Estimate:** 13 story points (1 week)

**User Story:**
```
As a data subject
I want to request deletion of my personal data
So that I can exercise my right to be forgotten
```

**Acceptance Criteria:**
- [ ] Soft delete user data (anonymization)
- [ ] Preserve data required for legal obligations
- [ ] Document retention policies per data type
- [ ] Cascade deletion across related tables
- [ ] Generate erasure certificate
- [ ] Cannot restore after erasure
- [ ] Notify third parties if data was shared

**Implementation:**
```typescript
// Pseudonymization strategy
interface ErasureStrategy {
  users: 'anonymize'; // Replace PII with random IDs
  invoices: 'retain'; // Legal requirement (7 years)
  communications: 'delete'; // No legal basis
  auditLog: 'retain_anonymized'; // Keep actions, anonymize actor
  transactionsRecords: 'retain'; // Financial records
}

// Anonymization function
async function anonymizeUser(userId: string) {
  await transaction(async (client) => {
    // Replace with anonymized data
    await client.query(`
      UPDATE users
      SET
        email = 'deleted-' || id || '@anonymized.local',
        full_name = 'Deleted User',
        phone = NULL,
        avatar = NULL,
        is_anonymized = true,
        anonymized_at = NOW()
      WHERE id = $1
    `, [userId]);

    // Cascade to related data
    await client.query(`
      UPDATE communications
      SET recipient_email = 'anonymized@local'
      WHERE user_id = $1
    `, [userId]);

    // etc.
  });
}
```

---

## 📋 EPIC 4: Financial Compliance

### Story 4.1: Double-Entry Bookkeeping Enforcement
**Priority:** P1 - Financial Integrity
**Estimate:** 8 story points

**Acceptance Criteria:**
- [ ] Every transaction must balance (debits = credits)
- [ ] Prevent unbalanced journal entries
- [ ] Database constraints enforce integrity
- [ ] Auto-detection of imbalances
- [ ] Red flag alert on violation

**Database Constraints:**
```sql
-- Ensure balanced transactions
CREATE OR REPLACE FUNCTION check_transaction_balance()
RETURNS TRIGGER AS $$
DECLARE
  total_debit DECIMAL(15,2);
  total_credit DECIMAL(15,2);
BEGIN
  -- Sum debits and credits for this transaction
  SELECT
    COALESCE(SUM(debit_amount), 0),
    COALESCE(SUM(credit_amount), 0)
  INTO total_debit, total_credit
  FROM transaction_lines
  WHERE transaction_id = NEW.transaction_id;

  -- Check balance
  IF total_debit != total_credit THEN
    RAISE EXCEPTION 'Unbalanced transaction: debits=% credits=%', total_debit, total_credit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_transaction_balance
AFTER INSERT OR UPDATE ON transaction_lines
FOR EACH ROW
EXECUTE FUNCTION check_transaction_balance();
```

---

## 📋 EPIC 5: Operational Processes

### Story 5.1: Automated Backup & Recovery
**Priority:** P0 - Data Protection
**Estimate:** 5 story points

**Deliverables:**
- [ ] Daily automated Postgres backups
- [ ] Point-in-time recovery capability
- [ ] Backup verification (restore test)
- [ ] Off-site backup storage (S3/Azure)
- [ ] Backup retention: 30 days daily, 12 months monthly
- [ ] Recovery runbook
- [ ] RTO: 4 hours, RPO: 1 hour

**Implementation:**
```bash
# Automated backup script
0 2 * * * pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz && \
  aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://saudi-store-backups/
```

---

### Story 5.2: Health Checks & Uptime Monitoring
**Priority:** P1 - Reliability
**Estimate:** 3 story points

**Deliverables:**
- [ ] `/api/health` endpoint with detailed checks
- [ ] Database connection check
- [ ] Redis connection check
- [ ] External service health (Stripe, S3, etc)
- [ ] Response time monitoring
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Alert on downtime > 1 minute
- [ ] Status page (status.doganhubstore.com)

---

## 📈 Priority Matrix

```
       ┌──────────────────────────────────────────┐
       │ URGENT │ IMPORTANT                      │
P0/P1  │ ✓ Audit Trail                           │
       │ ✓ ZATCA Phase 1                         │
       │ ✓ GDPR Access                           │
       │ ✓ Backups                               │
       ├──────────────────────────────────────────┤
P1/P2  │ ✓ ZATCA Phase 2                         │
       │ ✓ GDPR Erasure                          │
       │ ✓ Health Monitoring                     │
       ├──────────────────────────────────────────┤
P2     │ ✓ Advanced Analytics                    │
       │ ✓ Performance Optimization              │
       └──────────────────────────────────────────┘
```

---

## ✅ Definition of Done

Each story is "Done" when:
- [ ] Code implemented and peer-reviewed
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests written
- [ ] API documentation updated
- [ ] Database migrations created
- [ ] Feature flagged (can disable in production)
- [ ] Deployed to staging and tested
- [ ] Runbook/playbook documented
- [ ] Product owner acceptance

---

**Last Updated:** 2025-11-19
**Next Review:** After P0 blockers cleared
**Owner:** Engineering Leadership
