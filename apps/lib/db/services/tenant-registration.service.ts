import { query, transaction, PoolClient } from '../connection';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export interface TenantRegistrationData {
  // Company Legal Information
  companyLegalName: string;
  companyLegalNameAr?: string;
  tradeName?: string;
  tradeNameAr?: string;
  registrationNumber: string;
  taxNumber: string;
  commercialLicense: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  companyType: string;
  establishmentDate?: string;
  
  // Company Details
  industry: string;
  subIndustry?: string;
  numberOfEmployees?: string;
  annualRevenue?: string;
  businessDescription?: string;
  businessDescriptionAr?: string;
  website?: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  poBox?: string;
  
  // Primary Contact
  contactFirstName: string;
  contactLastName: string;
  contactFirstNameAr?: string;
  contactLastNameAr?: string;
  contactEmail: string;
  contactPhone: string;
  contactMobile?: string;
  contactPosition: string;
  contactDepartment?: string;
  
  // Financial Contact
  financialContactName?: string;
  financialContactEmail?: string;
  financialContactPhone?: string;
  financialDepartment?: string;
  
  // Technical Contact
  technicalContactName?: string;
  technicalContactEmail?: string;
  technicalContactPhone?: string;
  technicalDepartment?: string;
  
  // Billing Information
  billingContactName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  paymentMethod?: string;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  swiftCode?: string;
  
  // Subscription
  subscriptionPlan: string;
  subscriptionDuration?: number;
  maxUsers?: number;
  storageGB?: number;
  selectedModules?: string[];
  additionalServices?: string[];
  
  // Compliance
  dataResidency?: string;
  gdprCompliance?: boolean;
  sdaiaCompliance?: boolean;
  iso27001?: boolean;
  
  // Terms
  termsAccepted: boolean;
  privacyAccepted: boolean;
  slaAccepted: boolean;
  dataProcessingAccepted: boolean;
  
  // Electronic Signature
  signerName: string;
  signerTitle: string;
  signerEmail: string;
  signature: string;
  signatureDate: string;
  signatureIp?: string;
  
  // Admin Account
  adminEmail: string;
  adminPassword: string;
  
  // Documents
  uploadedDocuments?: Record<string, string>;
}

export interface TenantRecord {
  id: string;
  tenantCode: string;
  tenantName: string;
  subscriptionTier: string;
  verificationStatus: string;
  createdAt: string;
}

/**
 * Create complete tenant registration with all relations
 */
export async function createTenantRegistration(
  data: TenantRegistrationData
): Promise<TenantRecord> {
  return await transaction(async (client: PoolClient) => {
    // Generate unique identifiers
    const tenantId = randomUUID();
    const tenantCode = `${data.companyLegalName.substring(0, 3).toUpperCase()}-${Date.now()}`;
    
    // Calculate subscription dates
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (data.subscriptionDuration || 12));
    
    // Determine max users based on plan
    const maxUsers = data.maxUsers || (
      data.subscriptionPlan === 'basic' ? 10 :
      data.subscriptionPlan === 'professional' ? 25 :
      data.subscriptionPlan === 'enterprise' ? 999 : 10
    );
    
    const storageGB = data.storageGB || (
      data.subscriptionPlan === 'basic' ? 50 :
      data.subscriptionPlan === 'professional' ? 100 :
      data.subscriptionPlan === 'enterprise' ? 500 : 50
    );
    
    // 1. Insert Tenant
    const tenantResult = await client.query(`
      INSERT INTO tenants (
        id, tenant_code, tenant_name, tenant_name_ar,
        subscription_tier, subscription_status, subscription_start_date, subscription_end_date,
        max_users, max_storage_gb,
        primary_contact_name, primary_contact_email, primary_contact_phone,
        billing_email, support_email,
        address_line1, address_line2, city, state, country, postal_code,
        enabled_modules, feature_flags,
        is_active, is_verified, verification_status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10,
        $11, $12, $13,
        $14, $15,
        $16, $17, $18, $19, $20, $21,
        $22, $23,
        $24, $25, $26,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING id, tenant_code, tenant_name, subscription_tier, created_at
    `, [
      tenantId,
      tenantCode,
      data.companyLegalName,
      data.companyLegalNameAr,
      data.subscriptionPlan,
      'pending_verification',
      subscriptionStartDate,
      subscriptionEndDate,
      maxUsers,
      storageGB,
      `${data.contactFirstName} ${data.contactLastName}`,
      data.contactEmail,
      data.contactPhone,
      data.billingEmail || data.contactEmail,
      data.contactEmail,
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.state,
      data.country,
      data.postalCode,
      data.selectedModules || ['finance', 'sales'],
      JSON.stringify({
        gdprCompliance: data.gdprCompliance || false,
        sdaiaCompliance: data.sdaiaCompliance || false,
        iso27001: data.iso27001 || false
      }),
      false, // is_active - will be activated after verification
      false, // is_verified
      'pending'
    ]);
    
    // 2. Insert Tenant Extended Info
    await client.query(`
      INSERT INTO tenant_extended_info (
        tenant_id,
        trade_name, trade_name_ar,
        registration_number, tax_number, commercial_license,
        license_issue_date, license_expiry_date,
        company_type, establishment_date,
        industry, sub_industry,
        number_of_employees, annual_revenue,
        business_description, business_description_ar,
        website, po_box,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.tradeName,
      data.tradeNameAr,
      data.registrationNumber,
      data.taxNumber,
      data.commercialLicense,
      data.licenseIssueDate,
      data.licenseExpiryDate,
      data.companyType,
      data.establishmentDate,
      data.industry,
      data.subIndustry,
      data.numberOfEmployees,
      data.annualRevenue,
      data.businessDescription,
      data.businessDescriptionAr,
      data.website,
      data.poBox
    ]);
    
    // 3. Insert Primary Contact
    await client.query(`
      INSERT INTO tenant_contacts (
        id, tenant_id, contact_type,
        first_name, last_name, first_name_ar, last_name_ar,
        email, phone, mobile,
        position, department,
        is_primary, is_active,
        created_at
      ) VALUES (
        gen_random_uuid(), $1, 'primary',
        $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10,
        true, true,
        CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.contactFirstName,
      data.contactLastName,
      data.contactFirstNameAr,
      data.contactLastNameAr,
      data.contactEmail,
      data.contactPhone,
      data.contactMobile,
      data.contactPosition,
      data.contactDepartment
    ]);
    
    // 4. Insert Financial Contact (if provided)
    if (data.financialContactEmail) {
      await client.query(`
        INSERT INTO tenant_contacts (
          id, tenant_id, contact_type,
          first_name, email, phone, department,
          is_primary, is_active, created_at
        ) VALUES (
          gen_random_uuid(), $1, 'financial',
          $2, $3, $4, $5,
          false, true, CURRENT_TIMESTAMP
        )
      `, [
        tenantId,
        data.financialContactName,
        data.financialContactEmail,
        data.financialContactPhone,
        data.financialDepartment
      ]);
    }
    
    // 5. Insert Technical Contact (if provided)
    if (data.technicalContactEmail) {
      await client.query(`
        INSERT INTO tenant_contacts (
          id, tenant_id, contact_type,
          first_name, email, phone, department,
          is_primary, is_active, created_at
        ) VALUES (
          gen_random_uuid(), $1, 'technical',
          $2, $3, $4, $5,
          false, true, CURRENT_TIMESTAMP
        )
      `, [
        tenantId,
        data.technicalContactName,
        data.technicalContactEmail,
        data.technicalContactPhone,
        data.technicalDepartment
      ]);
    }
    
    // 6. Insert Billing Information
    await client.query(`
      INSERT INTO tenant_billing_info (
        tenant_id,
        billing_contact_name, billing_email, billing_phone,
        billing_address, billing_city, billing_postal_code,
        payment_method, bank_name, bank_account_number,
        iban, swift_code,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.billingContactName,
      data.billingEmail || data.contactEmail,
      data.billingPhone,
      data.billingAddress || data.addressLine1,
      data.billingCity || data.city,
      data.billingPostalCode || data.postalCode,
      data.paymentMethod,
      data.bankName,
      data.bankAccountNumber,
      data.iban,
      data.swiftCode
    ]);
    
    // 7. Insert Subscription Details
    await client.query(`
      INSERT INTO tenant_subscriptions (
        id, tenant_id,
        plan_name, plan_duration_months,
        start_date, end_date,
        max_users, storage_gb,
        selected_modules, additional_services,
        status, is_active,
        created_at
      ) VALUES (
        gen_random_uuid(), $1,
        $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        'pending_payment', true,
        CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.subscriptionPlan,
      data.subscriptionDuration || 12,
      subscriptionStartDate,
      subscriptionEndDate,
      maxUsers,
      storageGB,
      data.selectedModules || [],
      data.additionalServices || []
    ]);
    
    // 8. Insert Terms Acceptance
    await client.query(`
      INSERT INTO tenant_terms_acceptance (
        tenant_id,
        terms_accepted, terms_accepted_at,
        privacy_accepted, privacy_accepted_at,
        sla_accepted, sla_accepted_at,
        data_processing_accepted, data_processing_accepted_at,
        accepted_by_name, accepted_by_email,
        ip_address,
        created_at
      ) VALUES (
        $1, $2, CURRENT_TIMESTAMP, $3, CURRENT_TIMESTAMP,
        $4, CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP,
        $6, $7, $8, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.termsAccepted,
      data.privacyAccepted,
      data.slaAccepted,
      data.dataProcessingAccepted,
      data.signerName,
      data.signerEmail,
      data.signatureIp
    ]);
    
    // 9. Insert Electronic Signature
    await client.query(`
      INSERT INTO tenant_electronic_signatures (
        tenant_id,
        signer_name, signer_title, signer_email,
        signature_data, signature_date,
        ip_address, user_agent,
        document_type, document_version,
        is_valid, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.signerName,
      data.signerTitle,
      data.signerEmail,
      data.signature,
      data.signatureDate,
      data.signatureIp,
      'Registration Form',
      'registration_agreement',
      '1.0'
    ]);
    
    // 10. Insert Uploaded Documents
    if (data.uploadedDocuments) {
      for (const [docType, fileName] of Object.entries(data.uploadedDocuments)) {
        await client.query(`
          INSERT INTO tenant_documents (
            id, tenant_id,
            document_type, document_name, file_path,
            file_size, mime_type,
            verification_status, is_required,
            uploaded_at, created_at
          ) VALUES (
            gen_random_uuid(), $1,
            $2, $3, $4,
            0, 'application/pdf',
            'pending', true,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, [
          tenantId,
          docType,
          fileName,
          `/uploads/registrations/${tenantId}/${fileName}`
        ]);
      }
    }
    
    // 11. Hash password and create admin user
    const passwordHash = await bcrypt.hash(data.adminPassword, 10);
    
    await client.query(`
      INSERT INTO platform_users (
        id, tenant_id,
        email, username, password_hash,
        first_name, last_name,
        first_name_ar, last_name_ar,
        phone, role,
        is_active, is_verified, email_verified,
        must_change_password,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1,
        $2, $3, $4,
        $5, $6,
        $7, $8,
        $9, 'tenant_admin',
        false, false, false,
        false,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      data.adminEmail,
      data.adminEmail.split('@')[0],
      passwordHash,
      data.contactFirstName,
      data.contactLastName,
      data.contactFirstNameAr,
      data.contactLastNameAr,
      data.contactPhone
    ]);
    
    // 12. Create Audit Log
    await client.query(`
      INSERT INTO platform_audit_logs (
        id, tenant_id,
        action_type, action_category, action_description,
        actor_type, actor_id,
        target_type, target_id,
        new_value, ip_address,
        success, created_at
      ) VALUES (
        gen_random_uuid(), $1,
        'tenant_registration', 'registration', 'Complete customer registration submitted',
        'system', 'registration_system',
        'tenant', $1,
        $2, $3,
        true, CURRENT_TIMESTAMP
      )
    `, [
      tenantId,
      JSON.stringify({ tenantCode, companyName: data.companyLegalName }),
      data.signatureIp
    ]);
    
    return {
      id: tenantId,
      tenantCode,
      tenantName: data.companyLegalName,
      subscriptionTier: data.subscriptionPlan,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString()
    };
  });
}

/**
 * Get tenant by ID with all relations
 */
export async function getTenantWithRelations(tenantId: string) {
  const result = await query(`
    SELECT 
      t.*,
      tei.registration_number, tei.tax_number, tei.industry,
      json_agg(DISTINCT tc.*) as contacts,
      tbi.billing_email, tbi.payment_method,
      ts.plan_name, ts.selected_modules
    FROM tenants t
    LEFT JOIN tenant_extended_info tei ON t.id = tei.tenant_id
    LEFT JOIN tenant_contacts tc ON t.id = tc.tenant_id
    LEFT JOIN tenant_billing_info tbi ON t.id = tbi.tenant_id
    LEFT JOIN tenant_subscriptions ts ON t.id = ts.tenant_id
    WHERE t.id = $1
    GROUP BY t.id, tei.registration_number, tei.tax_number, tei.industry,
             tbi.billing_email, tbi.payment_method, ts.plan_name, ts.selected_modules
  `, [tenantId]);
  
  return result.rows[0] || null;
}

/**
 * Update tenant verification status
 */
export async function updateTenantVerificationStatus(
  tenantId: string,
  status: 'pending' | 'approved' | 'rejected',
  reason?: string
) {
  await query(`
    UPDATE tenants
    SET verification_status = $2,
        is_verified = $3,
        verified_at = CASE WHEN $2 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END,
        is_active = CASE WHEN $2 = 'approved' THEN true ELSE false END,
        suspension_reason = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [tenantId, status, status === 'approved', reason]);
}
