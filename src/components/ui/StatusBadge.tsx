import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'ongoing';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    active: {
      label: 'Active',
      classes: 'bg-green-100 text-green-800'
    },
    inactive: {
      label: 'Inactive',
      classes: 'bg-gray-100 text-gray-800'
    },
    pending: {
      label: 'Pending',
      classes: 'bg-yellow-100 text-yellow-800'
    },
    completed: {
      label: 'Completed',
      classes: 'bg-blue-100 text-blue-800'
    },
    ongoing: {
      label: 'Ongoing',
      classes: 'bg-purple-100 text-purple-800'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.classes,
      className
    )}>
      {config.label}
    </span>
  );
};