export interface ValidationRule<T = any> {
  test: (value: T) => boolean;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  required?: boolean;
}

export interface ValidationSchema {
  [fieldName: string]: FieldValidation;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const createRule = <T>(test: (value: T) => boolean, message: string): ValidationRule<T> => ({
  test,
  message
});

export const required = (message = 'This field is required'): ValidationRule => 
  createRule((value) => value !== undefined && value !== null && value !== '', message);

export const minLength = (length: number, message?: string): ValidationRule<string> =>
  createRule(
    (value) => typeof value === 'string' && value.length >= length,
    message || `Must be at least ${length} characters long`
  );

export const maxLength = (length: number, message?: string): ValidationRule<string> =>
  createRule(
    (value) => typeof value === 'string' && value.length <= length,
    message || `Must be no more than ${length} characters long`
  );

export const email = (message = 'Must be a valid email address'): ValidationRule<string> =>
  createRule(
    (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  );

export const url = (message = 'Must be a valid URL'): ValidationRule<string> =>
  createRule(
    (value) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  );

export const pattern = (regex: RegExp, message: string): ValidationRule<string> =>
  createRule(
    (value) => typeof value === 'string' && regex.test(value),
    message
  );

export const validateField = (value: any, validation: FieldValidation): string | null => {
  if (validation.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }

  if (!validation.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  for (const rule of validation.rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [fieldName, validation] of Object.entries(schema)) {
    const fieldError = validateField(data[fieldName], validation);
    if (fieldError) {
      errors[fieldName] = fieldError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};