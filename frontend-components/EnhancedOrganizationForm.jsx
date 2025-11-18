import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

/**
 * Enhanced Organization Onboarding Form
 * With sector-based intelligence and auto-configuration
 */
const EnhancedOrganizationForm = ({ organization, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [autoConfig, setAutoConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: organization?.name || '',
    name_ar: organization?.name_ar || '',
    commercial_registration_no: organization?.commercial_registration_no || '',
    vat_registration_no: organization?.vat_registration_no || '',
    website: organization?.website || '',
    primary_contact_name: organization?.primary_contact_name || '',
    primary_email: organization?.primary_email || '',
    primary_phone: organization?.primary_phone || '',
    
    // Sector & Classification ⭐ CRITICAL
    sector: organization?.sector || '',
    industry_subcategory: organization?.industry_subcategory || '',
    organization_type: organization?.organization_type || 'private',
    
    // Size & Scale ⭐
    employee_count: organization?.employee_count || '',
    annual_revenue: organization?.annual_revenue || '',
    location_count: organization?.location_count || 1,
    geographic_spread: organization?.geographic_spread || 'local',
    
    // Data Processing ⭐
    processes_personal_data: organization?.processes_personal_data || false,
    data_sensitivity_level: organization?.data_sensitivity_level || 'internal',
    processes_payment_data: organization?.processes_payment_data || false,
    provides_cloud_services: organization?.provides_cloud_services || false,
    is_critical_infrastructure: organization?.is_critical_infrastructure || false,
    
    // Location
    country: organization?.country || 'Saudi Arabia',
    city: organization?.city || '',
    address_line1: organization?.address_line1 || '',
    operates_internationally: organization?.operates_internationally || false,
    
    // Compliance Officer
    ciso_name: organization?.ciso_name || '',
    ciso_email: organization?.ciso_email || '',
    ciso_phone: organization?.ciso_phone || '',
    
    // Assessment Schedule
    assessment_frequency: organization?.assessment_frequency || 'quarterly',
    
    // Status
    is_active: organization?.is_active !== undefined ? organization.is_active : true,
  });

  // Load sectors on mount
  useEffect(() => {
    // Hardcoded sectors - can be loaded from API later
    setSectors([
      { code: 'healthcare', name: 'Healthcare', name_ar: 'الرعاية الصحية' },
      { code: 'finance', name: 'Financial Services', name_ar: 'الخدمات المالية' },
      { code: 'manufacturing', name: 'Manufacturing', name_ar: 'التصنيع' },
      { code: 'technology', name: 'Technology & IT', name_ar: 'التكنولوجيا' },
      { code: 'government', name: 'Government', name_ar: 'الحكومة' },
      { code: 'telecommunications', name: 'Telecommunications', name_ar: 'الاتصالات' },
      { code: 'energy', name: 'Energy & Utilities', name_ar: 'الطاقة' },
      { code: 'education', name: 'Education', name_ar: 'التعليم' },
      { code: 'retail', name: 'Retail & E-commerce', name_ar: 'التجزئة' },
      { code: 'insurance', name: 'Insurance', name_ar: 'التأمين' },
      { code: 'transportation', name: 'Transportation & Logistics', name_ar: 'النقل' },
      { code: 'construction', name: 'Construction & Real Estate', name_ar: 'البناء' },
    ]);
  }, []);

  // Auto-configure when sector changes
  useEffect(() => {
    if (formData.sector && formData.employee_count) {
      loadAutoConfiguration();
    }
  }, [formData.sector, formData.employee_count, formData.processes_personal_data]);

  const loadAutoConfiguration = async () => {
    if (!formData.sector) return;
    
    try {
      setLoading(true);
      const result = await apiService.sectorControls.getBySector(formData.sector);
      setAutoConfig(result);
    } catch (error) {
      console.error('Error loading auto-configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add auto-calculated fields
    const submitData = {
      ...formData,
      applicable_regulators: autoConfig?.regulators?.map(r => r.code) || [],
      applicable_frameworks: autoConfig?.frameworks?.map(f => f.framework_code) || [],
      estimated_control_count: autoConfig?.statistics?.total_controls || 0,
      mandatory_control_count: autoConfig?.statistics?.mandatory_controls || 0,
      onboarding_status: 'configured'
    };
    
    onSave(submitData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '8px' }}>
            {organization ? 'Edit Organization' : '🏢 Register New Organization'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
            Step {currentStep} of 3 • {currentStep === 1 ? 'Basic Info' : currentStep === 2 ? 'Sector & Classification' : 'Review Configuration'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Basic Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Organization Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Organization Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => updateField('name_ar', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      direction: 'rtl'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Commercial Registration No.
                  </label>
                  <input
                    type="text"
                    value={formData.commercial_registration_no}
                    onChange={(e) => updateField('commercial_registration_no', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    VAT Registration No.
                  </label>
                  <input
                    type="text"
                    value={formData.vat_registration_no}
                    onChange={(e) => updateField('vat_registration_no', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Primary Contact
                  </label>
                  <input
                    type="text"
                    value={formData.primary_contact_name}
                    onChange={(e) => updateField('primary_contact_name', e.target.value)}
                    placeholder="Contact Name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.primary_email}
                    onChange={(e) => updateField('primary_email', e.target.value)}
                    placeholder="contact@company.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.primary_phone}
                    onChange={(e) => updateField('primary_phone', e.target.value)}
                    placeholder="+966 ..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Organization Type
                  </label>
                  <select
                    value={formData.organization_type}
                    onChange={(e) => updateField('organization_type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="private">Private Company</option>
                    <option value="public">Public Company</option>
                    <option value="government">Government Entity</option>
                    <option value="non_profit">Non-Profit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={onClose} style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="button" onClick={() => setCurrentStep(2)} style={{
                  padding: '12px 32px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SECTOR & CLASSIFICATION */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Sector & Classification ⭐
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '16px' }}>
                This information determines which regulations, frameworks, and controls apply to your organization.
              </p>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Business Sector * ⭐ (Triggers auto-filtering)
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--accent)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#FEF3C7',
                    fontWeight: '600'
                  }}
                >
                  <option value="">Select your sector...</option>
                  {sectors.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.name_ar})
                    </option>
                  ))}
                </select>
                {formData.sector && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '6px', fontSize: '13px' }}>
                    ✅ Sector selected: {sectors.find(s => s.code === formData.sector)?.name}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Number of Employees * ⭐ (Affects control scaling)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.employee_count}
                    onChange={(e) => updateField('employee_count', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid var(--accent)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {formData.employee_count && (
                    <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--fg-muted)' }}>
                      Size: {formData.employee_count > 1000 ? 'Enterprise' : formData.employee_count > 250 ? 'Large' : formData.employee_count > 50 ? 'Medium' : 'Small'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Location Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.location_count}
                    onChange={(e) => updateField('location_count', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.processes_personal_data}
                    onChange={(e) => updateField('processes_personal_data', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
                    ⭐ We process personal data (Adds PDPL framework)
                  </span>
                </label>
                {formData.processes_personal_data && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#92400E', marginLeft: '30px' }}>
                    ✅ SDAIA PDPL framework will be added (+50 controls)
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.processes_payment_data}
                      onChange={(e) => updateField('processes_payment_data', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      Processes payment data
                    </span>
                  </label>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_critical_infrastructure}
                      onChange={(e) => updateField('is_critical_infrastructure', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      Critical infrastructure
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setCurrentStep(1)} style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ← Back
                </button>
                <button type="button" onClick={() => setCurrentStep(3)} style={{
                  padding: '12px 32px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Review Configuration →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AUTO-CONFIGURATION REVIEW */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                ⚙️ Auto-Configuration Review
              </h3>

              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                  Loading configuration...
                </div>
              ) : autoConfig ? (
                <>
                  <div style={{ padding: '16px', backgroundColor: '#DBEAFE', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF', marginBottom: '12px' }}>
                      ✅ Based on your sector ({formData.sector}), we've automatically configured:
                    </h4>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-muted)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                      Applicable Regulators ({autoConfig.regulators?.length || 0})
                    </h4>
                    {autoConfig.regulators?.map(reg => (
                      <div key={reg.code} style={{ marginBottom: '8px', fontSize: '13px' }}>
                        ✅ {reg.code} - {reg.name}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-muted)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                      Required Frameworks ({autoConfig.frameworks?.length || 0})
                    </h4>
                    {autoConfig.frameworks?.map(fw => (
                      <div key={fw.framework_code} style={{ marginBottom: '8px', fontSize: '13px' }}>
                        ✅ {fw.framework_name} ({fw.control_count} controls)
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#D1FAE5', borderRadius: '8px', border: '2px solid #10B981' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#065F46', marginBottom: '12px' }}>
                      📊 Total Controls Assigned
                    </h4>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#065F46', marginBottom: '8px' }}>
                      {autoConfig.statistics?.total_controls || 0}
                    </div>
                    <div style={{ fontSize: '13px', color: '#065F46' }}>
                      • Mandatory: {autoConfig.statistics?.mandatory_controls || 0}
                      <br />
                      • Optional: {autoConfig.statistics?.optional_controls || 0}
                    </div>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400E', marginBottom: '12px' }}>
                      📅 Recommended Assessment Schedule
                    </h4>
                    <div style={{ fontSize: '13px', color: '#92400E' }}>
                      Frequency: {formData.assessment_frequency || 'Quarterly'}
                      <br />
                      Estimated Duration: 8-12 weeks
                      <br />
                      Assessor Team: 4-6 people
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                  Please complete the sector and employee count fields to see auto-configuration.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setCurrentStep(2)} style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  ← Back
                </button>
                <button type="submit" style={{
                  padding: '12px 32px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}>
                  ✅ Create Organization
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnhancedOrganizationForm;

