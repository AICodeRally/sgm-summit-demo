import {
  FileTextIcon,
  ClockIcon,
  EyeOpenIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  RocketIcon,
  ArchiveIcon,
} from '@radix-ui/react-icons';

interface PlanStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function PlanStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: PlanStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          icon: FileTextIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          icon: ClockIcon,
          className: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          icon: EyeOpenIcon,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
      case 'PENDING_APPROVAL':
        return {
          label: 'Pending Approval',
          icon: ClockIcon,
          className: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          icon: CheckCircledIcon,
          className: 'bg-green-100 text-green-800 border-green-300',
        };
      case 'PUBLISHED':
        return {
          label: 'Published',
          icon: RocketIcon,
          className: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'SUPERSEDED':
        return {
          label: 'Superseded',
          icon: CrossCircledIcon,
          className: 'bg-gray-100 text-gray-600 border-gray-300',
        };
      case 'ARCHIVED':
        return {
          label: 'Archived',
          icon: ArchiveIcon,
          className: 'bg-gray-100 text-gray-600 border-gray-300',
        };
      default:
        return {
          label: status,
          icon: FileTextIcon,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.className} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
