import { A11Y_CONSTANTS, THEME_CONSTANTS, INTERACTION_CONSTANTS } from '@/constants/ui';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  showRetryButton = true,
  className = '',
  icon,
}) => {
  const defaultIcon = <div className="text-red-500 text-4xl mb-4">⚠️</div>;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`text-center ${className}`} role="alert" aria-live="polite">
      {icon || defaultIcon}
      <p 
        className="linear-text-regular text-red-500 mb-4"
        style={{ color: 'var(--color-error, #ef4444)' }}
      >
        {error}
      </p>
      {showRetryButton && (
        <button 
          onClick={handleRetry}
          className={INTERACTION_CONSTANTS.BUTTON_PRIMARY}
          aria-label={A11Y_CONSTANTS.RETRY_LABEL}
          type="button"
        >
          {A11Y_CONSTANTS.RETRY_LABEL}
        </button>
      )}
    </div>
  );
};