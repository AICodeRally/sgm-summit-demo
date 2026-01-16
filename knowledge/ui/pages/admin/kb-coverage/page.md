---
route: /admin/kb-coverage
title: KB Coverage
description: Monitor and manage knowledge base documentation coverage across all pages.
owner: Platform Team
lastUpdated: 2026-01-15
---

# KB Coverage

## Purpose
Provide visibility into knowledge base documentation completeness. Ensures every page in the application has corresponding documentation for the Page KB orb.

## When to use
- When adding new pages to verify KB docs are created
- During content audits to identify gaps
- To monitor documentation health across the platform
- Before releases to ensure 100% coverage

## How to use
1. View the coverage stats at the top (total, covered, missing, percentage).
2. Use filters to show All, Missing KB, or Has KB pages.
3. Click on a route to navigate to that page.
4. Run the fix script to auto-generate missing docs.

## Key data
- **Total Pages**: Number of page.tsx files in the app
- **Covered**: Pages with KB docs
- **Missing**: Pages without KB docs
- **Coverage %**: Percentage of pages with documentation

## CLI Script
```bash
# Check coverage
node scripts/check-kb-coverage.js

# Auto-fix missing docs
node scripts/check-kb-coverage.js --fix

# Output as JSON
node scripts/check-kb-coverage.js --json
```

## Data Types
This is a system admin page. It displays platform operational data, not demo/template/client data.

## Related
/admin/tenants, /settings
