# Henry Schein Integration Guide

This guide explains how to integrate Henry Schein's 49 governance documents into SGM, either as synthetic demo data or as production data for the beta tenant.

## 📦 What's Included

### 1. **Import Script** (`scripts/import-henryschein-docs.ts`)
Production-ready script that imports all 49 Henry Schein documents from the archived BHG project into the SGM database.

**Features:**
- ✅ Imports from archive: `/Users/toddlebaron/dev__archive_20251219_1518/clients/HenrySchien/`
- ✅ Copies files to SGM storage directory
- ✅ Creates database records with metadata
- ✅ Calculates file checksums for integrity
- ✅ Detects and skips duplicates
- ✅ Error handling and detailed logging

### 2. **Synthetic Data** (`lib/data/synthetic/henryschein-documents.data.ts`)
Pre-formatted synthetic data representing all 49 Henry Schein documents for immediate demo use without database setup.

**Features:**
- ✅ 6 critical DRAFT policies (UNDER_REVIEW status)
- ✅ 11 production policies (APPROVED status)
- ✅ 2 framework documents (SGCC & CRB charters)
- ✅ 2 procedures
- ✅ 2 templates
- ✅ 1 checklist (90+ tasks)
- ✅ 2 user guides
- ✅ Full metadata from BHG engagement

## 🎯 Use Cases

### **Use Case 1: Production Import (Recommended for Beta)**

Import actual files from the archive into the Henry Schein tenant database.

**When to use:**
- Henry Schein beta is ready to launch
- You have access to the archived files
- You want full document management (versioning, file storage, etc.)

**Steps:**

1. **Ensure Henry Schein tenant exists:**
   ```bash
   npx tsx prisma/seed-tenants.ts
   ```

2. **Run the import:**
   ```bash
   npx tsx scripts/import-henryschein-docs.ts
   ```

3. **Expected output:**
   ```
   🚀 Starting Henry Schein document import...

   📂 Source: /Users/toddlebaron/dev__archive_20251219_1518/...
   🎯 Target Tenant: henryschein

   ✅ Found tenant: Henry Schein, Inc. (cuid123)
   📁 Storage: /path/to/sgm/storage/cuid123/documents

   📂 Processing 02_POLICIES/DRAFT_FOR_REVIEW (6 files)
      ✅ Imported: HS-SCP-001 - Clawback and Recovery Policy
      ✅ Imported: HS-SCP-002 - Quota Management Policy
      ✅ Imported: HS-SCP-003 - Windfall & Large Deal Policy
      ...

   📊 Import Summary:
      ✅ Imported:  49 documents
      ⏭️  Skipped:   0 documents
      ❌ Errors:    0 documents

   🎉 Import complete!
   ```

4. **Verify in SGM:**
   - Sign in as Henry Schein user (@henryschein.com)
   - Navigate to `/documents`
   - Should see all 49 imported documents

---

### **Use Case 2: Synthetic Demo (Quick Demo)**

Use pre-formatted synthetic data for immediate demos without database setup.

**When to use:**
- Quick demo to stakeholders
- Testing UI/UX without full setup
- Development environment
- Sales presentations

**Steps:**

1. **The data is already available** - just import it:
   ```typescript
   import { ALL_HENRY_SCHEIN_DOCUMENTS, HENRY_SCHEIN_STATS } from '@/lib/data/synthetic';

   // Use in components
   console.log(`Total documents: ${HENRY_SCHEIN_STATS.totalDocuments}`);
   console.log(`Risk exposure: $${HENRY_SCHEIN_STATS.riskExposure.toLocaleString()}`);

   // Display documents
   ALL_HENRY_SCHEIN_DOCUMENTS.forEach(doc => {
     console.log(`${doc.documentCode}: ${doc.title}`);
   });
   ```

2. **Add to existing synthetic document provider** (if needed):
   ```typescript
   // lib/bindings/synthetic/document.synthetic.ts
   import { ALL_HENRY_SCHEIN_DOCUMENTS } from '@/lib/data/synthetic';

   export const syntheticDocuments = [
     ...EXISTING_SPARCC_DOCUMENTS,
     ...ALL_HENRY_SCHEIN_DOCUMENTS,
   ];
   ```

3. **Access in UI:**
   ```typescript
   'use client';

   import { HENRY_SCHEIN_DOCUMENTS } from '@/lib/data/synthetic';

   export function HenryScheinDashboard() {
     const { draftPolicies, productionPolicies } = HENRY_SCHEIN_DOCUMENTS;

     return (
       <div>
         <h2>Henry Schein Documents</h2>
         <p>Draft Policies: {draftPolicies.length}</p>
         <p>Production Policies: {productionPolicies.length}</p>
       </div>
     );
   }
   ```

---

## 📋 Document Breakdown

### **6 Critical DRAFT Policies** (UNDER_REVIEW)

These are the high-priority policies identified by BHG that address $1.75M in risk exposure:

| Code | Title | Risk Exposure | Priority |
|------|-------|---------------|----------|
| HS-SCP-001 | Clawback and Recovery Policy | $500K | HIGH |
| HS-SCP-002 | Quota Management Policy | $300K | HIGH |
| HS-SCP-003 | Windfall & Large Deal Policy | $750K | CRITICAL |
| HS-SCP-004 | SPIF Governance Policy | $200K | MEDIUM |
| HS-SCP-005 | Section 409A Compliance Policy | $50K | CRITICAL |
| HS-SCP-006 | State Wage Law Compliance Policy | $100K | CRITICAL |

**Total Risk**: $1.9M

### **11 Production Policies** (APPROVED)

Already in use at Henry Schein:

1. Sales Crediting Policy
2. Territory Management Policy
3. Payment Timing Policy
4. Ramp Policy
5. Leave of Absence Policy
6. Dispute Resolution Policy
7. Exception Request Policy
8. Plan Amendment Policy
9. Data Accuracy Policy
10. Reporting & Transparency Policy
11. Communication Policy

### **Additional Documents**

- **2 Frameworks**: SGCC Charter, CRB Charter
- **2 Procedures**: Monthly processing, windfall review
- **2 Templates**: Exception form, dispute form
- **1 Checklist**: 90+ task implementation checklist
- **2 Guides**: Rep guide, manager guide

**Total**: 49 documents

---

## 🔑 Key Metadata

Each document includes:

### **Standard Fields**
- `documentCode`: Unique identifier (e.g., HS-SCP-001)
- `title`: Human-readable name
- `documentType`: POLICY, PROCEDURE, TEMPLATE, etc.
- `category`: Sales Compensation, Governance, etc.
- `status`: DRAFT, UNDER_REVIEW, APPROVED, ACTIVE
- `version`: Semantic versioning (1.0.0)
- `effectiveDate`: When document becomes active
- `owner`: Document owner/approver
- `description`: Detailed description of content

### **Compliance Fields**
- `legalReviewStatus`: NOT_REQUIRED, PENDING, APPROVED, REJECTED
- `complianceFlags`: Array of regulatory flags
  - SECTION_409A
  - STATE_WAGE_LAW
  - CA_LABOR_CODE
  - FLSA
  - INTERNAL_CONTROLS

### **Henry Schein-Specific Metadata**
```typescript
{
  consultant: 'Blue Horizons Group',
  riskExposure: 500000, // Per-document risk
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  deliveryPhase: 'Phase 1 - Critical Policies',
  slaBusinessDays: 20,
  projectPhase: 'BHG Consulting Engagement Nov 2025',
}
```

---

## 💻 Code Examples

### **Example 1: Display Henry Schein Dashboard**

```typescript
'use client';

import { HENRY_SCHEIN_DOCUMENTS, HENRY_SCHEIN_STATS } from '@/lib/data/synthetic';

export function HenryScheinDashboard() {
  const { draftPolicies, productionPolicies } = HENRY_SCHEIN_DOCUMENTS;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Henry Schein Governance</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Documents</p>
          <p className="text-3xl font-bold">{HENRY_SCHEIN_STATS.totalDocuments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Risk Exposure</p>
          <p className="text-3xl font-bold text-red-600">
            ${(HENRY_SCHEIN_STATS.riskExposure / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Potential Savings</p>
          <p className="text-3xl font-bold text-green-600">
            ${(HENRY_SCHEIN_STATS.potentialSavings / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Consultant</p>
          <p className="text-xl font-bold">{HENRY_SCHEIN_STATS.consultant}</p>
        </div>
      </div>

      {/* Draft Policies (Critical) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Critical DRAFT Policies</h2>
        <div className="space-y-2">
          {draftPolicies.map(policy => (
            <div key={policy.documentCode} className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{policy.documentCode}: {policy.title}</p>
                  <p className="text-sm text-gray-600">{policy.description}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                  {policy.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Policies */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Production Policies</h2>
        <div className="grid grid-cols-2 gap-4">
          {productionPolicies.map(policy => (
            <div key={policy.documentCode} className="bg-white border border-gray-200 p-4 rounded">
              <p className="font-semibold">{policy.title}</p>
              <p className="text-sm text-gray-500">{policy.documentCode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **Example 2: Filter Documents by Compliance Flag**

```typescript
import { ALL_HENRY_SCHEIN_DOCUMENTS } from '@/lib/data/synthetic';

// Find all documents requiring Section 409A compliance
const section409ADocs = ALL_HENRY_SCHEIN_DOCUMENTS.filter(doc =>
  doc.complianceFlags?.includes('SECTION_409A')
);

console.log(`Documents requiring 409A compliance: ${section409ADocs.length}`);
```

### **Example 3: Calculate Total Risk by Category**

```typescript
import { ALL_HENRY_SCHEIN_DOCUMENTS } from '@/lib/data/synthetic';

const riskByCategory = ALL_HENRY_SCHEIN_DOCUMENTS
  .filter(doc => doc.metadata?.riskExposure)
  .reduce((acc, doc) => {
    const category = doc.category;
    acc[category] = (acc[category] || 0) + doc.metadata.riskExposure;
    return acc;
  }, {} as Record<string, number>);

console.log('Risk by category:', riskByCategory);
```

---

## 🚀 Deployment Checklist

### **For Production Import**

- [ ] Archive directory exists and accessible
- [ ] Henry Schein tenant created (run `seed-tenants.ts`)
- [ ] Database migrated and ready
- [ ] Storage directory writable
- [ ] Import script tested in dev
- [ ] Run production import
- [ ] Verify all 49 documents imported
- [ ] Check file storage locations
- [ ] Test document access in UI
- [ ] Notify Henry Schein users

### **For Synthetic Demo**

- [ ] Synthetic data file created
- [ ] Exported in `index.ts`
- [ ] UI components using data
- [ ] Demo flow prepared
- [ ] Stakeholder presentation ready

---

## 🔍 Troubleshooting

### **Import Script Issues**

**"Tenant 'henryschein' not found"**
- Solution: Run `npx tsx prisma/seed-tenants.ts` first

**"Archive directory not found"**
- Solution: Update `HENRY_SCHEIN_ARCHIVE` path in script
- Or copy archive to expected location

**"Permission denied" when creating storage**
- Solution: Ensure write permissions on storage directory
- Run `chmod -R 755 storage/`

**"File already exists"**
- Solution: Script automatically skips duplicates
- Or delete existing records and re-import

### **Synthetic Data Issues**

**"Cannot find module '@/lib/data/synthetic'"**
- Solution: Ensure `henryschein-documents.data.ts` is in correct location
- Check `index.ts` exports

**"TypeScript errors on import"**
- Solution: Run `npm run db:generate` to update Prisma types
- Restart TypeScript server

---

## 📚 Additional Resources

- **BHG Project Archive**: `/Users/toddlebaron/dev__archive_20251219_1518/clients/HenrySchien/`
- **Gap Analysis**: See archive `/Analysis/Governance Analysis/GAP_ANALYSIS_REQUIRED_VS_EXISTING.md`
- **Risk Assessment**: See archive `/Analysis/Comp Analysis/workbooks/master/BHG_01_HS_Comp_Plan_Analysis_FINAL.xlsx`
- **Multi-Tenancy Setup**: See `MULTI_TENANCY_SETUP.md`
- **Implementation Guide**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🎯 Success Metrics

Track these metrics after Henry Schein goes live:

### **Adoption Metrics**
- Active users (target: 50)
- Documents viewed (target: 500+ in first month)
- Policies approved (target: 6 DRAFT policies within 60 days)

### **Governance Metrics**
- Exception requests submitted (baseline)
- Windfall deals reviewed by CRB (target: 100% compliance)
- Dispute resolution time (target: <30 days)
- Policy compliance rate (target: 95%+)

### **Risk Reduction**
- Uncontrolled windfall incidents (target: 0)
- Exception tracking (target: 100%)
- Audit trail completeness (target: 100%)
- Financial exposure reduction (target: $1M+ annual savings)

---

**Questions?** See `MULTI_TENANCY_SETUP.md` or `IMPLEMENTATION_SUMMARY.md` for more details.
