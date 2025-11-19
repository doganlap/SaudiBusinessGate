# White-Label & Multi-Tenant Theming System Architecture

**Version**: 2.0 Enterprise  
**Date**: November 11, 2025  
**Revenue Model**: $500-2,000/month per white-label partner

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│              White-Label System Architecture                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Theme     │  │   Domain     │  │   Branding   │       │
│  │ Management  │  │  Management  │  │  Management  │       │
│  │             │  │              │  │              │       │
│  │ 50+ Styles  │  │ Auto SSL     │  │  Logo/Colors │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Email     │  │   Document   │  │     i18n     │       │
│  │  Templates  │  │   Templates  │  │   Support    │       │
│  │             │  │              │  │              │       │
│  │ 25+ Types   │  │  PDF/Excel   │  │  AR/EN/FR    │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Theme Management System

### **Customizable Theme Elements (50+)**

```typescript
interface WhiteLabelTheme {
  // Brand Identity
  branding: {
    companyName: string;
    logo: {
      primary: string;      // Main logo URL
      secondary: string;    // Alternative logo
      favicon: string;      // Browser favicon
      emailHeader: string;  // Email template logo
    };
    tagline?: string;
    description?: string;
  };

  // Color Palette
  colors: {
    primary: string;        // Main brand color
    secondary: string;      // Secondary brand color
    accent: string;         // Accent color for CTAs
    success: string;        // Success states
    warning: string;        // Warning states
    error: string;          // Error states
    info: string;           // Info messages
    
    // Neutral colors
    background: string;     // Page background
    surface: string;        // Card/panel background
    textPrimary: string;    // Main text color
    textSecondary: string;  // Secondary text
    border: string;         // Border colors
    
    // Interactive states
    hoverPrimary: string;   // Hover effects
    activePrimary: string;  // Active/pressed states
    disabledBg: string;     // Disabled backgrounds
    disabledText: string;   // Disabled text
  };

  // Typography
  typography: {
    fontFamily: {
      primary: string;      // Main font (e.g., 'Inter', 'Roboto')
      secondary?: string;   // Heading font
      monospace: string;    // Code/monospace font
    };
    
    fontSize: {
      xs: string;           // 12px
      sm: string;           // 14px
      base: string;         // 16px
      lg: string;           // 18px
      xl: string;           // 20px
      '2xl': string;        // 24px
      '3xl': string;        // 30px
      '4xl': string;        // 36px
    };
    
    fontWeight: {
      light: number;        // 300
      normal: number;       // 400
      medium: number;       // 500
      semibold: number;     // 600
      bold: number;         // 700
    };
  };

  // Layout
  layout: {
    borderRadius: {
      sm: string;           // 4px
      md: string;           // 8px
      lg: string;           // 12px
      xl: string;           // 16px
      full: string;         // 9999px
    };
    
    spacing: {
      xs: string;           // 4px
      sm: string;           // 8px
      md: string;           // 16px
      lg: string;           // 24px
      xl: string;           // 32px
      '2xl': string;        // 48px
    };
    
    shadows: {
      sm: string;           // Small shadow
      md: string;           // Medium shadow
      lg: string;           // Large shadow
      xl: string;           // Extra large shadow
    };
    
    maxWidth: string;       // Container max width
    sidebar: {
      width: string;        // Sidebar width
      collapsed: string;    // Collapsed width
    };
  };

  // Components
  components: {
    navbar: {
      background: string;
      textColor: string;
      height: string;
      logoPosition: 'left' | 'center' | 'right';
    };
    
    sidebar: {
      background: string;
      textColor: string;
      activeBackground: string;
      activeTextColor: string;
    };
    
    buttons: {
      primaryBg: string;
      primaryText: string;
      primaryHover: string;
      secondaryBg: string;
      secondaryText: string;
    };
    
    cards: {
      background: string;
      borderColor: string;
      shadow: string;
    };
  };

  // Advanced Settings
  advanced: {
    animations: boolean;    // Enable/disable animations
    darkMode: boolean;      // Dark mode available
    rtl: boolean;           // RTL support
    compactMode: boolean;   // Compact/comfortable spacing
    accessibility: {
      highContrast: boolean;
      focusIndicators: boolean;
    };
  };
}
```

### **Theme Storage Schema**

```sql
-- White-label themes table
CREATE TABLE white_label_themes (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    theme_name VARCHAR(100) NOT NULL,
    
    -- Brand Identity
    company_name VARCHAR(200),
    logo_primary TEXT,
    logo_secondary TEXT,
    favicon TEXT,
    tagline TEXT,
    
    -- Colors (JSON for flexibility)
    colors JSONB DEFAULT '{}',
    
    -- Typography
    typography JSONB DEFAULT '{}',
    
    -- Layout
    layout JSONB DEFAULT '{}',
    
    -- Components
    components JSONB DEFAULT '{}',
    
    -- Advanced settings
    advanced_settings JSONB DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_theme_id INTEGER REFERENCES white_label_themes(id),
    
    UNIQUE(organization_id, theme_name)
);

-- Theme history for rollback
CREATE TABLE white_label_theme_history (
    id SERIAL PRIMARY KEY,
    theme_id INTEGER NOT NULL REFERENCES white_label_themes(id),
    theme_data JSONB NOT NULL,
    version INTEGER NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT
);

-- Indexes
CREATE INDEX idx_themes_org ON white_label_themes(organization_id);
CREATE INDEX idx_themes_active ON white_label_themes(is_active);
CREATE INDEX idx_themes_history ON white_label_theme_history(theme_id, version);
```

---

## 2. Domain Management System

### **Multi-Domain Architecture**

```typescript
interface CustomDomain {
  id: number;
  organizationId: number;
  domain: string;              // e.g., 'partner.example.com'
  isPrimary: boolean;
  isActive: boolean;
  
  // SSL Configuration
  ssl: {
    provider: 'azure' | 'letsencrypt' | 'custom';
    certificateId?: string;
    expiresAt: Date;
    autoRenew: boolean;
    status: 'pending' | 'active' | 'expired' | 'error';
  };
  
  // DNS Configuration
  dns: {
    status: 'pending' | 'verified' | 'error';
    records: Array<{
      type: 'A' | 'CNAME' | 'TXT';
      name: string;
      value: string;
      verified: boolean;
    }>;
  };
  
  // Routing Configuration
  routing: {
    targetUrl: string;         // Backend URL to route to
    customHeaders?: Record<string, string>;
    redirects?: Array<{
      from: string;
      to: string;
      permanent: boolean;
    }>;
  };
  
  // Metadata
  createdAt: Date;
  verifiedAt?: Date;
  lastCheckedAt?: Date;
}
```

### **Domain Database Schema**

```sql
-- Custom domains table
CREATE TABLE custom_domains (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    
    -- SSL Configuration
    ssl_provider VARCHAR(50) DEFAULT 'azure',
    ssl_certificate_id TEXT,
    ssl_expires_at TIMESTAMP,
    ssl_auto_renew BOOLEAN DEFAULT true,
    ssl_status VARCHAR(50) DEFAULT 'pending',
    
    -- DNS Configuration
    dns_status VARCHAR(50) DEFAULT 'pending',
    dns_records JSONB DEFAULT '[]',
    dns_verified_at TIMESTAMP,
    
    -- Routing
    target_url TEXT NOT NULL,
    custom_headers JSONB DEFAULT '{}',
    redirects JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    last_checked_at TIMESTAMP,
    
    CONSTRAINT check_one_primary_per_org 
        EXCLUDE (organization_id WITH =, is_primary WITH AND)
        WHERE (is_primary = true)
);

-- Domain verification tokens
CREATE TABLE domain_verification_tokens (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES custom_domains(id),
    token VARCHAR(64) NOT NULL UNIQUE,
    verification_method VARCHAR(50), -- 'dns', 'http', 'email'
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SSL certificates
CREATE TABLE ssl_certificates (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER NOT NULL REFERENCES custom_domains(id),
    provider VARCHAR(50) NOT NULL,
    certificate_data TEXT, -- Encrypted
    private_key_data TEXT, -- Encrypted
    chain_data TEXT,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    last_renewal_attempt TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Indexes
CREATE INDEX idx_domains_org ON custom_domains(organization_id);
CREATE INDEX idx_domains_status ON custom_domains(dns_status, ssl_status);
CREATE INDEX idx_domain_tokens ON domain_verification_tokens(token, expires_at);
```

### **Automatic SSL Provisioning**

```typescript
class SSLManager {
  async provisionSSL(domain: string): Promise<{
    success: boolean;
    certificateId: string;
    expiresAt: Date;
  }> {
    // 1. Use Azure Front Door for automatic SSL
    // 2. Or integrate with Let's Encrypt for free SSL
    // 3. Automatic renewal 30 days before expiry
    
    return {
      success: true,
      certificateId: 'cert-' + Math.random().toString(36).substr(2, 9),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }
  
  async renewSSL(certificateId: string): Promise<boolean> {
    // Automatic renewal process
    return true;
  }
  
  async verifyDomain(domain: string, method: 'dns' | 'http'): Promise<boolean> {
    // Domain ownership verification
    return true;
  }
}
```

---

## 3. Branded Templates System

### **Email Templates (25+ Types)**

```typescript
interface EmailTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'notification';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Available variables like {{userName}}, {{companyName}}
  
  // Branding
  useWhiteLabel: boolean;
  customStyles?: {
    headerColor: string;
    footerColor: string;
    buttonColor: string;
    logoUrl: string;
  };
}

const emailTemplateTypes = [
  // Authentication & Account
  'welcome',
  'email-verification',
  'password-reset',
  'password-changed',
  'account-suspended',
  'account-reactivated',
  
  // Subscription & Billing
  'trial-started',
  'trial-ending',
  'subscription-activated',
  'subscription-renewed',
  'subscription-cancelled',
  'payment-succeeded',
  'payment-failed',
  'invoice-generated',
  
  // Usage & Limits
  'usage-threshold-warning',
  'feature-limit-reached',
  'upgrade-recommendation',
  
  // Notifications
  'new-feature-announcement',
  'maintenance-scheduled',
  'security-alert',
  'team-member-added',
  'report-ready',
  
  // Support
  'support-ticket-created',
  'support-ticket-resolved',
  'feedback-request'
];
```

### **Document Templates**

```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'quote' | 'report' | 'contract';
  format: 'pdf' | 'excel' | 'word';
  
  // Template content
  header: {
    logoUrl: string;
    companyInfo: string;
    customText?: string;
  };
  
  body: {
    template: string; // HTML or template engine syntax
    styles: string;   // CSS styles
  };
  
  footer: {
    text: string;
    pageNumbers: boolean;
    timestamp: boolean;
  };
  
  // Branding
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  
  fonts: {
    heading: string;
    body: string;
  };
}
```

---

## 4. Multi-Language Support

### **Language Configuration**

```typescript
interface LanguageConfig {
  code: string;           // 'en', 'ar', 'fr'
  name: string;           // 'English', 'العربية', 'Français'
  direction: 'ltr' | 'rtl';
  enabled: boolean;
  isDefault: boolean;
  
  // Localization files
  translations: {
    [key: string]: string;
  };
  
  // Formatting
  formats: {
    date: string;         // 'MM/DD/YYYY' or 'DD/MM/YYYY'
    time: string;         // '12h' or '24h'
    number: string;       // '1,000.00' or '1.000,00'
    currency: string;     // 'SAR', 'USD'
  };
}
```

### **Arabic RTL Support**

```css
/* RTL-specific styles */
[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
}

[dir="rtl"] .dropdown-menu {
  left: auto;
  right: 0;
}

/* Arabic typography */
[lang="ar"] {
  font-family: 'Cairo', 'Tajawal', 'Amiri', sans-serif;
  line-height: 1.8; /* Arabic needs more line height */
}
```

### **Translation Database Schema**

```sql
-- Translations table
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL,
    namespace VARCHAR(100) NOT NULL, -- 'common', 'dashboard', 'auth', etc.
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    organization_id INTEGER REFERENCES organizations(id), -- NULL for global
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(language_code, namespace, key, organization_id)
);

-- Language preferences
CREATE TABLE user_language_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    language_code VARCHAR(10) NOT NULL,
    date_format VARCHAR(50),
    time_format VARCHAR(50),
    timezone VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_translations_lang ON translations(language_code, namespace);
CREATE INDEX idx_translations_org ON translations(organization_id);
```

---

## 5. White-Label Admin Panel

### **Self-Service Branding Interface**

```typescript
interface WhiteLabelAdminPanel {
  sections: {
    // Brand Identity
    identity: {
      uploadLogo: () => void;
      setCompanyName: (name: string) => void;
      setTagline: (tagline: string) => void;
      setDescription: (description: string) => void;
    };
    
    // Theme Customization
    theme: {
      selectPreset: (preset: string) => void;
      customizeColors: () => void;
      customizeTypography: () => void;
      customizeLayout: () => void;
      preview: () => void;
    };
    
    // Domain Management
    domains: {
      addCustomDomain: (domain: string) => void;
      verifyDomain: (domainId: number) => void;
      provisionSSL: (domainId: number) => void;
      removeDomain: (domainId: number) => void;
    };
    
    // Email Templates
    emails: {
      listTemplates: () => EmailTemplate[];
      customizeTemplate: (templateId: string) => void;
      previewEmail: (templateId: string) => void;
      testSend: (templateId: string, email: string) => void;
    };
    
    // Document Templates
    documents: {
      customizeInvoice: () => void;
      customizeQuote: () => void;
      customizeReport: () => void;
    };
    
    // Language Settings
    languages: {
      enableLanguage: (code: string) => void;
      setDefaultLanguage: (code: string) => void;
      uploadTranslations: (file: File) => void;
    };
  };
  
  // Preview modes
  preview: {
    desktop: () => void;
    mobile: () => void;
    darkMode: () => void;
    rtl: () => void;
  };
  
  // Publishing
  publish: {
    saveAsDraft: () => void;
    publishChanges: () => void;
    rollback: (version: number) => void;
  };
}
```

---

## 6. Revenue Model

### **White-Label Pricing Tiers**

```typescript
const whitelabelPricingTiers = {
  basic: {
    price: 500, // SAR/month
    features: [
      'Custom logo and colors',
      '1 custom domain',
      'Basic email templates',
      'English language only',
      'Standard support'
    ]
  },
  
  professional: {
    price: 1000, // SAR/month
    features: [
      'Full theme customization',
      '3 custom domains',
      'All email templates customizable',
      'Multi-language (English + 1 language)',
      'Custom document templates',
      'Priority support'
    ]
  },
  
  enterprise: {
    price: 2000, // SAR/month
    features: [
      'Complete white-label solution',
      'Unlimited custom domains',
      'Fully customizable templates',
      'All languages (English, Arabic, French)',
      'Custom branding for all touchpoints',
      'Dedicated support engineer',
      'SLA guarantees'
    ]
  }
};
```

### **Implementation Timeline**

**Week 3 - Phase 3.1 (Days 1-2): Theme Engine**

- ✅ Theme management database schema
- ✅ CSS variable system for dynamic theming
- ✅ Theme editor UI components
- ✅ Preview functionality
- **Deploy**: Theme customization goes live

**Week 3 - Phase 3.2 (Days 2-3): Domain & SSL**

- ✅ Custom domain management system
- ✅ Automatic SSL provisioning with Azure/Let's Encrypt
- ✅ DNS verification workflow
- ✅ Domain health monitoring
- **Deploy**: Custom domains go live

**Week 3 - Phase 3.3 (Days 3-4): Templates & Languages**

- ✅ Branded email templates (25+ types)
- ✅ Document templates (PDF, Excel)
- ✅ Multi-language support (Arabic RTL, French)
- ✅ Translation management system
- **Deploy**: Complete white-label system live

---

## 7. Success Metrics

**Technical KPIs:**

- Theme Load Time: <500ms
- Domain Verification: <5 minutes
- SSL Provisioning: <10 minutes
- Template Rendering: <2s

**Business KPIs:**

- White-Label Partners: 10+ in first 3 months
- Revenue per Partner: $500-2,000/month
- Partner Satisfaction: 4.5+/5
- Time to Brand: <30 minutes

---

**Architecture Status**: ✅ Ready for Implementation  
**Revenue Potential**: $5,000-20,000/month (10 partners)  
**Next Step**: Begin Phase 3.1 - Theme Engine Development
