/**
 * Form Validation Utilities
 * Comprehensive validation library for financial forms and data entry
 */

import { z } from 'zod';

// Common validation patterns
const commonPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  currency: /^\$?\d+(?:\.\d{1,2})?$/,
  accountNumber: /^[A-Z0-9\-]{8,20}$/,
  taxId: /^[0-9]{9}$|^[0-9]{2}-[0-9]{7}$/,
  routingNumber: /^\d{9}$/,
};

// Common validation messages
const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Cannot exceed ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Cannot exceed ${max}`,
  positive: 'Must be a positive number',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
};

// Financial validation schemas
export const financialSchemas = {
  // Account validation
  account: z.object({
    accountName: z.string().min(2, validationMessages.minLength(2)).max(100),
    accountNumber: z.string().regex(commonPatterns.accountNumber, 'Invalid account number format'),
    accountType: z.string().min(1, validationMessages.required),
    currency: z.string().min(1, validationMessages.required),
    openingBalance: z.number().min(0, validationMessages.positive),
    description: z.string().max(500).optional(),
    isActive: z.boolean().default(true),
  }),

  // Transaction validation
  transaction: z.object({
    amount: z.number().positive(validationMessages.positive),
    description: z.string().min(2, validationMessages.minLength(2)).max(200),
    transactionDate: z.date(),
    accountId: z.string().min(1, validationMessages.required),
    category: z.string().min(1, validationMessages.required),
    reference: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),
  }),

  // Vendor/Customer validation
  contact: z.object({
    name: z.string().min(2, validationMessages.minLength(2)).max(100),
    email: z.string().email(validationMessages.email).optional(),
    phone: z.string().regex(commonPatterns.phone, validationMessages.phone).optional(),
    address: z.string().max(200).optional(),
    taxId: z.string().regex(commonPatterns.taxId, 'Invalid tax ID format').optional(),
    paymentTerms: z.number().min(0).max(365).optional(),
  }),

  // Budget validation
  budget: z.object({
    name: z.string().min(2, validationMessages.minLength(2)).max(100),
    amount: z.number().positive(validationMessages.positive),
    period: z.enum(['monthly', 'quarterly', 'annual']),
    startDate: z.date(),
    endDate: z.date(),
    category: z.string().min(1, validationMessages.required),
    description: z.string().max(500).optional(),
  }),
};

// Validation utility functions
export const validationUtils = {
  // Required field validation
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return validationMessages.required;
    }
    return null;
  },

  // Email validation
  email: (value: string) => {
    if (value && !commonPatterns.email.test(value)) {
      return validationMessages.email;
    }
    return null;
  },

  // Phone validation
  phone: (value: string) => {
    if (value && !commonPatterns.phone.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return validationMessages.phone;
    }
    return null;
  },

  // Currency validation
  currency: (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(numValue) || numValue < 0) {
      return validationMessages.positive;
    }
    return null;
  },

  // Minimum length validation
  minLength: (value: string, min: number) => {
    if (value && value.length < min) {
      return validationMessages.minLength(min);
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value: string, max: number) => {
    if (value && value.length > max) {
      return validationMessages.maxLength(max);
    }
    return null;
  },

  // Date validation
  futureDate: (date: Date) => {
    if (date && date <= new Date()) {
      return validationMessages.futureDate;
    }
    return null;
  },

  // Past date validation
  pastDate: (date: Date) => {
    if (date && date >= new Date()) {
      return validationMessages.pastDate;
    }
    return null;
  },

  // Validate form with Zod schema
  validateWithSchema: <T>(schema: z.ZodSchema<T>, data: any): { valid: boolean; errors: Record<string, string> } => {
    try {
      schema.parse(data);
      return { valid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { valid: false, errors };
      }
      return { valid: false, errors: { general: 'Validation failed' } };
    }
  },

  // Async validation (for API checks)
  asyncValidate: async (value: any, validator: (value: any) => Promise<string | null>) => {
    return await validator(value);
  },
};

// Form field types and interfaces
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: (value: any) => string | null;
  asyncValidation?: (value: any) => Promise<string | null>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Hook for form state management
export const useFormState = (initialValues: Record<string, any> = {}) => {
  const [state, setState] = React.useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  const setFieldValue = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true },
    }));
  };

  const setFieldError = (field: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: error ? { ...prev.errors, [field]: error } : { ...prev.errors, [field]: undefined },
    }));
  };

  const validateField = (field: string, value: any, validation?: (value: any) => string | null) => {
    if (validation) {
      const error = validation(value);
      setFieldError(field, error);
      return !error;
    }
    return true;
  };

  const validateForm = (fields: FormField[]) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = state.values[field.name];
      
      // Required field validation
      if (field.required && (value === null || value === undefined || value === '')) {
        newErrors[field.name] = validationMessages.required;
        isValid = false;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setState(prev => ({ ...prev, errors: newErrors, isValid }));
    return isValid;
  };

  const resetForm = () => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });
  };

  return {
    state,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    resetForm,
    setSubmitting: (isSubmitting: boolean) => setState(prev => ({ ...prev, isSubmitting })),
  };
};

// Default form configurations
export const formConfigs = {
  account: {
    fields: [
      {
        name: 'accountName',
        label: 'Account Name',
        type: 'text',
        required: true,
        placeholder: 'Enter account name',
        validation: (value: string) => validationUtils.minLength(value, 2),
      },
      {
        name: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        required: true,
        placeholder: 'Enter account number',
        validation: (value: string) => validationUtils.minLength(value, 8),
      },
      {
        name: 'accountType',
        label: 'Account Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Asset', value: 'asset' },
          { label: 'Liability', value: 'liability' },
          { label: 'Equity', value: 'equity' },
          { label: 'Revenue', value: 'revenue' },
          { label: 'Expense', value: 'expense' },
        ],
      },
      {
        name: 'openingBalance',
        label: 'Opening Balance',
        type: 'number',
        required: true,
        placeholder: '0.00',
        validation: (value: number) => validationUtils.currency(value),
      },
    ],
  },

  transaction: {
    fields: [
      {
        name: 'amount',
        label: 'Amount',
        type: 'number',
        required: true,
        placeholder: '0.00',
        validation: (value: number) => validationUtils.currency(value),
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        required: true,
        placeholder: 'Transaction description',
        validation: (value: string) => validationUtils.minLength(value, 2),
      },
      {
        name: 'transactionDate',
        label: 'Date',
        type: 'date',
        required: true,
      },
    ],
  },
};