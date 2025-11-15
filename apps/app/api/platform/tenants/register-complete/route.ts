import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createTenantRegistration, TenantRegistrationData } from '@/lib/db/services/tenant-registration.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract all form fields
    const registrationData = {
      // Company Legal Information
      companyLegalName: formData.get('companyLegalName') as string,
      companyLegalNameAr: formData.get('companyLegalNameAr') as string,
      tradeName: formData.get('tradeName') as string,
      tradeNameAr: formData.get('tradeNameAr') as string,
      registrationNumber: formData.get('registrationNumber') as string,
      taxNumber: formData.get('taxNumber') as string,
      commercialLicense: formData.get('commercialLicense') as string,
      licenseIssueDate: formData.get('licenseIssueDate') as string,
      licenseExpiryDate: formData.get('licenseExpiryDate') as string,
      companyType: formData.get('companyType') as string,
      establishmentDate: formData.get('establishmentDate') as string,
      
      // Company Details
      industry: formData.get('industry') as string,
      subIndustry: formData.get('subIndustry') as string,
      numberOfEmployees: formData.get('numberOfEmployees') as string,
      annualRevenue: formData.get('annualRevenue') as string,
      businessDescription: formData.get('businessDescription') as string,
      businessDescriptionAr: formData.get('businessDescriptionAr') as string,
      website: formData.get('website') as string,
      
      // Address
      addressLine1: formData.get('addressLine1') as string,
      addressLine2: formData.get('addressLine2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      poBox: formData.get('poBox') as string,
      
      // Contacts
      contactFirstName: formData.get('contactFirstName') as string,
      contactLastName: formData.get('contactLastName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
      contactPosition: formData.get('contactPosition') as string,
      
      financialContactName: formData.get('financialContactName') as string,
      financialContactEmail: formData.get('financialContactEmail') as string,
      financialContactPhone: formData.get('financialContactPhone') as string,
      
      technicalContactName: formData.get('technicalContactName') as string,
      technicalContactEmail: formData.get('technicalContactEmail') as string,
      technicalContactPhone: formData.get('technicalContactPhone') as string,
      
      // Billing
      billingContactName: formData.get('billingContactName') as string,
      billingEmail: formData.get('billingEmail') as string,
      billingPhone: formData.get('billingPhone') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      iban: formData.get('iban') as string,
      swiftCode: formData.get('swiftCode') as string,
      
      // Subscription
      subscriptionPlan: formData.get('subscriptionPlan') as string,
      subscriptionDuration: formData.get('subscriptionDuration') as string,
      selectedModules: JSON.parse(formData.get('selectedModules') as string || '[]'),
      additionalServices: JSON.parse(formData.get('additionalServices') as string || '[]'),
      
      // Compliance
      dataResidency: formData.get('dataResidency') as string,
      gdprCompliance: formData.get('gdprCompliance') === 'true',
      sdaiaCompliance: formData.get('sdaiaCompliance') === 'true',
      
      // Terms
      termsAccepted: formData.get('termsAccepted') === 'true',
      privacyAccepted: formData.get('privacyAccepted') === 'true',
      slaAccepted: formData.get('slaAccepted') === 'true',
      dataProcessingAccepted: formData.get('dataProcessingAccepted') === 'true',
      
      // Signature
      signerName: formData.get('signerName') as string,
      signerTitle: formData.get('signerTitle') as string,
      signerEmail: formData.get('signerEmail') as string,
      signature: formData.get('signature') as string,
      signatureDate: formData.get('signatureDate') as string,
      
      // Admin Account
      adminEmail: formData.get('adminEmail') as string,
      adminPassword: formData.get('adminPassword') as string,
      
      // Metadata
      submittedAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Handle file uploads first
    const uploadedFiles: Record<string, string> = {};
    const tempTenantId = `temp-${Date.now()}`;
    const uploadDir = join(process.cwd(), 'uploads', 'registrations', tempTenantId);
    await mkdir(uploadDir, { recursive: true });
    
    const fileFields = [
      'commercialLicenseFile',
      'taxCertificateFile',
      'authorizationLetterFile',
      'idCopyFile'
    ];

    for (const fieldName of fileFields) {
      const file = formData.get(fieldName) as File;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${fieldName}-${Date.now()}.pdf`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        uploadedFiles[fieldName] = fileName;
      }
    }

    // Prepare registration data for database service
    const dbRegistrationData: TenantRegistrationData = {
      companyLegalName: registrationData.companyLegalName,
      companyLegalNameAr: registrationData.companyLegalNameAr,
      tradeName: registrationData.tradeName,
      tradeNameAr: registrationData.tradeNameAr,
      registrationNumber: registrationData.registrationNumber,
      taxNumber: registrationData.taxNumber,
      commercialLicense: registrationData.commercialLicense,
      licenseIssueDate: registrationData.licenseIssueDate,
      licenseExpiryDate: registrationData.licenseExpiryDate,
      companyType: registrationData.companyType,
      establishmentDate: registrationData.establishmentDate,
      industry: registrationData.industry,
      subIndustry: registrationData.subIndustry,
      numberOfEmployees: registrationData.numberOfEmployees,
      annualRevenue: registrationData.annualRevenue,
      businessDescription: registrationData.businessDescription,
      businessDescriptionAr: registrationData.businessDescriptionAr,
      website: registrationData.website,
      addressLine1: registrationData.addressLine1,
      addressLine2: registrationData.addressLine2,
      city: registrationData.city,
      state: registrationData.state,
      postalCode: registrationData.postalCode,
      country: registrationData.country,
      poBox: registrationData.poBox,
      contactFirstName: registrationData.contactFirstName,
      contactLastName: registrationData.contactLastName,
      contactEmail: registrationData.contactEmail,
      contactPhone: registrationData.contactPhone,
      contactPosition: registrationData.contactPosition,
      financialContactName: registrationData.financialContactName,
      financialContactEmail: registrationData.financialContactEmail,
      financialContactPhone: registrationData.financialContactPhone,
      technicalContactName: registrationData.technicalContactName,
      technicalContactEmail: registrationData.technicalContactEmail,
      technicalContactPhone: registrationData.technicalContactPhone,
      billingContactName: registrationData.billingContactName,
      billingEmail: registrationData.billingEmail,
      billingPhone: registrationData.billingPhone,
      paymentMethod: registrationData.paymentMethod,
      iban: registrationData.iban,
      swiftCode: registrationData.swiftCode,
      subscriptionPlan: registrationData.subscriptionPlan,
      subscriptionDuration: parseInt(registrationData.subscriptionDuration) || 12,
      selectedModules: registrationData.selectedModules,
      additionalServices: registrationData.additionalServices,
      dataResidency: registrationData.dataResidency,
      gdprCompliance: registrationData.gdprCompliance,
      sdaiaCompliance: registrationData.sdaiaCompliance,
      termsAccepted: registrationData.termsAccepted,
      privacyAccepted: registrationData.privacyAccepted,
      slaAccepted: registrationData.slaAccepted,
      dataProcessingAccepted: registrationData.dataProcessingAccepted,
      signerName: registrationData.signerName,
      signerTitle: registrationData.signerTitle,
      signerEmail: registrationData.signerEmail,
      signature: registrationData.signature,
      signatureDate: registrationData.signatureDate,
      signatureIp: registrationData.ipAddress,
      adminEmail: registrationData.adminEmail,
      adminPassword: registrationData.adminPassword,
      uploadedDocuments: uploadedFiles
    };

    // Save to database with all relations
    const tenantRecord = await createTenantRegistration(dbRegistrationData);

    // Send verification emails
    const emailTasks = [
      {
        to: registrationData.contactEmail,
        subject: 'Registration Received - Verification in Progress',
        template: 'registration_received',
        data: { tenantCode: tenantRecord.tenantCode, companyName: registrationData.companyLegalName }
      },
      {
        to: registrationData.financialContactEmail,
        subject: 'New Account Registration - Financial Review',
        template: 'financial_notification',
        data: { tenantCode: tenantRecord.tenantCode, companyName: registrationData.companyLegalName }
      },
      {
        to: 'admin@doganhub.com', // Internal notification
        subject: `New Registration: ${registrationData.companyLegalName}`,
        template: 'admin_new_registration',
        data: { tenantCode: tenantRecord.tenantCode, tenantRecord }
      }
    ];

    // TODO: Send emails
    // await Promise.all(emailTasks.map(task => sendEmail(task)));

    // Audit log is automatically created by the service

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
      data: {
        tenantId: tenantRecord.id,
        tenantCode: tenantRecord.tenantCode,
        tenantName: tenantRecord.tenantName,
        subscriptionTier: tenantRecord.subscriptionTier,
        verificationStatus: tenantRecord.verificationStatus,
        estimatedVerificationTime: '24-48 hours',
        nextSteps: [
          'Document verification in progress',
          'You will receive email confirmation',
          'Account will be activated after approval',
          'Onboarding call will be scheduled'
        ]
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again or contact support.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Complete registration endpoint',
    method: 'POST',
    contentType: 'multipart/form-data',
    requiredFields: [
      'companyLegalName',
      'registrationNumber',
      'taxNumber',
      'contactEmail',
      'adminEmail',
      'signature'
    ],
    optionalDocuments: [
      'commercialLicenseFile',
      'taxCertificateFile',
      'authorizationLetterFile',
      'idCopyFile'
    ]
  });
}
