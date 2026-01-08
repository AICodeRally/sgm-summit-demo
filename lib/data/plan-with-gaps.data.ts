/**
 * Plan with Governance Gaps
 * Extends standard plan template with governance analysis
 */

import { STANDARD_PLAN_TEMPLATE, type TemplateSection } from './plan-template-library.data';

export interface PlanSectionWithGaps extends TemplateSection {
  status: 'COMPLETE' | 'PARTIAL' | 'MISSING';
  existingContent?: string;
  draftContent?: string;
  draftPurpose?: string;
  draftKeyProvisions?: string;
  relatedPolicies: string[];
}

/**
 * Get a sample plan with governance gaps for demonstration
 * This represents a typical Medical FSC compensation plan
 */
export function getSamplePlanWithGaps(): PlanSectionWithGaps[] {
  return STANDARD_PLAN_TEMPLATE.map((section): PlanSectionWithGaps => {
    // Sections 1-4: Plan Overview, Measures, Payouts, Examples - all COMPLETE
    if (section.order < 40) {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent || `[Existing content for ${section.title}]`,
        relatedPolicies: [],
      };
    }

    // Section 5.0: Terms & Conditions header - COMPLETE
    if (section.id === 'section-40') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: `# Terms and Conditions

The following terms and conditions apply to this compensation plan. Please read carefully.`,
        relatedPolicies: [],
      };
    }

    // Section 5.1-5.2: Basic terms - COMPLETE
    if (section.id === 'section-41' || section.id === 'section-42') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: [],
      };
    }

    // Section 5.3: Eligibility - PARTIAL (missing new hire ramp)
    if (section.id === 'section-43') {
      return {
        ...section,
        status: 'PARTIAL',
        existingContent: `## 3. Eligibility

Eligibility in the Plan begins upon hire or transfer into a job covered by the Plan.`,
        draftContent: `**[DRAFT ADDITION - New Hire Onboarding]**

### New Hire Ramp Period
- New hires receive 90-day ramp period with guaranteed minimum draw
- Ramp schedule:
  - Month 1-2: $5,000/month guaranteed minimum
  - Month 3-4: 75% of target incentive guaranteed
  - Month 5-6: 50% of target incentive guaranteed
  - Month 7+: Full plan participation, no guarantees
- Quotas during ramp: 50% of full quota (months 1-3), 75% (months 4-6)`,
        relatedPolicies: ['NEW_HIRE_ONBOARDING'],
      };
    }

    // Section 5.4-5.5: Plan Admin - COMPLETE
    if (section.id === 'section-44' || section.id === 'section-45') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: [],
      };
    }

    // Section 5.6: New Hires/Transfers - PARTIAL (missing comprehensive rules)
    if (section.id === 'section-46') {
      return {
        ...section,
        status: 'PARTIAL',
        existingContent: section.defaultContent,
        draftContent: `**[DRAFT ADDITION - Transfer Rules]**

### c) Transfer Out of Plan
When a participant transfers out of the Plan to another role:
- Final commission payment calculated through last day in role
- Pending deals in pipeline remain credited to transferring rep for 30 days
- After 30 days, territory assigned to replacement rep
- No double-crediting during transition period`,
        relatedPolicies: ['NEW_HIRE_ONBOARDING', 'MID_PERIOD_CHANGES'],
      };
    }

    // Section 5.7: Termination - PARTIAL (missing detailed rules)
    if (section.id === 'section-47') {
      return {
        ...section,
        status: 'PARTIAL',
        existingContent: section.defaultContent,
        draftContent: `**[DRAFT ADDITION - Termination Details]**

### e) Voluntary Resignation
- Commissions paid only on sales invoiced prior to last day worked
- No pending or future commissions paid
- Notice period does not extend commission eligibility

### f) Involuntary Termination
- **For Cause**: No commission payment on pending or future sales
- **Without Cause**: Commissions paid on sales invoiced within 30 days of termination date
- Final payment made within 30 days of termination or per state wage law requirements, whichever is sooner`,
        relatedPolicies: ['TERMINATION_FINAL_PAY'],
      };
    }

    // Section 5.8: Quota Management - MISSING
    if (section.id === 'section-48') {
      return {
        ...section,
        status: 'MISSING',
        draftContent: section.defaultContent,
        relatedPolicies: ['QUOTA_MANAGEMENT'],
      };
    }

    // Section 5.9: Territory Management - MISSING
    if (section.id === 'section-49') {
      return {
        ...section,
        status: 'MISSING',
        draftContent: section.defaultContent,
        relatedPolicies: ['TERRITORY_MANAGEMENT'],
      };
    }

    // Section 5.10: Sales Crediting - MISSING
    if (section.id === 'section-50') {
      return {
        ...section,
        status: 'MISSING',
        draftContent: section.defaultContent,
        relatedPolicies: ['SALES_CREDITING'],
      };
    }

    // Section 5.11: Windfall - PARTIAL (too vague)
    if (section.id === 'section-51') {
      return {
        ...section,
        status: 'PARTIAL',
        existingContent: section.defaultContent,
        draftContent: `**[DRAFT ADDITION - Formal Windfall Policy]**

### Windfall Definition
A "windfall" is any single transaction resulting in >$100,000 commission to an individual rep.

### Approval Thresholds
- **$100K - $250K**: SVP Sales approval required
- **$250K - $500K**: Compensation Review Board approval required
- **$500K+**: CEO + CRB approval required

### Review Process
1. Rep submits windfall request 10 business days before deal closes
2. Request includes: customer info, deal size, business justification, sales effort documentation
3. Approver reviews within 5 business days
4. If approved: Commission paid per normal schedule
5. If capped: Rep notified of cap amount and rationale in writing

### Commission Caps
- Maximum single transaction commission: $500,000 (without CRB exception)
- Annual individual cap: $750,000 total commissions (without CEO exception)
- Excess amounts above cap: Not paid unless exception granted`,
        relatedPolicies: ['WINDFALL_LARGE_DEALS'],
      };
    }

    // Section 5.12: Clawback - COMPLETE
    if (section.id === 'section-52') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: ['CLAWBACK_RECOVERY'],
      };
    }

    // Section 5.13: Payment Timing - PARTIAL (missing 409A details)
    if (section.id === 'section-53') {
      return {
        ...section,
        status: 'PARTIAL',
        existingContent: section.defaultContent,
        draftContent: `**[DRAFT ADDITION - Enhanced 409A Compliance]**

### Payment Holdback
- 10% holdback on all commission payments
- Holdback released annually on December 31st (if still employed)
- Holdback forfeited if terminated for cause
- Holdback paid out within 30 days if terminated without cause

### Year-End True-Up
- Annual reconciliation completed by January 31st
- Quota attainment recalculated based on full-year actual performance
- Tier adjustments applied retroactively
- True-up payment (or recovery) processed by February 28th`,
        relatedPolicies: ['PAYMENT_TIMING', 'COMPLIANCE_409A'],
      };
    }

    // Section 5.14: Exceptions & Disputes - COMPLETE
    if (section.id === 'section-54') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: ['EXCEPTIONS_DISPUTES'],
      };
    }

    // Section 5.15: Leave of Absence - COMPLETE
    if (section.id === 'section-55') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: ['LEAVE_OF_ABSENCE'],
      };
    }

    // Section 5.16: Definitions - COMPLETE
    if (section.id === 'section-56') {
      return {
        ...section,
        status: 'COMPLETE',
        existingContent: section.defaultContent,
        relatedPolicies: [],
      };
    }

    // Default: MISSING
    return {
      ...section,
      status: 'MISSING',
      draftContent: section.defaultContent || `[Draft content needed for ${section.title}]`,
      relatedPolicies: [],
    };
  });
}

/**
 * Get completion statistics for a plan
 */
export function getPlanCompletionStats(sections: PlanSectionWithGaps[]) {
  const complete = sections.filter((s) => s.status === 'COMPLETE').length;
  const partial = sections.filter((s) => s.status === 'PARTIAL').length;
  const missing = sections.filter((s) => s.status === 'MISSING').length;
  const total = sections.length;

  return {
    complete,
    partial,
    missing,
    total,
    completeness: Math.round(((complete + partial * 0.5) / total) * 100),
  };
}
