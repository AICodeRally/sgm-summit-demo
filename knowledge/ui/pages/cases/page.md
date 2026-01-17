---
route: /cases
title: Cases Management
description: Exception handling, dispute tracking, and case resolution with SLA monitoring.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Cases Management

## Purpose

Cases Management is the central hub for tracking and resolving compensation exceptions, disputes, and special requests. It uses a ThreePaneWorkspace layout to provide efficient case triage, detailed case views, and resolution workflows.

## When to Use

- **Submitting cases**: File new exception requests, commission disputes, or territory changes
- **Triaging work**: Review and prioritize the case queue by status, type, or priority
- **Investigating issues**: Deep-dive into case details, timeline, and supporting documents
- **Resolving cases**: Document decisions, rationale, and close cases

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All case capabilities |
| ADMIN | Full | All case capabilities |
| MANAGER | Full | Submit cases, resolve team cases |
| USER | Limited | Submit and track own cases |

## Layout

The page uses `ThreePaneWorkspace` with three panels:

| Panel | Purpose |
|-------|---------|
| Left Nav | Quick stats + filters (status, type) |
| Center | Case list with search and sorting |
| Right Detail | Selected case details + timeline |

## Key Metrics

The left navigation displays real-time statistics:

| Metric | Description |
|--------|-------------|
| Active | Sum of NEW + UNDER_REVIEW + PENDING_INFO + ESCALATED |
| Resolved | Cases marked RESOLVED |
| Closed | Cases marked CLOSED |
| Avg Days | Average resolution time in business days |

## Case Statuses

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| NEW | Dot | Blue | Newly submitted, awaiting review |
| UNDER_REVIEW | Clock | Yellow | Being investigated |
| PENDING_INFO | Warning | Yellow | Waiting for additional information |
| ESCALATED | Double Arrow Up | Red | Elevated to committee |
| RESOLVED | Check | Green | Decision made, pending closure |
| CLOSED | X | Gray | Fully completed |

## Case Types

| Type | Icon | Description |
|------|------|-------------|
| EXCEPTION | Warning | Policy exception requests |
| DISPUTE | Bar Chart | Commission calculation disputes |
| TERRITORY_CHANGE | Layers | Territory reassignment requests |
| QUOTA_ADJUSTMENT | Bar Chart | Quota modification requests |
| PLAN_MODIFICATION | File | Compensation plan change requests |

## Priority Levels

| Priority | Indicator | Target SLA |
|----------|-----------|------------|
| URGENT | Double Arrow (red) | Same day |
| HIGH | Arrow Up (orange) | 2 business days |
| MEDIUM | Dash (yellow) | 5 business days |
| LOW | Dash (gray) | 10 business days |

## Primary Features

### Case List
Sortable list of all cases with:
- Search by title or case number
- Filter by status and type
- Demo/real data toggle
- Visual priority indicators
- Financial impact display

### Case Detail View
Complete case information including:
- Case number and type
- Description and context
- Submitted by / Affected rep
- Financial impact
- Related deal links
- Attached documents

### Timeline
Chronological event history showing:
- Status changes
- Actor information
- Notes and comments
- Timestamps

### Resolution Panel
For resolved cases, displays:
- Decision outcome
- Deciding authority
- Decision date
- Rationale documentation

## Data Types

Cases display a **DataTypeBadge** indicating classification:

| Type | Color | Description |
|------|-------|-------------|
| Demo | Orange | Sample cases for training |
| Template | Teal | Template workflows for reference |
| Client | Green | Production cases requiring resolution |

## API Integration

| Endpoint | Purpose |
|----------|---------|
| `GET /api/cases` | Fetch cases with stats and type info |

Response includes:
- `cases[]` - Array of CaseItem objects
- `stats` - Status counts and avg resolution days
- `typeInfo` - Case type metadata with descriptions

## Actions

### For Active Cases
- **Update Case**: Modify case details or status
- **Request Information**: Ask submitter for more details
- **Escalate**: Elevate to committee (when UNDER_REVIEW)

### For All Users
- **New Case**: Submit a new case (button in toolbar)
- **Search**: Find cases by title or case number

## Workflow

### Standard Resolution Flow
```
1. Case submitted (NEW)
       ↓
2. Reviewer picks up case (UNDER_REVIEW)
       ↓
3. If info needed → Request info (PENDING_INFO)
       ↓
4. If complex → Escalate to committee (ESCALATED)
       ↓
5. Decision made (RESOLVED)
       ↓
6. Case archived (CLOSED)
```

## Technical Details

- **Component**: `app/(app)/cases/page.tsx`
- **Layout**: `ThreePaneWorkspace` from `components/workspace/`
- **Data Type**: `CaseItem` from `lib/data/synthetic/cases.data`
- **Demo Toggle**: Supports `demo-only`, `real-only`, and `all` filters
- **API**: Fetches from `/api/cases` on mount

## Related Pages

- [Case SLA](/cases/sla) - SLA tracking and compliance
- [Case Analytics](/cases/analytics) - Trend analysis and predictions
- [Approvals](/approvals) - Approval queue
- [Committees](/committees) - Escalation committees
- [Dispute Mode](/dispute) - Dispute-focused mode view
