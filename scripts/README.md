# SGM Scripts Directory

This directory contains utility scripts for database operations, data import, and system setup.

## 📜 Available Scripts

### **1. quick-setup.sh**
Automated setup for multi-tenancy and authentication.

```bash
./scripts/quick-setup.sh
```

**What it does:**
- Creates `.env` from `.env.example`
- Generates `NEXTAUTH_SECRET`
- Installs auth dependencies
- Generates Prisma client

**Run first** before any other setup.

---

### **2. import-henryschein-docs.ts**
Imports 49 Henry Schein governance documents from the archived BHG project into the production database.

```bash
npx tsx scripts/import-henryschein-docs.ts
```

**Prerequisites:**
- Henry Schein tenant exists (run `npx tsx prisma/seed-tenants.ts`)
- Archive directory accessible: `/Users/toddlebaron/dev__archive_20251219_1518/clients/HenrySchien/`
- Database migrated and running

**What it imports:**
- 6 DRAFT policies (UNDER_REVIEW)
- 11 production policies (APPROVED)
- 2 frameworks (SGCC & CRB charters)
- 2 procedures
- 2 templates
- 1 checklist
- 2 guides

**Total:** 49 documents representing $1.75M risk exposure identified by BHG Consulting.

**Output:**
```
🚀 Starting Henry Schein document import...
✅ Found tenant: Henry Schein, Inc.
📂 Processing 02_POLICIES/DRAFT_FOR_REVIEW (6 files)
   ✅ Imported: HS-SCP-001 - Clawback and Recovery Policy
   ...
📊 Import Summary:
   ✅ Imported:  49 documents
   ⏭️  Skipped:   0 documents
   ❌ Errors:    0 documents
```

**Storage location:** `storage/{tenant-id}/documents/`

**See also:** `HENRY_SCHEIN_INTEGRATION.md` for detailed documentation.

---

## 🗂️ Related Files

### In `/prisma/`

**seed-tenants.ts** - Creates initial tenants (Demo, Henry Schein, BHG)

```bash
npx tsx prisma/seed-tenants.ts
```

Creates:
- **Demo** tenant (slug: `demo`)
- **Henry Schein** tenant (slug: `henryschein`, tier: BETA)
- **BHG** tenant (slug: `bhg`, tier: PRODUCTION)

### In `/lib/data/synthetic/`

**henryschein-documents.data.ts** - Synthetic data for demos

Import in code:
```typescript
import { ALL_HENRY_SCHEIN_DOCUMENTS, HENRY_SCHEIN_STATS } from '@/lib/data/synthetic';
```

Use for quick demos without database setup.

---

## 🚀 Quick Start Workflow

### **For Production Deployment:**

1. **Setup environment:**
   ```bash
   ./scripts/quick-setup.sh
   ```

2. **Configure Google OAuth** (see `MULTI_TENANCY_SETUP.md`)

3. **Run migrations:**
   ```bash
   npm run db:generate
   npm run db:migrate -- --name add_multi_tenancy_and_auth
   ```

4. **Seed tenants:**
   ```bash
   npx tsx prisma/seed-tenants.ts
   ```

5. **Import Henry Schein documents:**
   ```bash
   npx tsx scripts/import-henryschein-docs.ts
   ```

6. **Start server:**
   ```bash
   npm run dev
   ```

7. **Sign in and set SUPER_ADMIN role:**
   ```bash
   npm run db:studio
   # Update your user role to SUPER_ADMIN
   ```

8. **Access admin panel:**
   - Go to `http://localhost:3003/admin/tenants`
   - View Henry Schein tenant and documents

---

### **For Quick Demo (No Database):**

1. **Use synthetic data in your component:**
   ```typescript
   import { ALL_HENRY_SCHEIN_DOCUMENTS } from '@/lib/data/synthetic';

   export function HenryScheinDemo() {
     return (
       <div>
         <h2>Henry Schein Documents ({ALL_HENRY_SCHEIN_DOCUMENTS.length})</h2>
         {ALL_HENRY_SCHEIN_DOCUMENTS.map(doc => (
           <div key={doc.documentCode}>{doc.title}</div>
         ))}
       </div>
     );
   }
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Show demo** at `http://localhost:3003`

---

## 🔧 Troubleshooting

### **Import Script Fails**

**Error: "Tenant 'henryschein' not found"**
```bash
# Solution: Create tenant first
npx tsx prisma/seed-tenants.ts
```

**Error: "Archive directory not found"**
```bash
# Solution: Update path in script or copy archive
# Edit: scripts/import-henryschein-docs.ts
# Update: HENRY_SCHEIN_ARCHIVE constant
```

**Error: "Permission denied"**
```bash
# Solution: Fix storage permissions
mkdir -p storage
chmod -R 755 storage
```

### **Seed Script Fails**

**Error: "Database connection failed"**
```bash
# Solution: Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Test connection: psql $DATABASE_URL
```

**Error: "Unique constraint violation"**
```bash
# Solution: Tenants already exist, this is safe to ignore
# Or delete and re-create: DELETE FROM tenants WHERE slug IN ('demo', 'henryschein', 'bhg');
```

---

## 📚 Documentation

- **MULTI_TENANCY_SETUP.md** - Complete multi-tenancy setup guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation checklist and next steps
- **HENRY_SCHEIN_INTEGRATION.md** - Henry Schein document import guide

---

## 🆘 Support

For issues or questions:
1. Check documentation files (above)
2. Review error messages carefully
3. Verify prerequisites are met
4. Check database connection and permissions

---

**Last Updated:** December 2025
