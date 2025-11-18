/**
 * Input Validation & Sanitization Module
 * Provides comprehensive validation for all document processing operations
 */

const MAX_DOCUMENT_SIZE = parseInt(process.env.MAX_DOCUMENT_SIZE || 52428800); // 50MB default
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_DOCUMENTS || 10);

/**
 * Validates document upload request
 */
function validateDocumentUpload(req) {
  const errors = [];

  // Check file existence
  if (!req.file) {
    errors.push({
      field: 'file',
      message: 'Document file is required'
    });
  } else {
    // Validate file size
    if (req.file.size > MAX_DOCUMENT_SIZE) {
      errors.push({
        field: 'file',
        message: `File size exceeds maximum allowed (${MAX_DOCUMENT_SIZE / 1024 / 1024}MB)`
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      errors.push({
        field: 'file',
        message: `File type not supported. Allowed: PDF, JPEG, PNG, TXT, DOC`
      });
    }
  }

  // Validate document type
  if (!req.body.documentType) {
    errors.push({
      field: 'documentType',
      message: 'Document type is required'
    });
  } else if (!['invoice', 'contract', 'report', 'letter', 'form'].includes(req.body.documentType)) {
    errors.push({
      field: 'documentType',
      message: 'Invalid document type'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates document processing API request
 */
function validateProcessingRequest(body) {
  const errors = [];

  // Required fields
  if (!body.documentType) {
    errors.push({
      field: 'documentType',
      message: 'documentType is required'
    });
  }

  if (!body.content && !body.file) {
    errors.push({
      field: 'content',
      message: 'Either content or file is required'
    });
  }

  // Validate content length
  if (body.content && body.content.length > MAX_DOCUMENT_SIZE) {
    errors.push({
      field: 'content',
      message: 'Content exceeds maximum size'
    });
  }

  // Validate status
  if (body.status && !['pending', 'processing', 'completed', 'failed'].includes(body.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid status value'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates transformation request
 */
function validateTransformation(body) {
  const errors = [];
  const supportedFormats = ['json', 'xml', 'yaml', 'csv', 'markdown', 'html', 'text'];

  if (!body.sourceFormat || !supportedFormats.includes(body.sourceFormat.toLowerCase())) {
    errors.push({
      field: 'sourceFormat',
      message: `sourceFormat must be one of: ${supportedFormats.join(', ')}`
    });
  }

  if (!body.targetFormat || !supportedFormats.includes(body.targetFormat.toLowerCase())) {
    errors.push({
      field: 'targetFormat',
      message: `targetFormat must be one of: ${supportedFormats.join(', ')}`
    });
  }

  if (!body.content) {
    errors.push({
      field: 'content',
      message: 'content is required'
    });
  }

  if (body.sourceFormat === body.targetFormat) {
    errors.push({
      field: 'targetFormat',
      message: 'Source and target formats must be different'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates query parameters
 */
function validateQueryParams(query) {
  const errors = [];
  const { page, limit, sortBy, documentType } = query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push({
      field: 'page',
      message: 'page must be a positive integer'
    });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 1000)) {
    errors.push({
      field: 'limit',
      message: 'limit must be between 1 and 1000'
    });
  }

  if (sortBy && !['timestamp', 'documentType', 'status'].includes(sortBy)) {
    errors.push({
      field: 'sortBy',
      message: 'Invalid sortBy field'
    });
  }

  if (documentType && !['invoice', 'contract', 'report', 'letter', 'form'].includes(documentType)) {
    errors.push({
      field: 'documentType',
      message: 'Invalid document type'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes string input
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove angle brackets
    .replace(/javascript:/gi, '')  // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '')  // Remove event handlers
    .substring(0, 10000);  // Limit length
}

/**
 * Sanitizes object recursively
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return obj;  // Prevent deep recursion
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return sanitizeString(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key], depth + 1);
    }
  }
  return sanitized;
}

/**
 * Validates API key
 */
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  const expectedKey = process.env.API_KEY;
  if (!expectedKey) {
    return { valid: false, error: 'API key not configured' };
  }

  if (apiKey !== expectedKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

/**
 * Validates request headers
 */
function validateHeaders(headers) {
  const errors = [];

  if (!headers['content-type']) {
    errors.push('Content-Type header is required');
  } else if (!headers['content-type'].includes('application/json')) {
    errors.push('Content-Type must be application/json');
  }

  if (process.env.NODE_ENV === 'production' && !headers['authorization']) {
    errors.push('Authorization header is required in production');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates date range
 */
function validateDateRange(startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return { valid: false, error: 'Invalid startDate' };
    }

    if (isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid endDate' };
    }

    if (start >= end) {
      return { valid: false, error: 'startDate must be before endDate' };
    }

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return { valid: false, error: 'Date range cannot exceed 365 days' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Date validation failed: ' + e.message };
  }
}

/**
 * Normalizes filter object
 */
function normalizeFilters(filters) {
  const normalized = {};

  if (filters.documentType) {
    normalized.documentType = filters.documentType.toLowerCase();
  }

  if (filters.status) {
    normalized.status = filters.status.toLowerCase();
  }

  if (filters.startDate && filters.endDate) {
    const dateValidation = validateDateRange(filters.startDate, filters.endDate);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }
    normalized.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  return normalized;
}

module.exports = {
  validateDocumentUpload,
  validateProcessingRequest,
  validateTransformation,
  validateQueryParams,
  sanitizeString,
  sanitizeObject,
  validateApiKey,
  validateHeaders,
  validateDateRange,
  normalizeFilters
};