# ASK_MODULE_ROUTING_MAP.md
> Umbrella: AskSPM "The Godfather" → routes to focused Ask* modules by intent + artifact type.

---

## 1) Routing Principles

1. Route by **deliverable** and **decision authority**, not by keyword
2. If the user asks for a decision, route to the module that can produce an **auditable artifact** for that domain
3. If the user asks for math/simulation, route to **AskCalc/AskICM**
4. If the user asks for design/strategy, route to the **domain owner** (STM/SQM/etc.) unless it's about governance of the process

---

## 2) Canonical Modules

| Module | Domain | Responsibilities |
|--------|--------|------------------|
| **AskSGM** | Sales Governance Management | Disputes, exceptions, change control, audit/controls, policy precedence, compliance |
| **AskSTM** | Sales Territory Management | Territory rules, assignments, coverage, movement logic (design + ops) |
| **AskSQM** | Sales Quota Management | Quota methods, adjustments, relief logic (design + ops) |
| **AskICM** | Incentive Comp Management | Plan mechanics, rate tables, crediting rules execution (ops) |
| **AskCalc** | Simulation + Calculations | Payouts, attainment, what-if, edge cases (math engine) |
| **AskData** | Data Integrity | Reconciliation, source-of-truth conflicts, ETL validation, anomaly detection |
| **AskPolicy** | Policy Authoring | Produce policy atoms, versioning, effective dating, approval matrices |

---

## 3) Intent → Module Routing Table

| User Intent / Question | Primary Module | Typical Deliverable |
|------------------------|----------------|---------------------|
| "Is this allowed under the plan/policy?" | **AskSGM** | RULING |
| "I need an exception / quota relief / special payout approval" | **AskSGM** | EXCEPTION_PACKET |
| "Rep disputes payout/credit" | **AskSGM** | DISPUTE_KIT |
| "We need to change rules mid-cycle / retro change" | **AskSGM** | CHANGE_CONTROL_MEMO |
| "Policy is unclear/missing; what do we do?" | **AskSGM** | GOVERNANCE_GAP |
| "What are the California requirements for commission agreements?" | **AskSGM** | RULING (F-001 compliance) |
| "How should we handle clawback for cancelled orders?" | **AskSGM** | RULING (E-002) |
| "Is our 'sole discretion' language a compliance risk?" | **AskSGM** | RULING (risk assessment) |
| "Simulate payout / what-if / edge cases math" | **AskCalc** | Simulation result + evidence |
| "Calculate my commission for this deal" | **AskCalc** | Calculation breakdown |
| "How are territories assigned / redesign coverage" | **AskSTM** | Territory proposal / ruleset |
| "Why was I moved to a different territory?" | **AskSTM** | Territory change memo |
| "How are quotas set / reforecast / relief design" | **AskSQM** | Quota memo / adjustment packet |
| "Why did my quota change mid-year?" | **AskSQM** | Quota adjustment memo |
| "Why do CRM/ICM numbers not match?" | **AskData** | Reconciliation report |
| "My commission doesn't match what I calculated" | **AskData** → **AskCalc** | Data validation + calculation |
| "Write/normalize governance policy into atoms" | **AskPolicy** | Policy atom set + approval chain |

---

## 4) Collision Rules (tie-breakers)

| Condition | Winner |
|-----------|--------|
| Request includes approvals/retro/disputes/exceptions | **AskSGM** wins (governance override) |
| Core action is math | **AskCalc** wins (AskSGM can provide approval routing if needed) |
| Core action is data integrity | **AskData** wins (AskSGM consumes report as evidence) |
| Request involves compliance/legal | **AskSGM** wins with legal review flag |
| Request involves territory rules | **AskSTM** wins unless it's about governance of territory process |
| Request involves quota methodology | **AskSQM** wins unless it's about governance of quota process |

---

## 5) Standard Hand-off Payload

When routing between modules, include:

```json
{
  "routing": {
    "from_module": "AskSGM",
    "to_module": "AskCalc",
    "reason": "Requires payout simulation"
  },
  "context": {
    "tenant_id": "tenant_123",
    "user_role": "SalesOps",
    "plan_year": 2026,
    "plan_version": "v3.1",
    "cycle_state": "Pre-Close"
  },
  "record_context": {
    "rep_id": "rep_456",
    "opp_id": "opp_789",
    "case_id": "case_001"
  },
  "evidence_pointers": [
    { "doc_id": "doc_plan_2026", "anchor": "§4.2" },
    { "system": "ICM", "record_id": "credit_8891" }
  ],
  "requested_outcome": "Calculate payout at 50/50 split vs 70/30 split",
  "artifact_type": "Simulation"
}
```

---

## 6) SGM-Specific Routing Decisions

### Routes INTO AskSGM
| From | Trigger | Deliverable |
|------|---------|-------------|
| AskCalc | Calculation result has policy implication | RULING |
| AskSTM | Territory change needs approval | EXCEPTION_PACKET |
| AskSQM | Quota adjustment needs CRB approval | CHANGE_CONTROL_MEMO |
| AskData | Data discrepancy affects payout | DISPUTE_KIT |
| AskICM | Plan change needs governance review | CHANGE_CONTROL_MEMO |

### Routes OUT OF AskSGM
| To | Trigger | Context Passed |
|----|---------|----------------|
| AskCalc | Need payout simulation | Rep/deal context + scenario parameters |
| AskSTM | Territory governance question requires design input | Governance constraints |
| AskSQM | Quota governance question requires methodology input | Governance constraints |
| AskData | Need system reconciliation | Record IDs + discrepancy description |
| AskPolicy | Need to author new policy atom | Gap description + proposed language |

---

## 7) Governance Override Rules

AskSGM has **override authority** in these situations:

1. **Any request involving approvals** → AskSGM provides approval routing regardless of domain
2. **Any request involving retroactive changes** → AskSGM applies retro rules (D-001)
3. **Any request involving disputes** → AskSGM owns dispute process (D-003)
4. **Any request involving CRITICAL policies** → AskSGM flags for legal review
5. **Any request involving compliance** → AskSGM applies jurisdiction multipliers

---

## 8) Module Status (Implementation)

| Module | Status | Notes |
|--------|--------|-------|
| AskSGM | **Active** | 21 policies, 5 deliverable types |
| AskCalc | Planned | Math engine |
| AskSTM | Planned | Territory management |
| AskSQM | Planned | Quota management |
| AskICM | Planned | Comp mechanics |
| AskData | Planned | Data reconciliation |
| AskPolicy | Planned | Policy authoring |

---

## 9) Example Routing Scenarios

### Scenario 1: "Why is my commission wrong?"
```
1. AskSPM receives question
2. Route to AskData (data integrity check)
3. AskData: "CRM and ICM match. No data discrepancy."
4. Route to AskCalc (calculation validation)
5. AskCalc: "Calculation is correct per plan terms"
6. If rep disagrees → Route to AskSGM (DISPUTE_KIT)
```

### Scenario 2: "I want my territory changed"
```
1. AskSPM receives request
2. Route to AskSTM (territory design)
3. AskSTM: "Territory change requires approval per B-003"
4. Route to AskSGM (EXCEPTION_PACKET)
5. AskSGM: Produces exception packet with approval chain
```

### Scenario 3: "What happens to my commission if I go on FMLA?"
```
1. AskSPM receives question
2. Route to AskSGM (D-002 Leave of Absence - CRITICAL)
3. AskSGM: Produces RULING with FMLA compliance requirements
4. Flags for legal review (CRITICAL policy)
```
