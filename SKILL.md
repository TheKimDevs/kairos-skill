---
name: kairos
description: Use the KairOS Agent CLI and HTTP tool API — login and call calendar, task, lead, and budget tools. Use when scheduling events, managing tasks, working the job pipeline, or recording expenses/income.
---

# KairOS (Agent CLI)

You are an **AI Agent**. The **User** owns the data. The **KairOS** holds calendar, tasks, leads, and budget. You reach KairOS through the **Agent CLI** on the user’s machine.

**Always authenticate** (`kairos whoami` → `Token valid: yes`) before calling tools.

## Prerequisites

1. **Agent CLI** on the user’s machine — `npm install -g @kairos/agent-cli`
2. **User login** — `kairos login --api-url <kairos-url>` (JWT in `~/.config/kairos/credentials.json`). The user authorizes in the browser; the dashboard shows the exact URL.
3. **This skill** — `npx skills add <slug>` (slug from the user’s KairOS dashboard).

## Calling tools

Prefer the CLI (handles auth headers):

```bash
# Calendar
kairos call query_calendar '{"from":"2026-05-18","to":"2026-05-25"}'
kairos call schedule_event '{"title":"Standup","start":"2026-05-19T09:00:00Z","end":"2026-05-19T09:30:00Z"}'

# Tasks
kairos call query_tasks '{"activeOnly":true}'
kairos call create_task '{"title":"Follow up with Acme","priority":"high"}'
kairos call update_task '{"id":"<task-uuid>","status":"in_progress"}'
kairos call complete_task '{"id":"<task-uuid>"}'
kairos call schedule_task '{"taskId":"<task-uuid>","start":"2026-05-19T14:00:00Z","end":"2026-05-19T15:00:00Z"}'

# Leads
kairos call query_leads '{"activeOnly":true,"sortBy":"ev","sortDir":"desc"}'
kairos call create_lead '{"company":"Acme","role":"Staff Engineer"}'
kairos call advance_lead_stage '{"leadId":"<lead-uuid>","toStage":"phone_screen"}'
kairos call get_lead_ev '{"leadId":"<lead-uuid>"}'

# Budget
kairos call record_expense '{"amount":42.5,"currency":"USD","date":"2026-05-22","note":"Coffee"}'
kairos call record_income '{"amount":5000,"currency":"USD","date":"2026-05-01"}'
kairos call query_budget '{"month":"2026-05"}'

# Cross-feature
kairos call query_today '{}'
kairos call query_expected_value_summary '{"activeOnly":true}'

kairos tools
kairos whoami
```

Everyday use in your AI agent: ask in plain language (e.g. _What's on my calendar today?_) — see [auth.md](references/auth.md).

## Safety (v1)

- **No delete tools** — do not delete events, tasks, or budget via API.
- Only operate on the authenticated user's data.
- Re-run `kairos login` when `whoami` shows `Token valid: no` or tools return **401** (~1 hour JWT, no refresh).

## References

- [auth.md](references/auth.md) — login, flags, troubleshooting
- [tools.md](references/tools.md) — tool names, payloads, API shape
