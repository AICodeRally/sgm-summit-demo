'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookmarkIcon,
  RocketIcon,
  CheckCircledIcon,
  Cross2Icon,
  BarChartIcon,
  LockClosedIcon,
  LightningBoltIcon,
  MixIcon,
} from '@radix-ui/react-icons';

export default function GovernanceFrameworkPrimer() {
  const [selectedSection, setSelectedSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookmarkIcon },
    { id: 'legal', title: 'Legal Compliance', icon: LockClosedIcon },
    { id: 'gaming', title: 'Gaming Prevention', icon: LightningBoltIcon },
    { id: 'design', title: 'Plan Design', icon: MixIcon },
    { id: 'implementation', title: 'Implementation', icon: RocketIcon },
  ];

  const content: Record<string, any> = {
    overview: {
      title: 'SPM Governance Framework Overview',
      subtitle: 'Best practices for compensation governance',
      sections: [
        {
          heading: 'What is the SPM Governance Framework?',
          content: `The SPM Governance Framework is a comprehensive methodology for designing, implementing, and managing sales compensation plans that are legally compliant, financially sound, and strategically aligned with business objectives.

The framework consists of **4 core pillars**:
1. **Legal Compliance** - Ensuring adherence to FLSA, state wage laws, and labor regulations
2. **Gaming Prevention** - Identifying and mitigating plan gaming vectors
3. **Plan Design Best Practices** - Building effective, motivating compensation structures
4. **Implementation & Governance** - Establishing processes for rollout, monitoring, and continuous improvement`,
        },
        {
          heading: 'Why Governance Matters',
          content: `**Financial Risk**: Poorly governed compensation plans can result in:
- **Legal exposure**: $500K+ in class action wage/hour claims
- **Gaming costs**: 15-25% of total comp budget lost to plan gaming
- **Turnover**: 30% higher attrition when plans are perceived as unfair

**Operational Risk**: Without governance:
- Inconsistent plan administration
- Disputes and escalations consuming 20+ hours/week
- Territory and account assignment conflicts
- Lack of visibility into plan performance

**Strategic Risk**: Misaligned plans lead to:
- Wrong behaviors incentivized (e.g., discounting, deal timing manipulation)
- Poor customer experience due to rep churn
- Inability to forecast accurately`,
        },
        {
          heading: 'Framework Components',
          content: `The SPM Framework includes **50+ governance detectors** across:

**Legal Compliance (12 detectors)**:
- FLSA classification (§7(i), administrative exemption, outside sales)
- State wage laws (CA §221, NY deduction restrictions)
- Draw and advance compliance
- Documentation requirements

**Gaming Prevention (18 detectors)**:
- Uncapped accelerators
- Booking vs revenue timing misalignment
- Deal splitting and timing manipulation
- Territory gaming
- Sandbagging incentives

**Plan Design (15 detectors)**:
- Pay mix and leverage
- Quota setting methodology
- Payout frequency
- Cap and threshold design

**Implementation (8 detectors)**:
- Training and communication
- CRM integration
- Dispute resolution process
- Audit and compliance tracking`,
        },
      ],
    },
    legal: {
      title: 'Legal Compliance Framework',
      subtitle: 'FLSA, wage laws, and regulatory requirements',
      sections: [
        {
          heading: 'FLSA Classification',
          content: `**Fair Labor Standards Act (FLSA)** governs overtime exemptions for sales roles.

**Common Exemptions**:

1. **Outside Sales Exemption (§213(a)(1))**
   - ✅ Employee's PRIMARY duty is making sales
   - ✅ Regularly engaged AWAY from employer's place of business
   - ⚠️ Does NOT apply to inside sales (phone/online)

2. **FLSA §7(i) Retail/Service Commission Exemption**
   - ✅ Employed by retail/service establishment
   - ✅ Regular rate of pay > 1.5x minimum wage
   - ✅ More than half compensation from commissions
   - ⚠️ ONLY for retail/service - NOT software/tech

3. **Administrative Exemption**
   - ❌ RARELY applies to sales roles
   - Primary duty must be office/non-manual work directly related to management/general business operations
   - Example: Sales operations analyst may qualify, but NOT account executives

**Critical Issues**:
- ❌ **FLSA §7(i) for inside sales** = CRITICAL violation
- ❌ **Administrative exemption for sales** = Misclassification risk
- ⚠️ **Hybrid roles** (inside + outside) require careful analysis`,
        },
        {
          heading: 'State Wage Deduction Laws',
          content: `**California Labor Code §221**: It is unlawful to deduct from wages for any reason not authorized by statute.

**What this means**:
- ❌ CANNOT deduct prior commission overpayments from wages
- ❌ CANNOT withhold final paycheck to recover draw
- ✅ CAN prospectively adjust future commission payments
- ✅ CAN require separate repayment agreement (not wage deduction)

**Compliant Language**:
✅ "If termination occurs during a draw period, any unearned draw will be recovered from future commission payments IF the employee continues to earn commissions. No deduction from base wages will occur."

**Non-Compliant Language**:
❌ "Unearned draw will be deducted from final paycheck or wages."

**Other State Considerations**:
- **New York**: Similar to CA - very restrictive on deductions
- **Texas**: More permissive IF employee signs written authorization
- **Illinois**: Requires specific written authorization with detailed terms`,
        },
        {
          heading: 'Draw Compliance',
          content: `**Draw Types**:

1. **Recoverable Draw (Advance)**
   - Must be repaid if not earned
   - Requires written agreement with clear recovery terms
   - Cannot violate wage deduction laws

2. **Non-Recoverable Draw (Guarantee)**
   - Salary paid regardless of commission earnings
   - Safer legally but more expensive
   - Common for ramp periods

**Compliance Requirements**:
✅ Written agreement BEFORE draw period starts
✅ Clear recovery schedule (e.g., "over next 6 months")
✅ Forgiveness clause (e.g., "forgiven after 12 months if still employed")
✅ State-specific deduction language
✅ Separate from base wage

**Red Flags**:
❌ Verbal draw agreement only
❌ Retroactive draw implementation
❌ No forgiveness clause
❌ Indefinite recovery period`,
        },
      ],
    },
    gaming: {
      title: 'Gaming Prevention Framework',
      subtitle: 'Identifying and mitigating plan gaming vectors',
      sections: [
        {
          heading: 'Uncapped Accelerators',
          content: `**Risk**: Accelerators without caps create unlimited financial exposure.

**Example**:
- Base rate: 10% of revenue
- Accelerator: 2.5x at 100% quota
- No cap

**Gaming Scenario**:
- Rep brings forward $2M deal from Q1 to Q4 (timing manipulation)
- Q4 attainment: 200% of quota
- Commission: $2M × 10% × 2.5 = $500K (vs $200K expected)

**Financial Impact**: 150% cost overrun

**Best Practice**:
✅ Cap accelerators at **200-250% of target total compensation**
✅ Example: OTE $200K → cap at $400-500K total payout
✅ OR cap accelerator duration: "2.5x rate applies to first $500K over quota"

**When Uncapped is Acceptable**:
- Strategic new product launch (time-limited)
- New market entry (12-18 month window)
- Account-based comp with deal-level caps`,
        },
        {
          heading: 'Booking vs Revenue Timing',
          content: `**Risk**: Paying commission at booking without adequate clawback creates revenue exposure.

**Problematic Scenarios**:
1. **Pay at booking, 30-day clawback**
   - Customer cancels after 45 days → commission already paid, no recovery
   - SaaS contracts often have 60-90 day cancellation windows

2. **Pay at booking, no clawback**
   - 🚨 CRITICAL RISK: Unlimited exposure
   - If 20% of bookings don't convert to revenue = 25% commission waste

**Best Practices**:

**Option 1: Revenue Recognition Payment**
✅ Pay commission when revenue is recognized (invoiced + collected)
✅ Zero revenue risk
⚠️ Longer time to payment (may impact motivation)

**Option 2: Booking Payment with Extended Clawback**
✅ Pay at booking (motivational benefit)
✅ 120-180 day clawback period
✅ Covers typical cancellation windows
⚠️ Requires tracking and recovery process

**Option 3: Hybrid Model**
✅ 50% at booking
✅ 50% at revenue recognition
✅ Balances motivation and risk`,
        },
        {
          heading: 'Deal Splitting & Timing Manipulation',
          content: `**Risk**: Reps can structure deals to maximize payout through timing or structure manipulation.

**Gaming Vectors**:

1. **Period Boundary Timing**
   - Rep delays Q4 close until Q1 to avoid year-end quota threshold
   - Rep accelerates Q1 close into Q4 to hit accelerator tier

2. **Deal Splitting**
   - $1M annual contract split into 2 × $500K deals to stay under cap
   - Multi-year deals structured as separate year-over-year contracts

3. **Sandbagging (No Carryover)**
   - Rep withholds Q4 closes until Q1 to "bank" easy quota for next year
   - Especially common in December (holiday excuse)

**Prevention Strategies**:

**Deal Splitting Controls**:
✅ Require VP approval for any deal split among multiple reps
✅ Define "single opportunity" in CRM (e.g., same decision-maker, same budget)
✅ Pro-rate credit for partial contributions

**Timing Controls**:
✅ Use quarterly quotas instead of monthly (reduces timing granularity)
✅ Implement rolling quotas (e.g., "trailing 12 months")
✅ Limit accelerator duration to first $X over quota

**Carryover Policy**:
✅ Allow 20-30% carryover of overachievement into next period
✅ Reduces sandbagging incentive
✅ Smooths quota attainment across periods`,
        },
      ],
    },
    design: {
      title: 'Plan Design Best Practices',
      subtitle: 'Building effective compensation structures',
      sections: [
        {
          heading: 'Pay Mix & Leverage',
          content: `**Pay Mix** = Base Salary : Variable Compensation

**Industry Benchmarks**:

| Role | Typical Mix | Range |
|------|-------------|-------|
| Enterprise AE | 50/50 | 40/60 - 60/40 |
| Mid-Market AE | 60/40 | 50/50 - 70/30 |
| Inside Sales | 70/30 | 60/40 - 80/20 |
| SDR/BDR | 75/25 | 70/30 - 80/20 |
| Customer Success | 80/20 | 75/25 - 90/10 |

**Leverage** = Variable Earnings at 100% Quota

**Best Practices**:
✅ Higher variable % for roles with direct revenue responsibility
✅ Lower variable % for roles with longer sales cycles (less control)
✅ Adjust for market: tech/SaaS tends toward 50/50, traditional sales 60/40

**Red Flags**:
❌ 60/40 for inside sales (too aggressive unless highly transactional)
❌ 80/20 for enterprise sales (insufficient motivation)
❌ Pay mix varies by region (creates internal equity issues)`,
        },
        {
          heading: 'Quota Setting Methodology',
          content: `**Quota Setting Approaches**:

1. **Top-Down (Revenue Target)**
   - Start with company revenue goal
   - Allocate to territories/reps based on capacity
   - ✅ Aligns with business objectives
   - ⚠️ May not reflect territory potential

2. **Bottom-Up (Territory Potential)**
   - Assess addressable market per territory
   - Aggregate to company total
   - ✅ Reflects market reality
   - ⚠️ May not meet revenue goals

3. **Hybrid Model**
   - Start with territory capacity analysis
   - Adjust for strategic priorities
   - Validate against company targets
   - ✅ **Best practice**

**Quota Distribution Targets**:
✅ **60-70% of reps should hit 80-120% of quota**
✅ Top 10% should hit 150%+ quota
✅ Bottom 10% should be below 50% (and managed out)

**Red Flags**:
❌ Less than 50% of reps hitting quota = quotas too high
❌ More than 90% hitting quota = quotas too low (leaving money on table)
❌ Flat quota across all reps (ignores territory differences)`,
        },
        {
          heading: 'Cap & Threshold Design',
          content: `**Caps**: Maximum payout limit

**When to Cap**:
✅ Uncapped accelerators (cap total comp at 200-250% of target)
✅ SPIFs and contests (cap per-rep payout)
✅ New product launches (time-limited cap waiver acceptable)

**When NOT to Cap**:
✅ Standard commission rates without accelerators
✅ Account-based comp (inherent ceiling due to account size)
✅ Strategic land-grab scenarios (new market entry)

**Thresholds**: Minimum performance before payout starts

**Common Thresholds**:
- **50% threshold**: Pay starts at 50% quota attainment
- **80% threshold**: Common for accelerators
- **No threshold**: Pay at $1 (high-volume transactional)

**Best Practices**:
✅ Use thresholds to manage low performers (50-70% threshold)
✅ Accelerator thresholds at 80-100% quota
✅ Avoid "cliff" thresholds (e.g., 0% at 99%, 100% at 100%)

**Graduated Thresholds (Best Practice)**:
- 0-50% quota: 0% payout
- 50-75% quota: 50% of rate
- 75-100% quota: 100% of rate
- 100%+ quota: accelerator`,
        },
      ],
    },
    implementation: {
      title: 'Implementation & Governance',
      subtitle: 'Rollout, monitoring, and continuous improvement',
      sections: [
        {
          heading: 'Plan Rollout Checklist',
          content: `**4-6 Weeks Before Effective Date**:
□ Finalize plan design and get executive approval
□ Legal review for FLSA and state law compliance
□ Finance approval of budget and payout modeling
□ Build compensation plan document (written agreement)
□ Configure CRM for quota tracking and territory assignment

**2-4 Weeks Before**:
□ Train sales managers on plan details and Q&A
□ Create FAQ document addressing common questions
□ Build payout calculator (Excel or web tool)
□ Set up dispute resolution process
□ Configure reporting dashboards

**1 Week Before**:
□ Hold "all-hands" plan presentation
□ Individual 1-on-1 quota assignments
□ Signed plan acceptance from each rep
□ Launch internal plan wiki/knowledge base
□ Send welcome email with resources

**Day 1**:
□ Plan goes live
□ Monitor questions and create rapid-response FAQ updates
□ Track adoption of new behaviors

**Week 2-4**:
□ Hold office hours for questions
□ Review early payout data for anomalies
□ Identify and fix any CRM tracking issues`,
        },
        {
          heading: 'Monitoring & KPIs',
          content: `**Plan Health Metrics**:

**Attainment Distribution**:
✅ Target: 60-70% of reps at 80-120% quota
- Actual < 50%? → Quotas too high
- Actual > 80%? → Quotas too low

**Payout Ratio** (Total Comp Paid / Target OTE):
✅ Target: 95-105% at company level
- Ratio < 90%? → Low attainment (morale risk)
- Ratio > 120%? → Over-payout (budget risk)

**Gaming Indicators**:
🚨 Period-end spikes (deals closing last week of quarter)
🚨 Deal size clustering (just under cap thresholds)
🚨 Territory transfer requests (chasing easy quota)
🚨 Dispute volume (>10% of reps filing monthly)

**Compliance Metrics**:
✅ 100% signed plan agreements
✅ 0 wage deduction violations
✅ 0 FLSA misclassification risks
✅ Draw recovery rate >80%

**Operational Metrics**:
- Average time to resolve dispute: <5 business days
- Plan comprehension score: >80% on quiz
- CRM data quality: >95% accuracy`,
        },
        {
          heading: 'Continuous Improvement',
          content: `**Quarterly Plan Review**:

**Q1 (Plan Validation)**:
- Review attainment distribution after first full quarter
- Identify and fix CRM tracking issues
- Address any legal/compliance red flags
- Gather rep feedback on plan clarity

**Q2 (Mid-Year Adjustment)**:
- Assess if quotas need mid-year correction (only if severe)
- Review gaming vectors and tighten controls
- Benchmark against market (pay levels, plan design)
- Identify top performers for retention planning

**Q3 (Plan Design for Next Year)**:
- Gather cross-functional input (sales, finance, legal, HR)
- Model scenarios for next year's plan
- Test new plan structures with focus groups
- Get executive alignment on philosophy and budget

**Q4 (Finalize & Prepare)**:
- Finalize next year's plan design
- Legal and finance approval
- Build training materials and FAQ
- Schedule rollout activities

**Annual Plan Retrospective**:
✅ What worked well?
✅ What gaming vectors emerged?
✅ Did attainment distribution hit target?
✅ How did disputes trend?
✅ What would we change?`,
        },
      ],
    },
  };

  const currentContent = content[selectedSection];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/governance-framework"
              className="text-purple-600 hover:text-purple-700 transition-colors"
            >
              ← Back to Framework Library
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
            Governance Framework Primer
          </h1>
          <p className="text-gray-600 mt-2">
            Learn SPM best practices for compensation governance
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <div className="w-80 border-r border-gray-200 bg-white/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Sections</h3>
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedSection === section.id
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {currentContent.title}
              </h2>
              <p className="text-gray-600">{currentContent.subtitle}</p>
            </div>

            {currentContent.sections.map((section: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.heading}
                </h3>
                <div className="prose max-w-none">
                  {section.content.split('\n\n').map((paragraph: string, pIdx: number) => {
                    // Check if it's a heading
                    if (paragraph.startsWith('**') && paragraph.endsWith('**:')) {
                      return (
                        <h4 key={pIdx} className="text-lg font-bold text-gray-800 mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, '').replace(':', '')}
                        </h4>
                      );
                    }

                    // Check if it's a list item
                    if (paragraph.startsWith('- ') || paragraph.startsWith('✅ ') || paragraph.startsWith('❌ ') || paragraph.startsWith('⚠️ ')) {
                      const items = paragraph.split('\n');
                      return (
                        <ul key={pIdx} className="list-none space-y-2 my-4">
                          {items.map((item, iIdx) => (
                            <li key={iIdx} className="text-gray-700">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Regular paragraph
                    return (
                      <p key={pIdx} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
