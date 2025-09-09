import { ReactNode, FormEvent } from 'react';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FormWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  showActions?: boolean;
}

export const FormWrapper = ({
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  error,
  submitText = 'Save',
  cancelText = 'Cancel',
  onCancel,
  className,
  showActions = true
}: FormWrapperProps) => {
  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} />
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            {children}
          </div>
          
          {showActions && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-end space-x-4">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading && <LoadingSpinner size="sm" />}
                  <span>{submitText}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};