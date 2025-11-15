'use client';

import React from 'react';
import { FormField, FormState, useFormState } from '@/lib/validation/formValidation';

interface EnterpriseFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const EnterpriseForm: React.FC<EnterpriseFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  onCancel,
  children,
  className = '',
}) => {
  const form = useFormState(initialValues);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.validateForm(fields)) {
      form.setSubmitting(true);
      try {
        await onSubmit(form.state.values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        form.setSubmitting(false);
      }
    }
  };

  const renderField = (field: FormField) => {
    const value = form.state.values[field.name] || '';
    const error = form.state.errors[field.name];
    const touched = form.state.touched[field.name];

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        form.setFieldValue(field.name, newValue);
        
        if (touched && field.validation) {
          form.validateField(field.name, newValue, field.validation);
        }
      },
      onBlur: () => {
        if (field.validation) {
          form.validateField(field.name, value, field.validation);
        }
      },
      className: `enterprise-input ${error && touched ? 'enterprise-input-error' : ''}`,
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return <textarea {...commonProps} rows={4} />;

      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...commonProps}
            checked={!!value}
            onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
          />
        );

      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`enterprise-form ${className}`}>
      <div className="enterprise-form-fields">
        {fields.map((field) => (
          <div key={field.name} className="enterprise-form-field">
            <label htmlFor={field.name} className="enterprise-form-label">
              {field.label}
              {field.required && <span className="enterprise-form-required">*</span>}
            </label>
            {renderField(field)}
            {form.state.errors[field.name] && form.state.touched[field.name] && (
              <div className="enterprise-form-error">
                {form.state.errors[field.name]}
              </div>
            )}
          </div>
        ))}
      </div>

      {children}

      <div className="enterprise-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="enterprise-btn enterprise-btn-secondary"
            disabled={form.state.isSubmitting}
          >
            {cancelButtonText}
          </button>
        )}
        <button
          type="submit"
          className="enterprise-btn enterprise-btn-primary"
          disabled={form.state.isSubmitting || !form.state.isValid}
        >
          {form.state.isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

// Individual form field components for more granular control
export const FormInput: React.FC<{
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ field, value, error, touched, onChange, onBlur }) => {
  return (
    <div className="enterprise-form-field">
      <label htmlFor={field.name} className="enterprise-form-label">
        {field.label}
        {field.required && <span className="enterprise-form-required">*</span>}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`enterprise-input ${error && touched ? 'enterprise-input-error' : ''}`}
        placeholder={field.placeholder}
        required={field.required}
      />
      {error && touched && (
        <div className="enterprise-form-error">{error}</div>
      )}
    </div>
  );
};

export const FormSelect: React.FC<{
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ field, value, error, touched, onChange, onBlur }) => {
  return (
    <div className="enterprise-form-field">
      <label htmlFor={field.name} className="enterprise-form-label">
        {field.label}
        {field.required && <span className="enterprise-form-required">*</span>}
      </label>
      <select
        id={field.name}
        name={field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`enterprise-input ${error && touched ? 'enterprise-input-error' : ''}`}
        required={field.required}
      >
        <option value="">Select {field.label}</option>
        {field.options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && touched && (
        <div className="enterprise-form-error">{error}</div>
      )}
    </div>
  );
};

export const FormTextarea: React.FC<{
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ field, value, error, touched, onChange, onBlur }) => {
  return (
    <div className="enterprise-form-field">
      <label htmlFor={field.name} className="enterprise-form-label">
        {field.label}
        {field.required && <span className="enterprise-form-required">*</span>}
      </label>
      <textarea
        id={field.name}
        name={field.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`enterprise-input ${error && touched ? 'enterprise-input-error' : ''}`}
        placeholder={field.placeholder}
        rows={4}
        required={field.required}
      />
      {error && touched && (
        <div className="enterprise-form-error">{error}</div>
      )}
    </div>
  );
};

export const FormCheckbox: React.FC<{
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}> = ({ field, value, error, touched, onChange, onBlur }) => {
  return (
    <div className="enterprise-form-field enterprise-form-checkbox">
      <label className="enterprise-form-checkbox-label">
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          className={`enterprise-checkbox ${error && touched ? 'enterprise-input-error' : ''}`}
        />
        <span className="enterprise-form-checkbox-text">
          {field.label}
          {field.required && <span className="enterprise-form-required">*</span>}
        </span>
      </label>
      {error && touched && (
        <div className="enterprise-form-error">{error}</div>
      )}
    </div>
  );
};