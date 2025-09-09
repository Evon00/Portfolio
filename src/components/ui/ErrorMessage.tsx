import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export const ErrorMessage = ({ 
  error, 
  onDismiss, 
  className,
  variant = 'destructive'
}: ErrorMessageProps) => {
  const variantClasses = {
    default: 'bg-gray-50 border-gray-200 text-gray-700',
    destructive: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-lg border',
      variantClasses[variant],
      className
    )}>
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{error}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};