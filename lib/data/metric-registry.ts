/**
 * Metric Registry - Rotating Dashboard Metrics
 * Each group contains multiple metrics that cycle on click
 */

import { OperationalMode } from '@/types/operational-mode';

export type MetricStatus = 'normal' | 'warning' | 'critical';

export interface Metric {
  id: string;
  label: string;
  value: number | string;
  suffix?: string;
  description: string;
  status: MetricStatus;
  fetchKey: string; // Key to identify what API data to use
}

export interface MetricGroup {
  id: string;
  name: string;
  icon: string; // Radix icon name
  color: string; // Tailwind color class base (e.g., 'blue')
  mode: OperationalMode; // Which operational mode this metric belongs to
  metrics: Metric[];
}

export const METRIC_GROUPS: MetricGroup[] = [
  {
    id: 'documents',
    name: 'Documents',
    icon: 'FileTextIcon',
    color: 'blue', // OPERATE mode - Blue
    mode: OperationalMode.OPERATE,
    metrics: [
      {
        id: 'total-documents',
        label: 'Documents',
        value: 0,
        description: 'Total governance documents',
        status: 'normal',
        fetchKey: 'totalDocuments',
      },
      {
        id: 'pending-review',
        label: 'Pending Review',
        value: 0,
        description: 'Documents awaiting review',
        status: 'normal',
        fetchKey: 'pendingReview',
      },
      {
        id: 'expiring-soon',
        label: 'Expiring Soon',
        value: 0,
        description: 'Expire in next 30 days',
        status: 'warning',
        fetchKey: 'expiringSoon',
      },
      {
        id: 'recent-updates',
        label: 'Recent Updates',
        value: 0,
        description: 'Updated in last 7 days',
        status: 'normal',
        fetchKey: 'recentUpdates',
      },
      {
        id: 'needs-legal-review',
        label: 'Legal Review',
        value: 0,
        description: 'Awaiting legal review',
        status: 'normal',
        fetchKey: 'needsLegalReview',
      },
    ],
  },
  {
    id: 'approvals',
    name: 'Approvals',
    icon: 'CheckCircledIcon',
    color: 'blue', // OPERATE mode - Blue
    mode: OperationalMode.OPERATE,
    metrics: [
      {
        id: 'pending-approvals',
        label: 'Pending Approvals',
        value: 0,
        description: 'Awaiting review',
        status: 'normal',
        fetchKey: 'pendingApprovals',
      },
      {
        id: 'overdue-approvals',
        label: 'Overdue',
        value: 0,
        description: 'Past SLA deadline',
        status: 'critical',
        fetchKey: 'overdueApprovals',
      },
      {
        id: 'sla-compliance',
        label: 'SLA Compliance',
        value: 0,
        suffix: '%',
        description: 'On-time approval rate',
        status: 'normal',
        fetchKey: 'slaCompliance',
      },
      {
        id: 'avg-approval-time',
        label: 'Avg Time',
        value: 0,
        suffix: 'd',
        description: 'Average approval time',
        status: 'normal',
        fetchKey: 'avgApprovalTime',
      },
      {
        id: 'completed-this-month',
        label: 'This Month',
        value: 0,
        description: 'Approvals completed',
        status: 'normal',
        fetchKey: 'completedThisMonth',
      },
    ],
  },
  {
    id: 'cases',
    name: 'Cases',
    icon: 'ExclamationTriangleIcon',
    color: 'indigo', // DISPUTE mode - Indigo
    mode: OperationalMode.DISPUTE,
    metrics: [
      {
        id: 'active-cases',
        label: 'Active Cases',
        value: 0,
        description: 'Disputes & exceptions',
        status: 'normal',
        fetchKey: 'activeCases',
      },
      {
        id: 'high-priority',
        label: 'High Priority',
        value: 0,
        description: 'Urgent cases',
        status: 'critical',
        fetchKey: 'highPriorityCases',
      },
      {
        id: 'approaching-sla',
        label: 'Approaching SLA',
        value: 0,
        description: 'Due within 48 hours',
        status: 'warning',
        fetchKey: 'approachingSLA',
      },
      {
        id: 'avg-resolution',
        label: 'Avg Resolution',
        value: 0,
        suffix: 'd',
        description: 'Days to resolve',
        status: 'normal',
        fetchKey: 'avgResolution',
      },
      {
        id: 'exception-requests',
        label: 'Exception Requests',
        value: 0,
        description: 'Pending exceptions',
        status: 'normal',
        fetchKey: 'exceptionRequests',
      },
    ],
  },
  {
    id: 'policies',
    name: 'Policies',
    icon: 'ArchiveIcon',
    color: 'cyan', // DESIGN mode - Cyan
    mode: OperationalMode.DESIGN,
    metrics: [
      {
        id: 'active-policies',
        label: 'Active Policies',
        value: 0,
        description: 'Effective now',
        status: 'normal',
        fetchKey: 'activePolicies',
      },
      {
        id: 'needs-review',
        label: 'Needs Review',
        value: 0,
        description: 'Review cycle due',
        status: 'warning',
        fetchKey: 'needsReview',
      },
      {
        id: 'compliance-score',
        label: 'Compliance',
        value: 0,
        suffix: '%',
        description: 'Overall compliance',
        status: 'normal',
        fetchKey: 'complianceScore',
      },
      {
        id: 'updated-this-quarter',
        label: 'This Quarter',
        value: 0,
        description: 'Policy updates',
        status: 'normal',
        fetchKey: 'updatedThisQuarter',
      },
      {
        id: 'audit-findings',
        label: 'Audit Findings',
        value: 0,
        description: 'Open findings',
        status: 'normal',
        fetchKey: 'auditFindings',
      },
    ],
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: 'AvatarIcon',
    color: 'purple', // OVERSEE mode - Violet/Purple
    mode: OperationalMode.OVERSEE,
    metrics: [
      {
        id: 'committees',
        label: 'Committees',
        value: 2,
        description: 'SGCC, CRB',
        status: 'normal',
        fetchKey: 'committees',
      },
      {
        id: 'upcoming-meetings',
        label: 'Upcoming Meetings',
        value: 0,
        description: 'Next 30 days',
        status: 'normal',
        fetchKey: 'upcomingMeetings',
      },
      {
        id: 'decisions-this-month',
        label: 'Decisions',
        value: 0,
        description: 'Made this month',
        status: 'normal',
        fetchKey: 'decisionsThisMonth',
      },
      {
        id: 'active-members',
        label: 'Active Members',
        value: 0,
        description: 'Committee members',
        status: 'normal',
        fetchKey: 'activeMembers',
      },
      {
        id: 'activity-score',
        label: 'Activity Score',
        value: 0,
        suffix: '%',
        description: 'System engagement',
        status: 'normal',
        fetchKey: 'activityScore',
      },
    ],
  },
];

/**
 * Status color mappings for visual indicators
 */
export const STATUS_COLORS = {
  normal: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    glow: '',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    glow: 'shadow-yellow-200',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-900',
    glow: 'shadow-red-300 shadow-lg',
  },
};

/**
 * Get color classes for a metric group
 */
export function getGroupColors(color: string) {
  const colorMap: Record<string, any> = {
    blue: {
      icon: 'text-blue-500',
      value: 'text-blue-600',
      hover: 'hover:border-blue-300',
      gradient: 'from-blue-500 to-blue-600',
    },
    orange: {
      icon: 'text-orange-500',
      value: 'text-orange-600',
      hover: 'hover:border-orange-300',
      gradient: 'from-orange-500 to-orange-600',
    },
    pink: {
      icon: 'text-pink-500',
      value: 'text-pink-600',
      hover: 'hover:border-pink-300',
      gradient: 'from-pink-500 to-pink-600',
    },
    green: {
      icon: 'text-green-500',
      value: 'text-green-600',
      hover: 'hover:border-green-300',
      gradient: 'from-green-500 to-green-600',
    },
    purple: {
      icon: 'text-purple-500',
      value: 'text-purple-600',
      hover: 'hover:border-purple-300',
      gradient: 'from-purple-500 to-purple-600',
    },
  };

  return colorMap[color] || colorMap.blue;
}

/**
 * Get metric groups for a specific operational mode
 */
export function getMetricGroupsByMode(mode: OperationalMode): MetricGroup[] {
  return METRIC_GROUPS.filter((group) => group.mode === mode);
}
