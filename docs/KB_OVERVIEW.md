# Documentation Architecture

This project maintains three documentation layers:

1) Human docs in `docs/`
2) In-app KB in `knowledge/ui/pages/`
3) Agent/AI guides in `AGENTS.md` plus pointers (`CLAUDE.md`, `AI.md`, `.agents/README.md`)

## Human Docs (`docs/`)
- Audience: operators, admins, stakeholders.
- Include workflows, policies, deployment, and change notes.
- Update when UI or governance behavior changes.

## In-App KB (`knowledge/ui/pages/`)
- Audience: end users inside the UI.
- One KB file per route (see `docs/KB_PAGE_INDEX.md`).
- Each file documents the page purpose, how to use it, and key data.
- These KB files are surfaced in the UI and to the AskSGM assistant.

## Agent/AI Docs
- `AGENTS.md` is the canonical source of truth.
- `CLAUDE.md`, `AI.md`, and `.agents/README.md` point back to `AGENTS.md`.

## Update Workflow
1. Edit the KB file for the page you changed.
2. Update human docs in `docs/` if workflows changed.
3. Keep `AGENTS.md` in sync for agent-visible conventions.

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: see `docs/KB_PAGE_INDEX.md`.
