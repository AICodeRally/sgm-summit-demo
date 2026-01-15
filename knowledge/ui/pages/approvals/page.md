---
route: /approvals
title: Approvals
description: Review and route governance approvals.
owner: TBD
lastUpdated: 2026-01-15
---

# Approvals

## Purpose
Manage approval workflows for documents, plans, and exceptions with SLA visibility.

## When to use
Use this page when approvals are pending, expiring, or need escalation.

## How to use
1. Filter the queue by status, priority, or committee.
2. Open an approval item to review evidence and policy context.
3. Approve, request changes, or escalate based on governance rules.
4. Review SLA indicators (green, yellow, red) for time sensitivity.

## Key data
Approval status, SLA due dates, approver chain, and linked policy references.

## Data Types
Approval items display a **DataTypeBadge** indicating their classification:
- **Demo** (orange) - Sample approvals for demonstration purposes
- **Template** (teal) - Template-based approval workflows
- **Client** (green) - Production client approvals requiring action

The badge appears next to the approval title in the list view. Demo approvals are useful for training; client approvals require immediate attention based on SLA.

## Related
/approvals/[id], /committees, /audit, /documents, /plans
