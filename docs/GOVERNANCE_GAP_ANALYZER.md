## Comp Plan Governance Gap Analyzer

**What it does**: Transforms compensation plan documents into governance compliance reports with A/B/C coverage grading, 1-5 liability scoring, and actionable patch kits.

---

## Why This is Non-Trivial

**The plan isn't just "missing policies." The plan contains risk-triggering mechanics that require heavier governance.**

Example triggers:
- **Retro/discretion posture**: "company may change/cancel at any time… sole discretion… not subject to review by a court."
- **Earned-after-deductions**: commission is "earned only after" draw/overdraw + freight + AR deductions + other expenses are subtracted.
- **Recoverable draw with repayment** even at termination/death.

Those three alone crank the score up in CA/multi-state contexts, regardless of how "complete" the plan looks.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│          COMP PLAN GOVERNANCE GAP ANALYZER                       │
└─────────────────────────────────────────────────────────────────┘
                                │
      ┌─────────────────────────┼─────────────────────────┐
      ▼                         ▼                         ▼
┌───────────┐           ┌───────────┐           ┌───────────┐
│   PLAN    │           │GOVERNANCE │           │JURISDICTION│
│  INGEST   │           │  LIBRARY  │           │  PROFILE   │
│           │           │           │           │            │
│ • Parse   │           │ • Policies│           │ • CA-first │
│ • Extract │           │ • Require │           │ • Multi-st │
│ • Detect  │           │   -ments  │           │ • Mult     │
└─────┬─────┘           └─────┬─────┘           └─────┬──────┘
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
              ┌───────────────────────────────┐
              │    ANALYSIS ENGINE            │
              │                               │
              │  1. Structure Analyzer        │
              │  2. Evidence Matcher          │
              │  3. Risk Trigger Detector     │
              │  4. Coverage Scorer (A/B/C)   │
              │  5. Liability Calculator(1-5) │
              └───────────┬───────────────────┘
                          │
      ┌───────────────────┼───────────────────┐
      ▼                   ▼                   ▼
┌───────────┐     ┌───────────┐     ┌───────────┐
│ GAP       │     │ RISK      │     │ PATCH     │
│ REGISTER  │     │ SUMMARY   │     │ KIT       │
│           │     │           │     │           │
│ • A/B/C   │     │ • Triggers│     │ • Addendum│
│ • 1-5     │     │ • Conflicts│    │ • Matrix  │
│ • Evidence│     │ • Actions │     │ • Policies│
└───────────┘     └───────────┘     └───────────┘
```

---

## Inputs

### 1. Plan Document
- **Format**: PDF, DOCX, TXT, Excel
- **Parsing**: Text extraction → Structured JSON
- **Key Fields**: Status, Version, Effective date, Plan code, Role, Division

### 2. Target Governance Library (2026 Policy Pack)
- **Policies**: SCP-001 through SCP-017 + Core policies + Standard T&Cs
- **Requirements**: Each policy mapped to atomic requirements with detection rules

### 3. Jurisdiction Profile
- **Primary**: CA (1.5x multiplier)
- **Multi-state**: NY (1.2x), Others (1.0x)
- **Wage Law Flags**: Final pay rules, deduction consent, earned definition strictness

---

## Outputs

### 1. Gap Register (Governance Scorecard)

| # | Governance Area | Code | Cov | Liab | Risk Triggers | Conflicts | Priority |
|---|----------------|------|-----|------|---------------|-----------|----------|
| 1 | State Wage Law | SCP-006 | C | 5 | RT-002, RT-003 | 2 | CRITICAL |
| 2 | Section 409A | SCP-005 | C | 4 | - | 0 | HIGH |
| 3 | Leave of Absence | SCP-009 | C | 4 | RT-006 | 1 | HIGH |
| 4 | Clawback/Recovery | SCP-001 | B | 3 | RT-002, RT-004 | 0 | MEDIUM |
| 5 | Quota Management | SCP-002 | C | 3 | RT-001 | 1 | MEDIUM |

**Fields**:
- **Coverage**: A (Adequate) / B (Deficient) / C (Missing)
- **Liability**: 1 (Low) to 5 (Critical)
- **Risk Triggers**: Detected mechanics that increase exposure
- **Conflicts**: Direct contradictions between plan and policy
- **Priority**: Patch urgency

### 2. Coverage Grading (A/B/C)

**A (Adequate)**:
- Plan contains the controls the policy expects
- Not just a sentence, but full implementation
- Example: Has clawback triggers, thresholds, approval tiers, notice, appeals

**B (Deficient)**:
- Plan mentions the topic but lacks critical controls
- Missing approvals, limits, timelines, dispute path
- Conflicts with standard governance language
- Example: Says "company may deduct" without limits or consent

**C (Missing)**:
- No meaningful plan language
- Policy area not addressed
- Example: No windfall policy, no quota methodology, no 409A savings clause

### 3. Liability Scoring (1-5)

**Formula**: `(Base + Triggers) × Jurisdiction`

**Base Score**:
- A → 1
- B → 2-3
- C → 3-4

**Trigger Multipliers**:
- RT-001 (Retro/discretion): +1
- RT-002 (Earned-after-deductions): +2
- RT-003 (Recoverable draw + termination): +2
- RT-004 (AR deductions): +1
- RT-005 (No dispute timeline): +1
- RT-006 (Employment requirement for earned comp): +1
- RT-007 (Territory reassignment without process): +1
- RT-008 (Undefined "manageable expenses"): +1
- RT-009 (Sales crediting by management determination): +1
- RT-010 (No cap or threshold): +1

**Jurisdiction Multiplier**:
- CA: 1.5x (strict wage laws)
- NY: 1.2x
- Other: 1.0x

**Example**:
- Missing "State Wage Law Compliance" (C → base 3.5)
- Has RT-002 (earned-after-deductions): +2
- Has RT-003 (recoverable draw + termination): +2
- CA jurisdiction: × 1.5
- **Final Score**: (3.5 + 2 + 2) × 1.5 = 11.25 → **5 (Critical)**

### 4. Patch Kit

**Two Formats**:

1. **Plan Addendum** (clean, publishable)
   - Ready-to-attach policy language
   - Formatted for immediate incorporation
   - Includes: Purpose, Provisions, Examples, Compliance references

2. **Policy Incorporation Matrix**
   - Maps: "Attach SCP-003, SCP-002… referenced in Section X"
   - Shows insertion points
   - Identifies dependencies

**Also Flags**: Referenced Elsewhere dependencies (plan mentions but doc not provided)

---

## Risk Trigger Detection

### RT-001: Retro/Discretion Posture
**Patterns**:
- "change.*cancel.*any time"
- "sole discretion"
- "not subject to review.*court"
- "company reserves the right"

**Impact**: +1
**Why**: Broad discretionary language increases enforceability risk

### RT-002: Earned-After-Deductions
**Patterns**:
- "earned only after"
- "deemed earned.*subtracted"
- "before.*commission is deemed earned"

**Impact**: +2
**Why**: Commission contingent on deductions = wage claim risk in CA

### RT-003: Recoverable Draw with Termination Repayment
**Patterns**:
- "recoverable draw"
- "pay back.*overdraw"
- "repayment.*termination"
- "overdraw.*death"

**Impact**: +2
**Why**: Recoverable draw + termination repayment = high state law risk

### RT-004: AR Deductions
**Patterns**:
- "AR.*deduct"
- "unpaid invoice.*subtract"
- "accounts receivable.*commission"

**Impact**: +1
**Why**: AR deductions from commissions = wage law risk

### RT-005: No Dispute Timeline
**Patterns** (negative match):
- No mention of "dispute.*days"
- No mention of "appeal.*days"

**Impact**: +1
**Why**: Missing dispute timeline = inconsistent handling risk

### RT-006: Spiff Employment Requirement
**Patterns**:
- "must be employed.*spiff"
- "employed at.*time.*award"
- "active.*time.*payment"

**Impact**: +1
**Why**: Employment requirement for earned incentives = state law risk

---

## Requirement Matrix

### Example: SCP-001 (Clawback and Recovery Policy)

**Requirement R-001-01**: Revenue Reversal Clawback
- **Severity**: HIGH
- **Detection**:
  - Positive patterns: "chargeback", "clawback", "recovery", "reversal"
  - Required elements: Triggering events, threshold, timing
- **Scoring**:
  - A: Has explicit clawback with triggers, thresholds, and timing
  - B: Mentions adjustments/chargebacks but no formal framework
  - C: Silent on recovery of overpayments
- **Insertion Point**: Section: When is Commission Earned OR new Section 20

**Requirement R-001-02**: Approval Authority
- **Severity**: MEDIUM
- **Required Elements**: Approval tiers ($5K, $25K, $50K+), approval roles
- **Scoring**:
  - A: Explicit approval matrix by dollar threshold
  - B: Mentions management approval, no tiers
  - C: No approval requirement stated

**Requirement R-001-03**: Recovery Mechanism
- **Severity**: HIGH
- **Detection**: "payroll deduction", "offset.*future", "repayment"
- **Required Elements**: Max deduction rate (25%), notice period (60 days)
- **Scoring**:
  - A: Explicit recovery method with limits and notice
  - B: Says 'company may deduct' without limits
  - C: No recovery mechanism defined

**Requirement R-001-04**: Appeals Process
- **Severity**: MEDIUM
- **Detection**: "appeal", "dispute.*clawback", "contest.*recovery"
- **Required Elements**: Timeline (30 days), review body
- **Scoring**:
  - A: Formal appeals process with timeline and review body
  - B: General dispute language exists, not specific to clawback
  - C: No appeals right for clawbacks

---

## Conflict Detection

**Conflicts are worse than gaps** - the plan says one thing, policy requires another.

### Example Conflicts

| Plan Says | Policy Says | Conflict Type | Severity |
|-----------|-------------|---------------|----------|
| "change or cancel this Plan at any time" | Retroactive changes only for errors, law, or extraordinary circumstances | CONTRADICTION | HIGH |
| "sole discretion…not subject to review by a court" | 3-level dispute escalation with defined timelines | CONTRADICTION | CRITICAL |
| "overdraw repayment…at termination, separation or death" | Recoverable requires legal review + state law check; death repayment questionable | MISALIGNMENT | CRITICAL |
| Commission "earned only after" deductions | Earned on close, not payment (CA wage law) | CONTRADICTION | CRITICAL |
| "must be employed at time spiff awards made" | Earned comp paid regardless of employment status | CONTRADICTION | HIGH |

---

## Usage

### Test the Analyzer

```bash
# Run governance gap analysis
npx tsx scripts/test-governance-analysis.ts
```

### Sample Output

```
🔍 GOVERNANCE GAP ANALYSIS TEST
================================================================================

📄 Step 1: Parsing document...
✅ Parsed 48 sections

📚 Step 2: Loading policy library...
✅ Loaded 17 policies

🔍 Step 3: Running governance gap analysis...
✅ Analysis complete in 125ms

================================================================================
GOVERNANCE GAP REPORT
================================================================================

📋 PLAN INFORMATION
   Plan: Sample Compensation Plan
   Analyzed: 1/8/2026, 9:30:00 PM
   Jurisdiction: CA (1.5x multiplier)
   Wage Law Flags: final_pay_immediate, written_agreement_required, ...

⚠️  OVERALL RISK ASSESSMENT
   Risk Level: HIGH
   Critical Gaps: 3
   High-Liability Areas: 5

📊 STATISTICS
   Coverage Distribution:
      A (Adequate): 1 policies
      B (Deficient): 6 policies
      C (Missing): 10 policies

   Liability Distribution:
      5 (Critical): 1 policies
      4 (High): 3 policies
      3 (Medium-High): 4 policies
      2 (Medium): 5 policies
      1 (Low): 4 policies

   Risk Indicators:
      Total Risk Triggers: 12
      Total Conflicts: 5
      Unmet Requirements: 45

🚨 TOP RISK TRIGGERS DETECTED
   1. Earned-After-Deductions (RT-002)
      Impact: +2
      Description: Commission contingent on deductions = wage claim risk in CA
      Matched Patterns: earned only after, deemed earned.*subtracted
      Found In: Commission Calculation, When is Commission Earned

   2. Recoverable Draw with Termination Repayment (RT-003)
      Impact: +2
      Description: Recoverable draw + termination repayment = high state law risk
      Matched Patterns: recoverable draw, repayment.*termination
      Found In: Draw Payments, Termination

================================================================================
GAP REGISTER
================================================================================

| # | Governance Area                 | Code    | Cov | Liab | Triggers | Conflicts | Priority |
|---|---------------------------------|---------|-----|------|----------|-----------|----------|
| 1 | State Wage Law Compliance       | SCP-006 | C   | 5    | 2        | 3         | CRITICAL |
| 2 | Section 409A Compliance         | SCP-005 | C   | 4    | 0        | 0         | HIGH     |
| 3 | Leave of Absence                | SCP-009 | C   | 4    | 1        | 1         | HIGH     |
| 4 | Termination/Final Pay           | SCP-012 | B   | 4    | 1        | 2         | HIGH     |
| 5 | Clawback and Recovery           | SCP-001 | B   | 3    | 2        | 0         | MEDIUM   |

🎯 IMMEDIATE ACTIONS RECOMMENDED
   1. Address State Wage Law Compliance (SCP-006): Add CA Labor Code §2751 written agreement language, state-specific final pay timing matrix, deduction consent provisions
   2. Address Section 409A Compliance (SCP-005): Add 409A savings clause to Standard Terms and Conditions
   3. Address Leave of Absence (SCP-009): Add FMLA-compliant language, quota pro-ration formulas, remove employment requirements for earned comp

================================================================================
✅ ANALYSIS COMPLETE
================================================================================

Summary:
  • Analyzed 17 governance areas against 17 policies
  • Overall Risk: HIGH
  • Coverage: 1A / 6B / 10C
  • Liability: 1 Critical (5) / 3 High (4)
  • Risk Triggers: 12 detected
  • Conflicts: 5 identified
  • Analysis Time: 125ms
```

---

## Key Benefits

1. **Goes Beyond Structure**: Detects governance-thin sections (PARTIAL) vs truly missing (MISSING)
2. **Risk-Aware Scoring**: Liability driven by actual plan mechanics, not just completeness
3. **Jurisdiction-Sensitive**: CA wage law flags crank up scores appropriately
4. **Evidence-Based**: Every finding traceable to plan text and policy requirement
5. **Actionable Patches**: Exact insertion points, not vague "add a policy"
6. **Conflict Detection**: Finds where plan contradicts target governance standard

---

## Next Steps

After generating the gap report:

1. **Review Critical Gaps** (Liability 4-5)
2. **Address Conflicts** (plan vs policy contradictions)
3. **Apply Patch Kit** (incorporate recommended policies)
4. **Re-run Analysis** (verify improvements)
5. **Generate Addendum** (publishable supplement)

---

## Architecture

**Files**:
- `lib/contracts/governance-gap.contract.ts` - TypeScript types
- `lib/data/governance/requirement-matrix.ts` - Policy requirements
- `lib/data/governance/risk-triggers.ts` - Risk trigger definitions
- `lib/services/governance-gap-analysis/governance-analyzer.ts` - Analysis engine
- `scripts/test-governance-analysis.ts` - Test script

**Data Flow**:
1. Parse document → Sections with JSON content
2. Load policy library → 17 policies with requirements
3. Detect risk triggers → RT-001 through RT-010
4. Evaluate requirements → MET/PARTIAL/UNMET
5. Grade coverage → A/B/C
6. Score liability → 1-5
7. Generate patches → Insertion points + content
8. Output report → Gap register + risk summary

---

## Example: How Liability is Calculated

**Policy**: State Wage Law Compliance (SCP-006)

**Coverage**: C (Missing)
- No CA Labor Code §2751 reference
- No state-specific final pay timing
- No deduction consent provisions

**Base Score**: 3.5 (C = Missing)

**Risk Triggers**:
- RT-002 (Earned-after-deductions): +2
- RT-003 (Recoverable draw + termination): +2

**Sub-Total**: 3.5 + 2 + 2 = 7.5

**Jurisdiction**: CA × 1.5

**Final Liability**: 7.5 × 1.5 = 11.25 → Clamped to **5 (Critical)**

**Why Critical**:
- Plan has three high-risk mechanics (earned-after, recoverable draw, AR deductions)
- CA wage law is strict on these exact issues
- Missing all foundational compliance controls
- High wage claim exposure + class action risk

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: /governance/upload, /governance-framework, /governance-matrix, /documents/upload, /plans/remediation/[planCode]
