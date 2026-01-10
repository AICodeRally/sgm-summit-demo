# POLICY_ATOM_SCHEMA.md
> A Policy Atom is the smallest enforceable, effective-dated rule unit.
> AskSGM must cite policy atoms (policy_id + reference anchors) when making rulings.

---

## 1) Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `policy_id` | string (uuid) | Unique policy identifier |
| `policy_code` | string | Human-readable code (A-001 to F-003) |
| `title` | string | Policy title |
| `category` | string | Policy category |
| `section` | string | Section name (A-F) |
| `domain_tags` | string[] | Taxonomy tags for retrieval |
| `authority_tier` | enum | PlanClause \| PlanAddendum \| ApprovedPolicy \| DecisionMemo \| SOP \| FAQ |
| `severity` | enum | CRITICAL \| HIGH \| MEDIUM \| LOW |

---

## 2) Scope Definition

```json
{
  "scope": {
    "roles": ["Rep", "Manager", "SalesOps", "Finance", "Admin"],
    "geo": ["US", "CA", "NY", "EMEA"],
    "segment": ["Enterprise", "Mid-Market", "SMB"],
    "product": ["Hardware", "Software", "Services"],
    "entities": ["Crediting", "Quota", "Payout", "Dispute", "Exception", "ChangeControl"]
  }
}
```

---

## 3) Effective Dating

```json
{
  "effective_start": "2026-01-01",
  "effective_end": "2026-12-31",
  "supersedes": "policy_v2.0",
  "version": "3.0"
}
```

---

## 4) Rule Structure

### Rule Text (human-readable)
```json
{
  "rule_text": "Retroactive credit adjustments after Pre-Close require VP Sales and Finance approval and must be logged with rationale."
}
```

### Rule Logic (structured)
```json
{
  "rule_logic": {
    "conditions": [
      "cycle_state IN ('Pre-Close', 'Closed', 'Post-Close')",
      "change_type = 'credit_adjustment'",
      "change_timing = 'retroactive'"
    ],
    "actions": [
      "create_exception_packet",
      "route_for_approval",
      "log_audit_note"
    ],
    "constraints": [
      "must_log_audit_note",
      "must_attach_evidence",
      "must_obtain_vp_approval"
    ],
    "enforcement": "Block"
  }
}
```

---

## 5) Exception & Evidence Requirements

```json
{
  "exceptions_allowed": true,
  "exception_process": "D-003",
  "required_evidence": [
    "crm_booking_timestamp",
    "icm_credit_record_id",
    "manager_attestation",
    "business_justification"
  ],
  "approval_chain": [
    "Direct Manager",
    "VP Sales",
    "Finance Approver"
  ],
  "sla_hours": 48
}
```

---

## 6) Enforcement Levels

| Level | Description |
|-------|-------------|
| **Block** | System prevents action; exception required |
| **Warn** | System warns but allows with acknowledgment |
| **LogOnly** | System logs but does not prevent |

---

## 7) References

```json
{
  "references": [
    {
      "doc_id": "policy_D-001",
      "anchor": "§2.1 Retroactivity",
      "excerpt": "Changes after Pre-Close require VP approval"
    },
    {
      "doc_id": "policy_B-001",
      "anchor": "§4.2 Crediting Splits",
      "excerpt": "Splits are locked at booking"
    }
  ],
  "related_policies": ["B-001", "D-003", "F-002"]
}
```

---

## 8) Gold Standard Language

```json
{
  "gold_standard_language": {
    "primary": "Retroactive credit changes after Pre-Close require written approval from VP Sales and Finance Director, with documented business justification and audit trail.",
    "variants": {
      "california": "Per California Labor Code §2751, retroactive changes must comply with commission agreement requirements.",
      "international": "International retroactive changes must also consider Works Council notification requirements per F-003."
    }
  }
}
```

---

## 9) Complete Policy Atom Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PolicyAtom",
  "type": "object",
  "required": [
    "policy_id",
    "policy_code",
    "title",
    "category",
    "section",
    "domain_tags",
    "authority_tier",
    "severity",
    "effective_start",
    "rule_text",
    "rule_logic"
  ],
  "properties": {
    "policy_id": { "type": "string", "format": "uuid" },
    "policy_code": { "type": "string", "pattern": "^[A-F]-\\d{3}$" },
    "title": { "type": "string" },
    "category": { "type": "string" },
    "section": { "type": "string" },
    "order": { "type": "integer" },
    "domain_tags": { "type": "array", "items": { "type": "string" } },
    "authority_tier": {
      "type": "string",
      "enum": ["PlanClause", "PlanAddendum", "ApprovedPolicy", "DecisionMemo", "SOP", "FAQ"]
    },
    "severity": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    },
    "scope": {
      "type": "object",
      "properties": {
        "roles": { "type": "array", "items": { "type": "string" } },
        "geo": { "type": "array", "items": { "type": "string" } },
        "segment": { "type": "array", "items": { "type": "string" } },
        "product": { "type": "array", "items": { "type": "string" } },
        "entities": { "type": "array", "items": { "type": "string" } }
      }
    },
    "effective_start": { "type": "string", "format": "date" },
    "effective_end": { "type": "string", "format": "date" },
    "supersedes": { "type": "string" },
    "version": { "type": "string" },
    "rule_text": { "type": "string" },
    "rule_logic": {
      "type": "object",
      "properties": {
        "conditions": { "type": "array", "items": { "type": "string" } },
        "actions": { "type": "array", "items": { "type": "string" } },
        "constraints": { "type": "array", "items": { "type": "string" } },
        "enforcement": { "type": "string", "enum": ["Block", "Warn", "LogOnly"] }
      }
    },
    "exceptions_allowed": { "type": "boolean" },
    "exception_process": { "type": "string" },
    "required_evidence": { "type": "array", "items": { "type": "string" } },
    "approval_chain": { "type": "array", "items": { "type": "string" } },
    "sla_hours": { "type": "integer" },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "doc_id": { "type": "string" },
          "anchor": { "type": "string" },
          "excerpt": { "type": "string" }
        }
      }
    },
    "related_policies": { "type": "array", "items": { "type": "string" } },
    "gold_standard_language": {
      "type": "object",
      "properties": {
        "primary": { "type": "string" },
        "variants": { "type": "object" }
      }
    },
    "detection_patterns": { "type": "array", "items": { "type": "string" } },
    "required_elements": { "type": "array", "items": { "type": "string" } },
    "risk_notes": { "type": "string" }
  }
}
```

---

## 10) Example Policy Atom (F-001 - State Wage Law Compliance)

```json
{
  "policy_id": "pol_f001_v3",
  "policy_code": "F-001",
  "title": "State Wage Law Compliance",
  "category": "Compliance and Controls",
  "section": "F - Compliance and Controls",
  "order": 19,
  "domain_tags": [
    "SGM", "Compliance", "StateWageLaw", "California", "FinalPay",
    "Deductions", "WrittenAgreement", "LaborCode"
  ],
  "authority_tier": "ApprovedPolicy",
  "severity": "CRITICAL",
  "scope": {
    "roles": ["Rep", "Manager", "SalesOps", "Finance", "Admin", "Legal"],
    "geo": ["US", "CA", "NY", "MA", "IL", "TX"],
    "entities": ["Payout", "Termination", "Deductions", "Agreement"]
  },
  "effective_start": "2026-01-01",
  "effective_end": "2026-12-31",
  "version": "3.0",
  "rule_text": "All commission agreements must comply with applicable state wage and hour laws, including written agreement requirements, final payment timing, and deduction consent rules.",
  "rule_logic": {
    "conditions": [
      "employee_state IN ('CA', 'NY', 'MA', 'IL')",
      "compensation_type = 'commission'"
    ],
    "actions": [
      "verify_written_agreement",
      "calculate_final_pay_deadline",
      "validate_deduction_consent"
    ],
    "constraints": [
      "CA: immediate_final_pay_on_termination",
      "CA: written_agreement_signed_required",
      "CA: strict_deduction_consent",
      "NY: final_pay_next_payday"
    ],
    "enforcement": "Block"
  },
  "exceptions_allowed": false,
  "required_evidence": [
    "signed_commission_agreement",
    "employee_acknowledgment",
    "final_pay_calculation",
    "deduction_consent_form"
  ],
  "approval_chain": ["Legal Review", "HR Director"],
  "sla_hours": 24,
  "references": [
    {
      "doc_id": "ca_labor_code_2751",
      "anchor": "§2751",
      "excerpt": "Every employer shall give to every employee at the time of hiring a written statement..."
    }
  ],
  "related_policies": ["E-001", "C-001", "D-002"],
  "gold_standard_language": {
    "primary": "This agreement complies with California Labor Code Section 2751. The method for computing and paying commissions is set forth herein. Employee acknowledges receipt of this signed agreement.",
    "variants": {
      "final_pay": "Upon termination of employment, final commission payments will be made in accordance with applicable state law: (i) immediately upon termination in California, (ii) within 72 hours of resignation in California, or (iii) by the next regular payday in other states.",
      "deduction_consent": "No deductions from commission payments will be made without prior written authorization from the employee, except as required by law."
    }
  },
  "detection_patterns": [
    "commission agreement",
    "signed agreement",
    "final pay",
    "termination payment",
    "deduction consent",
    "Labor Code §2751"
  ],
  "required_elements": [
    "Written agreement requirement stated",
    "Employee acknowledgment process",
    "Final payment timing by state",
    "Deduction consent procedure",
    "State-specific compliance notes"
  ],
  "risk_notes": "CRITICAL: California waiting time penalties ($100/day up to 30 days). Class action exposure for systematic non-compliance. Attorney fee recovery for employees."
}
```

---

## 11) Policy Atom Index (21 Policies)

| Code | Title | Severity |
|------|-------|----------|
| A-001 | Standard Terms and Definitions | MEDIUM |
| A-002 | New Hire and Onboarding Policy | MEDIUM |
| A-003 | Plan Version Control Policy | LOW |
| A-004 | Plan Document Standards | MEDIUM |
| B-001 | Sales Crediting Policy | HIGH |
| B-002 | Quota Management Policy | HIGH |
| B-003 | Territory Management Policy | MEDIUM |
| B-004 | Cap and Threshold Policy | HIGH |
| B-005 | SPIF Governance Policy | MEDIUM |
| B-006 | Windfall and Large Deal Policy | HIGH |
| C-001 | Payment Timing Policy | MEDIUM |
| C-002 | Draws and Guarantees Policy | HIGH |
| C-003 | Section 409A Compliance | **CRITICAL** |
| D-001 | Mid-Period Change Policy | HIGH |
| D-002 | Leave of Absence Policy | **CRITICAL** |
| D-003 | Exception and Dispute Resolution Policy | HIGH |
| E-001 | Termination and Final Pay Policy | **CRITICAL** |
| E-002 | Clawback and Recovery Policy | HIGH |
| F-001 | State Wage Law Compliance | **CRITICAL** |
| F-002 | Data and Systems Controls Policy | HIGH |
| F-003 | International Compliance Policy | HIGH |
