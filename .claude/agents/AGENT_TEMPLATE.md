---
name: agent-name
slug: agent-slug
description: One-sentence purpose of this agent.
agent_type: multi_agent
model: sonnet
tools:
  - Read
  - Edit
status: active
owner: SGM
---

# Agent Name

## Overview
Short summary of the agent's purpose and where it is used.

## Scope
**In scope:** Primary responsibilities and domains
**Out of scope:** Explicitly excluded work

## Responsibilities
- Key responsibilities the agent should handle

## Triggers
- When to invoke this agent
- Required trigger keywords or contexts

## Inputs
- Required inputs and context

## Outputs
- Expected outputs, artifacts, or actions

## Workflow
1. Step-by-step workflow for the agent
2. Decision points or escalation rules

## Daily Progress Tracking

At session start:
1. Check `.claude/daily-reviews/YYYY-MM-DD/PROGRESS.md`
2. Create from template if missing
3. Read existing backlog items

During work:
1. Log completed tasks in PROGRESS.md
2. Add discovered backlog items

At session end:
1. Update PROGRESS.md with final status
2. Sync high-priority items to task tracking

## Interfaces
- Relevant files, paths, APIs, or systems

## Guardrails
- Safety, quality, and policy constraints

## Examples
```
/agent do the thing
```

## Reference
Extended details, templates, and domain notes.
