# SEED_LOADER_CONTRACT.md
> Insertion order + upsert keys + referential checks for loading SEED_DATASET.json

---

## 1) Insertion Order (must follow)

### Phase 0 — Pack registration (optional but recommended)
1. **Pack** (or whatever AICR registry table is)
   - Upsert key: `(pack_id, pack_version)`

### Phase 1 — Dictionary tables (no foreign keys depend on these)
2. **PrecedentTag**
   - Upsert key: `tagId`
3. **SpmPolicy**
   - Upsert key: `policyId`

### Phase 2 — Versioned rules (depend on Policy)
4. **SpmPolicyVersion**
   - Upsert key: `policyVersionId`
   - FK checks: `policyId` must exist in SpmPolicy
   - Optional FK: `supersedesId` must exist in SpmPolicyVersion (if provided)

### Phase 3 — Procedures (depend on Policy via join table)
5. **SpmProcedure**
   - Upsert key: `procedureId`
6. **ProcedureState**
   - Upsert key: `(procedureId, stateKey)` (composite)
   - FK: procedure must exist
7. **ProcedureTransition**
   - Upsert key: `(procedureId, fromStateKey, toStateKey)` (composite)
   - FK: procedure must exist
   - Referential rule: `fromStateKey` and `toStateKey` must exist as ProcedureState.stateKey for that procedure
8. **ProcedurePolicy** (join)
   - Upsert key: `(procedureId, policyId)`
   - FK: procedure + policy must exist

### Phase 4 — Controls (depend on Policy via join, evidence types via reqs)
9. **SpmControl**
   - Upsert key: `controlId`
10. **ControlPolicy** (join)
    - Upsert key: `(controlId, policyId)`
    - FK: control + policy must exist

### Phase 5 — Evidence Types and Evidence Items

**Option A (recommended):** Create EvidenceType records and map labels → IDs during load.
**Option B:** Skip EvidenceType normalization and store type label in EvidenceItem.metadata.

If using Option A:
11. **EvidenceType**
    - Upsert key: `evidenceTypeId`
12. **EvidenceItem**
    - Upsert key: `evidenceId`
    - FK: `evidenceTypeId` must exist

If using Option B:
11. **EvidenceItem**
    - Upsert key: `evidenceId`
    - Store `metadata.source_type_label` and set `evidenceTypeId = "EVT-UNNORMALIZED"`

### Phase 6 — Cases (depend on PolicyVersion / Evidence / PrecedentTag)
13. **SpmCase**
    - Upsert key: `caseId`
14. **CasePolicyVersion** (join)
    - Upsert key: `(caseId, policyVersionId)`
    - FK: case + policyVersion must exist
15. **CaseEvidence** (join)
    - Upsert key: `(caseId, evidenceId)`
    - FK: case + evidence must exist
16. **CasePrecedentTag** (join)
    - Upsert key: `(caseId, tagId)`
    - FK: case + tag must exist

### Phase 7 — Decisions (depend on PolicyVersion / Evidence / PrecedentTag)
17. **SpmDecision**
    - Upsert key: `decisionId`
18. **DecisionPolicyVersion** (join)
    - Upsert key: `(decisionId, policyVersionId)`
19. **DecisionEvidence** (join)
    - Upsert key: `(decisionId, evidenceId)`
20. **DecisionPrecedentTag** (join)
    - Upsert key: `(decisionId, tagId)`

---

## 2) Upsert Rules (idempotent loads)

### Always upsert by deterministic IDs
- `SpmPolicy.policyId`
- `SpmPolicyVersion.policyVersionId`
- `SpmProcedure.procedureId`
- `SpmControl.controlId`
- `EvidenceItem.evidenceId`
- `SpmCase.caseId`
- `SpmDecision.decisionId`
- `PrecedentTag.tagId`

### Timestamp handling
- **Preserve** `createdAt` if exists
- **Update** `updatedAt` on change

### Array fields merge strategy
Pick one and stay consistent:
- **Replace:** simplest + most deterministic (recommended for seed load)
- **Union:** safer if multiple packs contribute roles/tags

---

## 3) Referential Integrity Checks (fail fast)

### Required checks
- Every `policy_versions[].policy_id` exists in `policies[]`
- Every `procedures[].policy_links[]` exists in `policies[]`
- Every `controls[].policy_links[]` exists in `policies[]`
- Every `cases[].policy_versions_in_scope[]` exists in `policy_versions[]`
- Every `cases[].linked_evidence_ids[]` exists in `evidence[]`
- Every `cases[].precedent_tags[]` exists in `precedent_tags[]`
- Same set of checks for `decisions`

### Procedure topology checks
- Every transition `from` and `to` state exists for the procedure
- No orphan states (optional but recommended)
- Detect unreachable states (optional, nice)

---

## 4) Evidence Type Mapping Table (for Option A)

Default mapping (hardcode in loader, or keep as config):

| Seed evidence.type label | EvidenceType ID |
|--------------------------|-----------------|
| Plan Document | EVT-PLAN_DOC |
| Calculation Run Log | EVT-RUN_LOG |
| Reconciliation Report | EVT-RECON_REPORT |
| Approval Record | EVT-APPROVAL |
| Exception/Dispute Evidence Bundle | EVT-CASE_BUNDLE |
| Territory/Quota Change Impact Analysis | EVT-IMPACT_ANALYSIS |

If a label is unknown:
- set `EVT-UNKNOWN`
- store original label in `metadata.source_type_label`
- log warning (not hard fail)

---

## 5) Loader Output Contract

Return a single structured result:

```json
{
  "pack_id": "spm-governance-pack",
  "pack_version": "1.0.0",
  "inserted": { "SpmPolicy": 0, "SpmPolicyVersion": 0, "...": 0 },
  "updated": { "SpmPolicy": 0, "SpmPolicyVersion": 0, "...": 0 },
  "skipped": { "SpmPolicy": 0, "SpmPolicyVersion": 0, "...": 0 },
  "warnings": ["..."],
  "errors": []
}
```

Hard fail if any FK validation fails.

---

## 6) Minimal "Ready" Test (acceptance)

A successful seed load must satisfy:

| Entity | Expected Count |
|--------|---------------|
| PrecedentTag | 5 |
| SpmPolicy | 15 |
| SpmPolicyVersion | 15 |
| SpmProcedure | 4 |
| SpmControl | 10 |
| EvidenceItem | 6 |
| SpmCase | 4 |
| SpmDecision | 5 |

Join tables must have non-zero rows (cases + decisions linked correctly).

---

## 7) Script Location

**Target:** `/Users/toddlebaron/dev/aicr/apps/aicr/scripts/seed-spm-governance-pack.ts`

**Usage:**
```bash
cd /Users/toddlebaron/dev/aicr/apps/aicr
DATABASE_URL="..." npx tsx scripts/seed-spm-governance-pack.ts
```

---

## 8) AICR Repo Paths (Canonical)

| Artifact | Path |
|----------|------|
| Prisma Schema | `apps/aicr/prisma/schema.prisma` (main) or `packages/database/prisma/schema.prisma` |
| Seed Scripts | `apps/aicr/scripts/` |
| Packs Root | `packages/packs/` |
| SPM Pack Target | `packages/packs/domain/spm-governance-pack/` |

---

## 9) Example Seed Script Skeleton

```typescript
// apps/aicr/scripts/seed-spm-governance-pack.ts

import { PrismaClient } from '@prisma/client';
import seedData from '../../../packages/packs/domain/spm-governance-pack/seed/SEED_DATASET.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Loading SPM Governance Pack v1.0.0...');

  const result = {
    pack_id: 'spm-governance-pack',
    pack_version: '1.0.0',
    inserted: {} as Record<string, number>,
    updated: {} as Record<string, number>,
    skipped: {} as Record<string, number>,
    warnings: [] as string[],
    errors: [] as string[],
  };

  await prisma.$transaction(async (tx) => {
    // Phase 1: Dictionary tables
    // ... upsert PrecedentTag, SpmPolicy

    // Phase 2: Versioned rules
    // ... upsert SpmPolicyVersion with FK validation

    // Phase 3: Procedures
    // ... upsert SpmProcedure, ProcedureState, ProcedureTransition, ProcedurePolicy

    // Phase 4: Controls
    // ... upsert SpmControl, ControlPolicy

    // Phase 5: Evidence
    // ... upsert EvidenceType, EvidenceItem

    // Phase 6: Cases
    // ... upsert SpmCase, CasePolicyVersion, CaseEvidence, CasePrecedentTag

    // Phase 7: Decisions
    // ... upsert SpmDecision, DecisionPolicyVersion, DecisionEvidence, DecisionPrecedentTag
  });

  console.log('Seed complete:', JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
