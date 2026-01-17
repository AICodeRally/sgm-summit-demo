---
route: /committees
title: Governance Committees
description: Manage SGCC and CRB committee membership, authority, and decision frameworks.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Governance Committees

## Purpose

The Committees page is the management center for SGM's two governance committees: SGCC (Sales Governance Compliance Committee) and CRB (Compensation Review Board). It provides member management, authority documentation, and decision framework visibility.

## When to Use

- **Committee administration**: Review and manage committee membership
- **Authority reference**: Understand committee scope and charter documents
- **Decision frameworks**: Reference approval thresholds and decision options
- **Meeting preparation**: Access member contacts and schedule meetings

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All committee management |
| ADMIN | Full | All committee management |
| MANAGER | Read-only | View committees and decisions |

## Layout

The page uses `ThreePaneWorkspace` with three panels:

| Panel | Purpose |
|-------|---------|
| Left Nav | Committee list + charter documents link |
| Center | Committee details with tabbed content |
| Right Detail | Quick actions (charter, schedule, decisions) |

## Committees

### SGCC (Sales Governance Compliance Committee)

| Attribute | Value |
|-----------|-------|
| Purpose | Policy approval, compliance oversight, exception review |
| Focus | Governance and compliance for compensation programs |
| Members | 7 (with voting/non-voting distinction) |
| Meeting Cadence | Monthly |
| Quorum | Majority of voting members |

### CRB (Compensation Review Board)

| Attribute | Value |
|-----------|-------|
| Purpose | Windfall deal decisions, special exceptions |
| Focus | Large deal exception handling |
| Members | 5 |
| Meeting Cadence | Bi-weekly |
| Quorum | 3 members |

## Header Metrics

Each committee displays key statistics:

| Metric | Description |
|--------|-------------|
| Total Members | Count of all committee members |
| Voting Members | Members with voting rights |
| Meeting Cadence | How often the committee meets |
| Quorum | Minimum attendance for decisions |

## Tabs

### Members Tab
Displays all committee members with:
- Name and profile avatar
- Voting/Non-Voting badge
- Committee role (Chair, Member, Secretary, etc.)
- Job title and department
- Email contact
- Join date

### Authority & Scope Tab
Documents committee powers:
- List of committee authorities
- Link to charter document
- Meeting cadence requirements
- Quorum specifications

### Decision Framework Tab

**For CRB:**
6 windfall deal decision options for deals meeting thresholds:
- >$1M ARR, OR
- >$100K commission, OR
- >50% quarterly quota

Each option includes:
- Decision name
- Description
- Rationale for use
- Example scenario

**For SGCC:**
SPIF approval thresholds by amount:

| Amount | Authority | Timeline |
|--------|-----------|----------|
| <$50K | SGCC | 5 business days |
| $50K - $250K | SGCC + CFO | 10 business days |
| >$250K | SGCC + CEO | 15 business days |

## CRB Decision Options

| # | Option | Description |
|---|--------|-------------|
| 1 | Full Payment | Pay full calculated commission |
| 2 | Capped Payment | Pay up to a maximum cap |
| 3 | Deferred Payment | Split payment over multiple periods |
| 4 | Modified Rate | Apply reduced commission rate |
| 5 | Team Split | Distribute across team members |
| 6 | Decline | Do not pay windfall commission |

## Quick Actions

The right panel provides shortcuts to:
- **View Charter**: Open committee charter document
- **Schedule Meeting**: Create meeting with agenda
- **View Decisions**: Access past decisions log

## API Integration

| Endpoint | Purpose |
|----------|---------|
| `GET /api/committees` | Fetch committees with members and decision options |

Response includes:
- `committees[]` - Array of Committee objects with members
- `decisionOptions[]` - CRB decision option definitions

## Data Types

Committees may display a **DataTypeBadge** indicating:

| Type | Color | Description |
|------|-------|-------------|
| Demo | Orange | Sample committee for demonstration |
| Client | Green | Production committee |

## Workflow

### Committee Review Workflow
```
1. Navigate to Committees
       ↓
2. Select committee from left nav
       ↓
3. Review members in Members tab
       ↓
4. Check authority in Authority tab
       ↓
5. Reference decision framework in Decisions tab
       ↓
6. Take action via Quick Actions (schedule, view charter)
```

### Escalation Path
```
Case submitted → Requires escalation
       ↓
Determine committee (SGCC vs CRB)
       ↓
Committee reviews in meeting
       ↓
Decision logged in Decisions tab
       ↓
Resolution applied to case
```

## Technical Details

- **Component**: `app/(app)/committees/page.tsx`
- **Layout**: `ThreePaneWorkspace` from `components/workspace/`
- **Data Types**: `Committee`, `CRBDecisionOption` from `lib/data/synthetic/committees.data`
- **API**: Fetches from `/api/committees` on mount
- **Default Selection**: First committee selected automatically

## Related Pages

- [Decisions](/decisions) - Committee decision log
- [Approvals](/approvals) - Pending approvals queue
- [Documents](/documents) - Charter documents
- [Cases](/cases) - Cases requiring committee review
- [Oversee Mode](/oversee) - Executive oversight view
- [Audit](/audit) - Audit trail and compliance history
