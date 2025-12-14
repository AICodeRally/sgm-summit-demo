import type { Territory } from '@/lib/contracts/territory.contract';

/**
 * Synthetic Territory Data
 *
 * Hierarchical territory structure for demo purposes.
 */

const tenantId = 'demo-tenant-001';
const now = new Date();
const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

export const syntheticTerritories: Territory[] = [
  // Root: Americas
  {
    id: 'terr-001',
    tenantId,
    code: 'AMER',
    name: 'Americas',
    type: 'geographic',
    status: 'active',
    level: 0,
    path: '/1',
    assignedToUserId: 'user-vp-001',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      countries: ['US', 'CA', 'MX', 'BR'],
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // Americas > US
  {
    id: 'terr-002',
    tenantId,
    code: 'US',
    name: 'United States',
    type: 'geographic',
    status: 'active',
    parentTerritoryId: 'terr-001',
    level: 1,
    path: '/1/2',
    coverageRules: {
      countries: ['US'],
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // US > West
  {
    id: 'terr-003',
    tenantId,
    code: 'US-WEST',
    name: 'US West',
    type: 'geographic',
    status: 'active',
    parentTerritoryId: 'terr-002',
    level: 2,
    path: '/1/2/3',
    assignedToUserId: 'user-rep-001',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      countries: ['US'],
      states: ['CA', 'OR', 'WA', 'NV', 'AZ'],
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // US > East
  {
    id: 'terr-004',
    tenantId,
    code: 'US-EAST',
    name: 'US East',
    type: 'geographic',
    status: 'active',
    parentTerritoryId: 'terr-002',
    level: 2,
    path: '/1/2/4',
    assignedToUserId: 'user-rep-002',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      countries: ['US'],
      states: ['NY', 'MA', 'PA', 'NJ', 'VA', 'NC', 'FL'],
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // US > Central
  {
    id: 'terr-005',
    tenantId,
    code: 'US-CENTRAL',
    name: 'US Central',
    type: 'geographic',
    status: 'active',
    parentTerritoryId: 'terr-002',
    level: 2,
    path: '/1/2/5',
    assignedToUserId: 'user-rep-003',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      countries: ['US'],
      states: ['TX', 'IL', 'OH', 'MI', 'CO'],
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // Named Account: Enterprise Tech Companies
  {
    id: 'terr-006',
    tenantId,
    code: 'ENT-TECH',
    name: 'Enterprise Technology Accounts',
    type: 'named',
    status: 'active',
    level: 0,
    path: '/6',
    assignedToUserId: 'user-rep-004',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      accountIds: ['acc-001', 'acc-002', 'acc-003'],
      industryVerticals: ['Technology'],
      revenueMin: 1000000000,
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
    metadata: {
      accountCount: 3,
      namedAccounts: true,
    },
  },

  // Industry Vertical: Healthcare
  {
    id: 'terr-007',
    tenantId,
    code: 'IND-HEALTH',
    name: 'Healthcare Vertical',
    type: 'industry',
    status: 'active',
    level: 0,
    path: '/7',
    assignedToUserId: 'user-rep-005',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      industryVerticals: ['Healthcare', 'Pharmaceuticals'],
      revenueMin: 50000000,
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
    metadata: {
      specialization: 'Healthcare vertical specialist',
    },
  },

  // Industry Vertical: Financial Services
  {
    id: 'terr-008',
    tenantId,
    code: 'IND-FINSERV',
    name: 'Financial Services Vertical',
    type: 'industry',
    status: 'active',
    level: 0,
    path: '/8',
    assignedToUserId: 'user-rep-006',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      industryVerticals: ['Financial Services', 'Banking', 'Insurance'],
      revenueMin: 100000000,
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
  },

  // SMB Territory
  {
    id: 'terr-009',
    tenantId,
    code: 'SMB-US',
    name: 'SMB United States',
    type: 'account',
    status: 'active',
    level: 0,
    path: '/9',
    assignedToUserId: 'user-rep-007',
    assignedAt: threeMonthsAgo,
    coverageRules: {
      countries: ['US'],
      revenueMin: 1000000,
      revenueMax: 50000000,
      employeeCountMin: 10,
      employeeCountMax: 500,
    },
    effectiveDate: threeMonthsAgo,
    createdBy: 'user-admin-001',
    createdAt: threeMonthsAgo,
    metadata: {
      segment: 'SMB',
    },
  },

  // Inactive Territory (for testing)
  {
    id: 'terr-010',
    tenantId,
    code: 'US-SOUTH-OLD',
    name: 'US South (Old)',
    type: 'geographic',
    status: 'inactive',
    parentTerritoryId: 'terr-002',
    level: 2,
    path: '/1/2/10',
    coverageRules: {
      countries: ['US'],
      states: ['GA', 'AL', 'TN', 'LA'],
    },
    effectiveDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    expirationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    createdBy: 'user-admin-001',
    createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    updatedBy: 'user-admin-001',
    updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    metadata: {
      replacedBy: 'terr-005',
    },
  },
];
