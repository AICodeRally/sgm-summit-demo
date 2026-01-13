# Agent Guide (Canonical)

This repo supports multiple AI agents (Codex, Claude, Gemini, Llama). Use this file as the single source of truth and refer to `CLAUDE.md` for the detailed project briefing.

## Repo Paths
- Master repo: `/Users/toddlebaron/dev/aicr` (short name: `aicr`)
- This repo: `/Users/toddlebaron/dev/sgm-summit-demo`
- Add other repos here as they are confirmed.

## Documentation Layers
- Human docs: `docs/`
- In-app KB: `knowledge/ui/pages/` (one KB file per route)
- Agent/AI pointers: `AGENTS.md`, `CLAUDE.md`, `AI.md`, `.agents/README.md`

## Detailed Briefing
- `CLAUDE.md` contains the full project briefing, stack, conventions, and key file map.

## In-App KB Rules
- Every route in `app/**/page.tsx` must have a KB file.
- KB files are indexed in `knowledge/ui/pages/manifest.json`.
- The KB index for humans lives in `docs/KB_PAGE_INDEX.md`.

## KBCC Reporting
- Send repo KB status to KBCC with `npm run kb:report`.
- Env vars: `KBCC_REPORT_URL`, `KBCC_INGEST_TOKEN`, `KBCC_REPO_SLUG` (optional).
- Report endpoint: `/api/kbcc/reports` (set in `KBCC_REPORT_URL`).

## How to Update
1. Update the KB file for the relevant route in `knowledge/ui/pages/`.
2. Update human-facing docs in `docs/` if behavior or workflows change.
3. Keep this file as the canonical agent reference.
