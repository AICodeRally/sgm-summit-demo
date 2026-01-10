/**
 * Requirement Matrix
 *
 * Machine-readable policy requirements with detection rules and scoring rubrics.
 * Maps each policy to atomic requirements that can be programmatically verified.
 */

import type { RequirementMatrixEntry } from '@/lib/contracts/governance-gap.contract';

export const REQUIREMENT_MATRIX: RequirementMatrixEntry[] = [
  {
    policyCode: 'SCP-001',
    policyName: 'Clawback and Recovery Policy',
    category: 'Financial Controls',
    requirements: [
      {
        id: 'R-001-01',
        name: 'Revenue Reversal Clawback',
        description: 'Plan must address clawback for cancelled/reversed transactions',
        severity: 'HIGH',
        detection: {
          positivePatterns: [
            'chargeback',
            'clawback',
            'recovery',
            'reversal',
            'cancellation.*commission',
          ],
          negativePatterns: ['no clawback', 'non-recoverable'],
          requiredElements: {
            triggeringEvents: ['cancellation', 'return', 'reversal', 'adjustment'],
            threshold: '$50K or any amount',
            timing: 'within X days/months',
          },
        },
        scoring: {
          A: 'Has explicit clawback with triggers, thresholds, and timing',
          B: 'Mentions adjustments/chargebacks but no formal clawback framework',
          C: 'Silent on recovery of overpayments',
        },
        insertionPoint: 'Section: When is Commission Earned OR new Section 20',
        status: 'UNMET',
      },
      {
        id: 'R-001-02',
        name: 'Approval Authority',
        description: 'Clawback amounts require tiered approval',
        severity: 'MEDIUM',
        detection: {
          requiredElements: {
            approvalTiers: ['$5K', '$25K', '$50K+'],
            approvalRoles: ['Manager', 'Director', 'VP', 'CRB'],
          },
        },
        scoring: {
          A: 'Explicit approval matrix by dollar threshold',
          B: 'Mentions management approval, no tiers',
          C: 'No approval requirement stated',
        },
        insertionPoint: 'Within clawback section',
        status: 'UNMET',
      },
      {
        id: 'R-001-03',
        name: 'Recovery Mechanism',
        description: 'Method of recovering overpaid commissions',
        severity: 'HIGH',
        detection: {
          positivePatterns: ['payroll deduction', 'offset.*future', 'repayment'],
          requiredElements: {
            maxDeductionRate: '25% of net variable comp',
            noticePeriod: '60 days advance',
          },
        },
        scoring: {
          A: 'Explicit recovery method with limits and notice',
          B: "Says 'company may deduct' without limits",
          C: 'No recovery mechanism defined',
        },
        insertionPoint: 'Section: Draw Payments or new Recovery section',
        status: 'UNMET',
      },
      {
        id: 'R-001-04',
        name: 'Appeals Process',
        description: 'Employee right to dispute clawback',
        severity: 'MEDIUM',
        detection: {
          positivePatterns: ['appeal', 'dispute.*clawback', 'contest.*recovery'],
          requiredElements: {
            timeline: '30 days to appeal',
            reviewBody: 'defined',
          },
        },
        scoring: {
          A: 'Formal appeals process with timeline and review body',
          B: 'General dispute language exists, not specific to clawback',
          C: 'No appeals right for clawbacks',
        },
        insertionPoint: 'Within clawback section',
        status: 'UNMET',
      },
    ],
  },

  {
    policyCode: 'SCP-002',
    policyName: 'Quota Management Policy',
    category: 'Performance Management',
    requirements: [
      {
        id: 'R-002-01',
        name: 'Quota Setting Methodology',
        description: 'Documented approach to setting quotas',
        severity: 'MEDIUM',
        detection: {
          positivePatterns: [
            'quota.*methodology',
            'territory potential',
            'historical performance',
          ],
          requiredElements: {
            factors: ['historical', 'territory potential', 'strategic', 'resources'],
            weights: 'defined percentages',
          },
        },
        scoring: {
          A: 'Multi-factor methodology with weights documented',
          B: 'Quotas mentioned but methodology not explained',
          C: 'Quotas assigned without methodology disclosure',
        },
        insertionPoint: 'New Section: Quota Methodology',
        status: 'UNMET',
      },
      {
        id: 'R-002-02',
        name: 'Mid-Year Adjustment Governance',
        description: 'Approval thresholds for quota changes',
        severity: 'HIGH',
        detection: {
          positivePatterns: ['quota.*change', 'adjustment.*approval'],
          negativePatterns: ['subject to change at any time', 'sole discretion'],
          requiredElements: {
            approvalTiers: ['<10%: Manager', '10-25%: Director', '>25%: VP/CRB'],
            qualifyingTriggers: 'defined list',
            nonQualifying: 'performance-based not allowed',
          },
        },
        scoring: {
          A: 'Approval tiers with thresholds and qualifying triggers',
          B: 'Mentions changes possible, no governance',
          C: "Silent OR says 'change anytime at sole discretion'",
        },
        insertionPoint: 'Section: Modifications to Plan',
        status: 'UNMET',
      },
      {
        id: 'R-002-03',
        name: 'Territory Change Quota Treatment',
        description: 'How quota adjusts when territory changes',
        severity: 'MEDIUM',
        detection: {
          requiredElements: {
            additionTreatment: 'defined',
            reductionTreatment: 'defined',
            inFlightDeals: 'defined',
          },
        },
        scoring: {
          A: 'Explicit quota adjustment rules for territory changes',
          B: 'Territory changes mentioned, no quota impact defined',
          C: 'Silent on quota impact of territory changes',
        },
        insertionPoint: 'Section: Territory Management',
        status: 'UNMET',
      },
    ],
  },

  {
    policyCode: 'SCP-003',
    policyName: 'Windfall and Large Deal Policy',
    category: 'Deal Governance',
    requirements: [
      {
        id: 'R-003-01',
        name: 'Windfall Triggers',
        description: 'Definition of what constitutes a windfall',
        severity: 'HIGH',
        detection: {
          requiredElements: {
            transactionThreshold: '$1M+ contract value',
            commissionThreshold: '$100K+ commission',
            quotaThreshold: '>50% of annual quota',
          },
        },
        scoring: {
          A: 'Explicit windfall criteria defined',
          B: 'Large deal mentioned, no quantified triggers',
          C: 'No windfall definition',
        },
        insertionPoint: 'New Section: Large Deal Governance',
        status: 'UNMET',
      },
      {
        id: 'R-003-02',
        name: 'CRB Review Requirement',
        description: 'Review body oversight of windfall deals',
        severity: 'HIGH',
        detection: {
          positivePatterns: [
            'CRB',
            'Compensation Review Board',
            'executive review',
            'special approval',
          ],
        },
        scoring: {
          A: 'CRB review required with timeline and documentation',
          B: 'Management discretion mentioned, no formal review',
          C: 'No review requirement for large deals',
        },
        insertionPoint: 'Within windfall section',
        status: 'UNMET',
      },
      {
        id: 'R-003-03',
        name: 'Treatment Options',
        description: 'How windfall compensation is handled',
        severity: 'MEDIUM',
        detection: {
          requiredElements: {
            options: ['cap', 'amortize', 'split credit', 'special bonus'],
          },
        },
        scoring: {
          A: 'Multiple treatment options defined with criteria',
          B: 'Cap mentioned, no other options',
          C: 'No treatment options defined',
        },
        insertionPoint: 'Within windfall section',
        status: 'UNMET',
      },
    ],
  },

  {
    policyCode: 'SCP-005',
    policyName: 'Section 409A Compliance Policy',
    category: 'Legal Compliance',
    requirements: [
      {
        id: 'R-005-01',
        name: 'Short-Term Deferral Safe Harbor',
        description: 'Payment by March 15 following year',
        severity: 'CRITICAL',
        detection: {
          positivePatterns: ['409A', 'short.term deferral', 'March 15', '2.5 months'],
          requiredElements: {
            paymentDeadline: 'March 15 following year',
          },
        },
        scoring: {
          A: 'Explicit 409A language with safe harbor timing',
          B: 'Payment timing exists, no 409A reference',
          C: 'No 409A compliance language',
        },
        insertionPoint: 'Section: Standard Terms and Conditions',
        status: 'UNMET',
      },
      {
        id: 'R-005-02',
        name: 'Savings Clause',
        description: 'Protection language for 409A compliance',
        severity: 'CRITICAL',
        detection: {
          positivePatterns: ['409A.*compliance', 'construed.*409A', 'limited.*409A'],
        },
        scoring: {
          A: 'Explicit 409A savings clause',
          B: 'Legal compliance language, not specific to 409A',
          C: 'No savings clause',
        },
        insertionPoint: 'Section: Standard Terms and Conditions',
        status: 'UNMET',
      },
    ],
  },

  {
    policyCode: 'SCP-006',
    policyName: 'State Wage Law Compliance Policy',
    category: 'Legal Compliance',
    requirements: [
      {
        id: 'R-006-01',
        name: 'California Written Agreement',
        description: 'CA Labor Code §2751 compliance',
        severity: 'CRITICAL',
        detection: {
          positivePatterns: [
            'California',
            'Labor Code',
            'written agreement',
            '§2751',
            '2751',
          ],
          requiredElements: {
            writtenAgreementLanguage: 'explicit reference',
            participantAcknowledgment: 'required',
          },
        },
        scoring: {
          A: 'Explicit CA written agreement requirement with §2751 reference',
          B: 'Has acknowledgment but no CA-specific language',
          C: 'No California compliance provisions',
        },
        insertionPoint: 'Section: Acknowledgement',
        status: 'UNMET',
      },
      {
        id: 'R-006-02',
        name: 'Final Payment Timing',
        description: 'State-specific final pay timing',
        severity: 'CRITICAL',
        detection: {
          requiredElements: {
            caInvoluntary: 'immediate',
            caVoluntary: '72 hours',
            stateMatrix: 'multi-state compliance',
          },
        },
        scoring: {
          A: 'State-specific final payment timing matrix',
          B: 'Final payment mentioned, no state specifics',
          C: 'No final payment timing provisions',
        },
        insertionPoint: 'Section: Payment Upon Termination',
        status: 'UNMET',
      },
      {
        id: 'R-006-03',
        name: 'Deduction Consent',
        description: 'State law requirements for payroll deductions',
        severity: 'HIGH',
        detection: {
          positivePatterns: ['consent.*deduction', 'authorization.*deduct'],
          requiredElements: {
            writtenConsent: 'for recoverable items',
            stateSpecific: 'CA, NY requirements',
          },
        },
        scoring: {
          A: 'Written consent requirement with state-specific rules',
          B: 'Deductions mentioned, no consent language',
          C: 'No consent provisions for deductions',
        },
        insertionPoint: 'Section: When is Commission Earned',
        status: 'UNMET',
      },
    ],
  },
];
