/**
 * Risk Trigger Definitions
 *
 * Specific plan language patterns that increase liability exposure.
 * These are the "silent killers" that make structurally complete plans risky.
 */

import type { RiskTriggerDefinition } from '@/lib/contracts/governance-gap.contract';

export const RISK_TRIGGERS: RiskTriggerDefinition[] = [
  {
    id: 'RT-001',
    name: 'Retro/Discretion Posture',
    patterns: [
      'change.*cancel.*any time',
      'sole discretion',
      'not subject to review.*court',
      'company reserves the right',
      'may modify.*at any time',
      'at.* discretion',
    ],
    liabilityImpact: 1,
    description: 'Broad discretionary language increases enforceability risk',
  },

  {
    id: 'RT-002',
    name: 'Earned-After-Deductions',
    patterns: [
      'earned only after',
      'deemed earned.*subtracted',
      'before.*commission is deemed earned',
      'earned.*after.*deduct',
      'commission.*earned.*less',
    ],
    liabilityImpact: 2,
    description: 'Commission contingent on deductions = wage claim risk in CA',
  },

  {
    id: 'RT-003',
    name: 'Recoverable Draw with Termination Repayment',
    patterns: [
      'recoverable draw',
      'pay back.*overdraw',
      'repayment.*termination',
      'overdraw.*death',
      'repay.*draw.*separation',
      'return.*advance',
    ],
    liabilityImpact: 2,
    description: 'Recoverable draw + termination repayment = high state law risk',
  },

  {
    id: 'RT-004',
    name: 'AR Deductions',
    patterns: [
      'AR.*deduct',
      'unpaid invoice.*subtract',
      'accounts receivable.*commission',
      'aging.*deduct',
      'collection.*offset',
    ],
    liabilityImpact: 1,
    description: 'AR deductions from commissions = wage law risk',
  },

  {
    id: 'RT-005',
    name: 'No Dispute Timeline',
    patterns: ['!dispute.*days', '!appeal.*days', '!contest.*within'],
    negativeMatch: true,
    liabilityImpact: 1,
    description: 'Missing dispute timeline = inconsistent handling risk',
  },

  {
    id: 'RT-006',
    name: 'Spiff Employment Requirement',
    patterns: [
      'must be employed.*spiff',
      'employed at.*time.*award',
      'active.*time.*payment',
      'employment.*condition.*bonus',
    ],
    liabilityImpact: 1,
    description: 'Employment requirement for earned incentives = state law risk',
  },

  {
    id: 'RT-007',
    name: 'Territory Reassignment Without Process',
    patterns: [
      'reassign.*territory.*discretion',
      'change.*territory.*business needs',
      'territory.*subject to change',
    ],
    negativeMatch: false,
    liabilityImpact: 1,
    description: 'Unilateral territory changes without governance = credit disputes',
  },

  {
    id: 'RT-008',
    name: 'Undefined "Manageable Expenses"',
    patterns: [
      'other.*expenses',
      'manageable expenses',
      'miscellaneous.*deduct',
      'such other.*expenses',
    ],
    liabilityImpact: 1,
    description: 'Vague expense deductions = dispute fuel',
  },

  {
    id: 'RT-009',
    name: 'Sales Crediting by Management Determination',
    patterns: [
      'as determined by management',
      'manager.*discretion.*credit',
      'company.*determine.*credit',
    ],
    liabilityImpact: 1,
    description: 'Subjective crediting criteria = disputes and fairness concerns',
  },

  {
    id: 'RT-010',
    name: 'No Cap or Threshold Defined',
    patterns: [
      '!maximum.*commission',
      '!cap',
      '!ceiling',
      '!threshold.*approval',
    ],
    negativeMatch: true,
    liabilityImpact: 1,
    description: 'No caps = windfall exposure and budget unpredictability',
  },
];

/**
 * Jurisdiction multipliers for liability scoring
 */
export const JURISDICTION_MULTIPLIERS: Record<
  string,
  { multiplier: number; wageLawFlags: string[] }
> = {
  CA: {
    multiplier: 1.5,
    wageLawFlags: [
      'final_pay_immediate',
      'written_agreement_required',
      'deduction_consent_strict',
      'earned_on_close_not_payment',
      'clawback_limits',
    ],
  },
  NY: {
    multiplier: 1.2,
    wageLawFlags: ['final_pay_next_payday', 'deduction_consent_required'],
  },
  DEFAULT: {
    multiplier: 1.0,
    wageLawFlags: [],
  },
};

/**
 * Get jurisdiction multiplier
 */
export function getJurisdictionMultiplier(jurisdiction: string): number {
  return JURISDICTION_MULTIPLIERS[jurisdiction]?.multiplier || 1.0;
}

/**
 * Get wage law flags for jurisdiction
 */
export function getWageLawFlags(jurisdiction: string): string[] {
  return JURISDICTION_MULTIPLIERS[jurisdiction]?.wageLawFlags || [];
}
