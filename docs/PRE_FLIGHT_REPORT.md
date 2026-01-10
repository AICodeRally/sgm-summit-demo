# Pre-Flight Validation Report
**Date**: 2026-01-09
**System**: sgm-sparcc-demo
**Phase**: Phase 0 - Pre-Flight Validation

---

## Executive Summary

**CRITICAL FINDING**: The sgm-sparcc-demo project is configured to use the AICR platform production database, but the schemas are **completely incompatible**. The SGM project needs its own isolated schema.

### Key Issues
1. ❌ **Schema Mismatch**: Prisma schema defines SGM tables, but Neon database has AICR platform tables
2. ❌ **No SGM Tables**: client_engagements, client_plan_analyses, client_gap_analyses DO NOT EXIST
3. ❌ **Configuration Conflict**: BINDING_MODE=prisma (invalid), should be 'live'
4. ❌ **Provider Mismatch**: Prisma schema.prisma has provider="sqlite" but DATABASE_URL points to PostgreSQL

---

## Current Database State

### Neon Database
- **URL**: `postgresql://neondb_owner:...@ep-patient-fog-afrytl4v-pooler.c-2.us-west-2.aws.neon.tech/neondb`
- **Schema**: `public` only (no `sgm_summit_demo` schema)
- **Tables**: 110 tables (AICR platform v3)
- **Purpose**: Production AICR platform database

### Table Count
```
Total tables: 110
Sample tables:
- pack_catalog_v4
- tenant_packs_v4
- rally_catalog
- spine_documents
- kb_documents
- tenants (AICR schema)
- users (AICR schema)
- proposals
- policies
```

### Tenants Table (AICR Production Schema)
```sql
Column          | Type
----------------|---------------------------
tenant_id       | text (PK)
name            | text
partner_id      | uuid
tenant_type     | text
status          | text
lifecycle_stage | text
channel_type    | channel_type (enum)
billing_mode    | text
created_at      | timestamp with time zone
created_by      | text
```

### SGM Prisma Schema (MISMATCH!)
```sql
Column     | Type
-----------|------------------
id         | String (cuid) PK
name       | String
slug       | String (unique)
tier       | TenantTier (enum)
status     | TenantStatus (enum)
features   | Json
settings   | Json
createdAt  | DateTime
updatedAt  | DateTime
expiresAt  | DateTime?
```

**Result**: ❌ **COMPLETELY INCOMPATIBLE**

---

## Missing SGM Tables

### Client Dashboard Tables (Defined in Prisma, NOT in DB)
- ❌ `client_engagements` - NOT FOUND
- ❌ `client_plan_analyses` - NOT FOUND
- ❌ `client_gap_analyses` - NOT FOUND
- ❌ `client_roadmap_phases` - NOT FOUND

### Core SGM Tables (Defined in Prisma, NOT in DB)
- ❌ `tenants` (SGM schema) - Conflicts with AICR tenants
- ❌ `users` (SGM schema) - Conflicts with AICR users
- ❌ `policies` (SGM schema) - Conflicts with AICR policies
- ❌ `territories` (SGM schema) - May conflict
- ❌ `documents` (SGM schema) - May conflict
- ❌ `plans` (SGM schema) - May conflict
- ❌ `approvals` (SGM schema) - May conflict
- ❌ `committees` (SGM schema) - May conflict
- ❌ `audit_log` (SGM schema) - Conflicts with audit_log in AICR
- ❌ `cases` (SGM schema) - May work
- ❌ `plan_templates` (SGM schema) - May work
- ❌ `governance_frameworks` (SGM schema) - May work
- ❌ `uploaded_documents` (SGM schema) - May work

---

## Configuration Analysis

### .env File (Current)
```bash
NEXT_PUBLIC_SPARCC_MODULE=sgm
STORAGE_MODE=prisma
DATABASE_URL=postgresql://neondb_owner:npg_VNZxTHq60mcU@ep-patient-fog-afrytl4v-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
BINDING_MODE=prisma  # ❌ INVALID - should be 'live'
```

### schema.prisma (Current)
```prisma
datasource db {
  provider = "sqlite"  # ❌ WRONG - should be "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Root Cause Analysis

### Problem 1: Shared Database
The sgm-sparcc-demo project is trying to use the same Neon database as the AICR platform, but:
1. AICR platform uses 110 tables with a specific schema
2. SGM needs 31+ tables with a DIFFERENT schema
3. Table names conflict (tenants, users, policies, documents, etc.)

### Problem 2: No Schema Isolation
- DATABASE_URL doesn't specify a schema parameter
- All tables would go into `public` schema
- Would conflict with existing AICR tables

### Problem 3: Configuration Errors
1. `BINDING_MODE=prisma` is invalid (should be 'live', 'synthetic', or 'mapped')
2. `provider = "sqlite"` in schema.prisma but DATABASE_URL is PostgreSQL
3. No schema parameter in DATABASE_URL for multi-tenancy

---

## Recommended Solution

### Option 1: Dedicated Schema in Neon (RECOMMENDED)
Create isolated `sgm_summit_demo` schema in existing Neon database:

**Pros**:
- ✅ Single database to manage
- ✅ True PostgreSQL features
- ✅ Neon auto-scaling
- ✅ Isolated from AICR platform
- ✅ Can share authentication if needed

**Configuration**:
```bash
# .env
DATABASE_URL=postgresql://neondb_owner:npg_VNZxTHq60mcU@ep-patient-fog-afrytl4v-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&schema=sgm_summit_demo
BINDING_MODE=live
```

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Steps**:
1. Create `sgm_summit_demo` schema in Neon
2. Update DATABASE_URL with `&schema=sgm_summit_demo`
3. Update schema.prisma provider to "postgresql"
4. Update BINDING_MODE to "live"
5. Run `prisma migrate dev` or `prisma db push`
6. Verify all 31 tables created in sgm_summit_demo schema

### Option 2: Separate SQLite Database (NOT RECOMMENDED)
Keep existing schema.prisma with provider="sqlite" and use local file:

**Pros**:
- ✅ No network latency
- ✅ Easy development

**Cons**:
- ❌ Not "Full Prisma (PostgreSQL)" per user requirement
- ❌ No concurrent access
- ❌ SQLite limitations
- ❌ Harder to deploy

---

## GovLens Integration Status

### Current State
- ✅ GovLens Python prototype exists (`govlens_prototype/`)
- ✅ 20 plans analyzed (output JSON files exist)
- ✅ Import script created (`/scripts/import-govlens-analyses.ts`)
- ❌ Import NOT run (client_plan_analyses table doesn't exist)

### Post-Migration Tasks
1. Create all SGM tables in new schema
2. Re-run import script to populate client_plan_analyses
3. Verify client dashboard pages work
4. Integrate AI validation (Phase 9)

---

## Data Backup Status

### AICR Platform Database
- ⚠️ **Shared database with production AICR platform**
- ✅ No SGM data exists yet (no risk of data loss)
- ✅ AICR platform tables intact (110 tables)

### SGM Local Data
- ✅ GovLens analysis outputs backed up in `govlens_prototype/output/`
- ✅ 20 *_gap_analysis.json files preserved
- ✅ Source compensation plans in `data/plans/` or specified location

**Recommendation**: No backup needed at this stage - no SGM data in database yet.

---

## Next Steps (Phase 1)

1. ✅ **Decision Made**: Use dedicated `sgm_summit_demo` schema in Neon
2. Create `sgm_summit_demo` schema in Neon database
3. Update .env: `DATABASE_URL` with `&schema=sgm_summit_demo`, `BINDING_MODE=live`
4. Update schema.prisma: `provider = "postgresql"`
5. Run Prisma migration to create all SGM tables
6. Validate schema isolation
7. Re-import GovLens analyses

---

## Risk Assessment

### High Risk
- ✅ **MITIGATED**: No risk of breaking AICR platform (no SGM tables exist yet)
- ⚠️ **MEDIUM**: Schema migration may fail if Prisma types incompatible with PostgreSQL
- ⚠️ **MEDIUM**: Missing live providers will break API routes during migration

### Medium Risk
- ⚠️ **MEDIUM**: DATABASE_URL change requires server restart
- ⚠️ **MEDIUM**: Existing development data will be lost (but no production data exists)

### Low Risk
- ⚠️ **LOW**: GovLens data can be re-imported from JSON files
- ⚠️ **LOW**: Frontend may break temporarily during migration

---

## Success Criteria

✅ Phase 0 Complete:
- [x] Database state documented
- [x] Schema mismatch identified
- [x] Root cause analyzed
- [x] Solution recommended
- [x] Risk assessment complete

Next: Phase 1 - Configuration Foundation
