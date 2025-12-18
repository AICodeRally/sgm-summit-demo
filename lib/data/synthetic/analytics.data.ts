/**
 * Analytics & Metrics Data
 * Governance health tracking and KPIs
 */

export interface MetricData {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryMetric {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Key Performance Indicators
 */
export const GOVERNANCE_KPIS: MetricData[] = [
  {
    label: 'SLA Compliance Rate',
    value: 94,
    unit: '%',
    trend: 'up',
    trendValue: 3,
    status: 'good',
  },
  {
    label: 'Avg Approval Time',
    value: 8.5,
    unit: 'days',
    trend: 'down',
    trendValue: 12,
    status: 'good',
  },
  {
    label: 'Case Resolution Time',
    value: 11.2,
    unit: 'days',
    trend: 'down',
    trendValue: 8,
    status: 'good',
  },
  {
    label: 'Policy Coverage',
    value: 90,
    unit: '%',
    trend: 'neutral',
    trendValue: 0,
    status: 'warning',
  },
  {
    label: 'Active Cases',
    value: 4,
    unit: 'cases',
    trend: 'down',
    trendValue: 20,
    status: 'good',
  },
  {
    label: 'Pending Approvals',
    value: 3,
    unit: 'items',
    trend: 'up',
    trendValue: 50,
    status: 'warning',
  },
  {
    label: 'Committee Meetings',
    value: 12,
    unit: 'YTD',
    trend: 'up',
    trendValue: 20,
    status: 'good',
  },
  {
    label: 'Document Updates',
    value: 18,
    unit: 'this month',
    trend: 'up',
    trendValue: 28,
    status: 'good',
  },
];

/**
 * Approval velocity trend (last 6 months)
 */
export const APPROVAL_VELOCITY_TREND: TrendDataPoint[] = [
  { date: '2025-07', value: 12, label: 'Jul' },
  { date: '2025-08', value: 15, label: 'Aug' },
  { date: '2025-09', value: 18, label: 'Sep' },
  { date: '2025-10', value: 14, label: 'Oct' },
  { date: '2025-11', value: 22, label: 'Nov' },
  { date: '2025-12', value: 19, label: 'Dec' },
];

/**
 * Case volume by type
 */
export const CASE_VOLUME_BY_TYPE: CategoryMetric[] = [
  { category: 'Exceptions', count: 12, percentage: 35, color: '#f59e0b' },
  { category: 'Disputes', count: 8, percentage: 24, color: '#ec4899' },
  { category: 'Territory Changes', count: 7, percentage: 21, color: '#8b5cf6' },
  { category: 'Quota Adjustments', count: 5, percentage: 15, color: '#3b82f6' },
  { category: 'Plan Modifications', count: 2, percentage: 5, color: '#10b981' },
];

/**
 * SLA compliance by module
 */
export const SLA_COMPLIANCE_BY_MODULE: CategoryMetric[] = [
  { category: 'Approvals', count: 32, percentage: 97, color: '#f97316' },
  { category: 'Cases', count: 28, percentage: 93, color: '#ec4899' },
  { category: 'Document Reviews', count: 45, percentage: 95, color: '#3b82f6' },
  { category: 'Windfall Decisions', count: 8, percentage: 88, color: '#8b5cf6' },
];

/**
 * Approval throughput trend (last 30 days)
 */
export const APPROVAL_THROUGHPUT_TREND: TrendDataPoint[] = [
  { date: '2025-11-18', value: 2 },
  { date: '2025-11-19', value: 1 },
  { date: '2025-11-20', value: 3 },
  { date: '2025-11-21', value: 1 },
  { date: '2025-11-22', value: 4 },
  { date: '2025-11-25', value: 2 },
  { date: '2025-11-26', value: 1 },
  { date: '2025-11-27', value: 2 },
  { date: '2025-11-28', value: 1 },
  { date: '2025-11-29', value: 3 },
  { date: '2025-12-02', value: 2 },
  { date: '2025-12-03', value: 1 },
  { date: '2025-12-04', value: 2 },
  { date: '2025-12-05', value: 3 },
  { date: '2025-12-06', value: 1 },
  { date: '2025-12-09', value: 4 },
  { date: '2025-12-10', value: 2 },
  { date: '2025-12-11', value: 3 },
  { date: '2025-12-12', value: 2 },
  { date: '2025-12-13', value: 1 },
  { date: '2025-12-16', value: 2 },
  { date: '2025-12-17', value: 3 },
  { date: '2025-12-18', value: 1 },
];

/**
 * Risk distribution
 */
export const RISK_DISTRIBUTION: CategoryMetric[] = [
  { category: 'Critical', count: 6, percentage: 15, color: '#dc2626' },
  { category: 'High', count: 12, percentage: 30, color: '#f97316' },
  { category: 'Medium', count: 14, percentage: 35, color: '#eab308' },
  { category: 'Low', count: 8, percentage: 20, color: '#6b7280' },
];

/**
 * Committee activity (decisions per month)
 */
export const COMMITTEE_ACTIVITY: TrendDataPoint[] = [
  { date: '2025-07', value: 8, label: 'Jul' },
  { date: '2025-08', value: 12, label: 'Aug' },
  { date: '2025-09', value: 15, label: 'Sep' },
  { date: '2025-10', value: 11, label: 'Oct' },
  { date: '2025-11', value: 18, label: 'Nov' },
  { date: '2025-12', value: 14, label: 'Dec' },
];

/**
 * Policy coverage health
 */
export const POLICY_COVERAGE_HEALTH = {
  total: 20,
  fullCoverage: 18,
  partialCoverage: 0,
  gaps: 2,
  coveragePercentage: 90,
  criticalGaps: 0,
  highPriorityGaps: 2,
};

/**
 * Approval decision breakdown
 */
export const APPROVAL_DECISIONS: CategoryMetric[] = [
  { category: 'Approved', count: 52, percentage: 74, color: '#10b981' },
  { category: 'Approved with Conditions', count: 12, percentage: 17, color: '#eab308' },
  { category: 'Rejected', count: 4, percentage: 6, color: '#dc2626' },
  { category: 'Needs More Info', count: 2, percentage: 3, color: '#6b7280' },
];

/**
 * Top performers (most active approvers/reviewers)
 */
export const TOP_PERFORMERS = [
  { name: 'Sarah Chen', role: 'VP Sales Compensation', decisions: 28, avgDays: 6.2 },
  { name: 'Amanda Foster', role: 'VP Sales Operations', decisions: 24, avgDays: 7.5 },
  { name: 'Michael Rodriguez', role: 'CFO', decisions: 18, avgDays: 8.1 },
  { name: 'Patricia Garcia', role: 'Director of Finance', decisions: 16, avgDays: 5.8 },
  { name: 'Lisa Park', role: 'Sales Compensation Manager', decisions: 14, avgDays: 4.2 },
];

/**
 * Recent highlights (noteworthy events)
 */
export const RECENT_HIGHLIGHTS = [
  {
    id: 'h1',
    date: '2025-12-17',
    title: 'SLA Compliance Improved',
    description: 'Approval SLA compliance reached 97%, up 3% from last month',
    type: 'success',
  },
  {
    id: 'h2',
    date: '2025-12-15',
    title: 'Policy Coverage Gap Identified',
    description: 'ARR Recognition policy gap flagged in governance matrix review',
    type: 'warning',
  },
  {
    id: 'h3',
    date: '2025-12-12',
    title: 'Large Windfall Approved',
    description: 'CRB approved $2.5M deal with commission cap at $180K',
    type: 'info',
  },
  {
    id: 'h4',
    date: '2025-12-09',
    title: 'Committee Meeting Completed',
    description: 'SGCC Q4 meeting: 4 policies approved, 1 tabled for revision',
    type: 'info',
  },
];
