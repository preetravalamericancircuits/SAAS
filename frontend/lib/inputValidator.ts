export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InputValidator {
  // Regex patterns for validation
  private static readonly USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;
  private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  private static readonly ROLE_NAME_PATTERN = /^[a-zA-Z0-9_\s-]{2,50}$/;

  // Dangerous patterns to detect
  private static readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
  ];

  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b.*=.*\bOR\b)/gi,
    /(\bAND\b.*=.*\bAND\b)/gi,
  ];

  static sanitizeString(value: string, maxLength: number = 255): string {
    if (typeof value !== 'string') {
      return String(value);
    }

    // Trim whitespace
    value = value.trim();

    // Limit length
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }

    // Remove XSS patterns
    this.XSS_PATTERNS.forEach(pattern => {
      value = value.replace(pattern, '');
    });

    // Remove SQL injection patterns
    this.SQL_INJECTION_PATTERNS.forEach(pattern => {
      value = value.replace(pattern, '');
    });

    // HTML encode special characters
    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return value;
  }

  static validateUsername(username: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(username, 50);

    if (!sanitized) {
      errors.push('Username is required');
    } else if (!this.USERNAME_PATTERN.test(sanitized)) {
      errors.push('Username must be 3-50 characters, alphanumeric, underscore, or dash only');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(email, 255).toLowerCase();

    if (!sanitized) {
      errors.push('Email is required');
    } else if (!this.EMAIL_PATTERN.test(sanitized)) {
      errors.push('Invalid email format');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (password.length > 128) {
        errors.push('Password too long');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letter');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain number');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateRoleName(roleName: string): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(roleName, 50);

    if (!sanitized) {
      errors.push('Role name is required');
    } else if (!this.ROLE_NAME_PATTERN.test(sanitized)) {
      errors.push('Role name must be 2-50 characters, alphanumeric, spaces, underscore, or dash only');
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.push(`${fieldName} is required`);
    }

    return { isValid: errors.length === 0, errors };
  }

  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeFormData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static validateForm(data: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(rules)) {
      const result = validator(data[field]);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}