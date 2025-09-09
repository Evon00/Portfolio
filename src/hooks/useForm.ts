import { useState, useCallback, ChangeEvent } from 'react';
import { ValidationSchema, validateForm, ValidationResult } from '@/utils/validation';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit: (values: T) => Promise<void> | void;
  validateOn?: 'change' | 'blur' | 'submit';
}

interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | null) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOn = 'submit'
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T) => {
    if (!validationSchema || !validationSchema[field as string]) {
      return;
    }

    const fieldValidation = validationSchema[field as string];
    const fieldValue = values[field];
    
    let error: string | null = null;
    if (fieldValidation.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      error = 'This field is required';
    } else if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      for (const rule of fieldValidation.rules) {
        if (!rule.test(fieldValue)) {
          error = rule.message;
          break;
        }
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validationSchema]);

  const validateFormFields = useCallback((): boolean => {
    if (!validationSchema) return true;

    const validationResult = validateForm(values, validationSchema);
    
    const formattedErrors = {} as Record<keyof T, string | null>;
    Object.keys(initialValues).forEach(key => {
      formattedErrors[key as keyof T] = validationResult.errors[key] || null;
    });
    
    setErrors(formattedErrors);
    return validationResult.isValid;
  }, [values, validationSchema, initialValues]);

  const handleChange = useCallback((field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOn === 'change') {
      setTimeout(() => validateField(field), 0);
    }
  }, [validateOn, validateField]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validateOn === 'blur' || validateOn === 'change') {
      validateField(field);
    }
  }, [validateOn, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    Object.keys(initialValues).forEach(key => {
      setTouched(prev => ({ ...prev, [key as keyof T]: true }));
    });

    const isValid = validateFormFields();
    
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validateFormFields, initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.values(errors).every(error => error === null);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm: validateFormFields
  };
};