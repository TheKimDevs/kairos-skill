---
name: kairos-skill
description: Use the KairOS Agent CLI and HTTP tool API — install CLI, login, and call calendar, task, lead, and budget tools. Use when scheduling events, managing tasks, working the job pipeline, or recording expenses/income.
---

# KairOS (Agent CLI)

You are an **AI Agent**. The **User** owns the data. **KairOS** holds calendar, tasks, leads, and budget. You reach KairOS through the **Agent CLI** on the user's machine (`kairos call …`).

**Install both** (agents need the npm CLI and **kairos-skill**):

```bash
npm install -g kairos-cli       # npm — KairOS Agent CLI
```

Add **kairos-skill** with the `npx skills add …` command from the user's KairOS **Dashboard → Connect your AI agent**.

**Always authenticate** (`kairos whoami` → `Token valid: yes`) before calling tools.

## Setup (hosted / production)

Run in order. Copy the skill install command from the user's KairOS **Dashboard → Connect your AI agent**.

### 1. Install CLI and skill

```bash
npm install -g kairos-cli       # npm package — all kairos commands
# kairos-skill — run the `npx skills add …` line copied from the user's dashboard
kairos --help
```

The dashboard command is `npx skills add <github-owner>/kairos-skill` for that host (skills CLI requires a GitHub `owner/repo` source).

### 2. Log in to KairOS

User must use the **same account** in the browser and CLI.

```bash
kairos login
```

For agent-driven setup (no auto-open browser):

```bash
kairos login --no-open
```

User opens the printed URL (in any browser, on any machine) → signs in if needed → clicks **Authorize**. The CLI polls until then, so wait for `Saved credentials as <email> to …` (do not background the command).

### 3. Verify

```bash
kairos whoami    # Token valid: yes
kairos tools     # lists implemented tools
```

Re-run `kairos login` when `Token valid: no` or tools return **401** (~1 hour JWT, no refresh in v1).

**Always-on / headless agents:** the device-flow token lasts ~1 hour. To avoid re-logging in, use a long-lived **API token** instead — the user mints one in **Settings → API Tokens**, then you set `KAIROS_API_TOKEN=kairos_sk_…` (or `kairos login --token kairos_sk_…`). See [auth.md § Headless agents](references/auth.md).

Details: [auth.md](references/auth.md)

## Calling tools

Prefer the CLI (handles auth headers). KairOS is at **https://kairos.querobines.com** (stored as `api_url` in credentials after login).

```bash
# Quick reads
kairos call query_today '{}'
kairos call query_tasks '{"activeOnly":true}'
kairos call query_calendar '{"from":"2026-06-01","to":"2026-06-30"}'

# Writes
kairos call create_task '{"title":"Follow up with Acme","status":"todo","priority":"high"}'
kairos call schedule_event '{"title":"Standup","start":"2026-06-10T09:00:00Z","end":"2026-06-10T09:30:00Z","calendarId":"personal"}'
kairos call create_lead '{"company":"Acme","role":"Staff Engineer"}'
kairos call record_expense '{"amount":42.5,"currency":"USD","date":"2026-06-03","note":"Coffee"}'

# Recurring reminders/chores are TASKS — never cron jobs or repeating events
kairos call create_task '{"title":"Clean water filter","recurrence":{"unit":"month","interval":3,"anchor":"completion"}}'
```

**Recurring tasks:** for any "every N days/weeks/months/years" reminder or chore, set `recurrence` on `create_task` (`unit` = day|week|month|year, `interval` = N, `anchor` = `completion` default or `due`). Completing the task with `complete_task` spawns the next occurrence and returns `{task, next}`. Do **not** model personal recurring reminders as repeating calendar events or external cron jobs.

Full payloads: [tools.md](references/tools.md)

**User-facing language:** answer in plain language (_What’s on my calendar and tasks today?_) — do not dump raw JSON unless debugging.

## Web app vs CLI

| Path                  | How data changes                                                  |
| --------------------- | ----------------------------------------------------------------- |
| **You (CLI / tools)** | `POST /api/ai/tools/:name` → database                             |
| **User (browser)**    | Feature pages (calendar, tasks, leads, budget) via server actions |

There is **no dashboard quick-add** for tools — agents use the CLI.

After you create or update data via CLI:

- **Settings → Activity** on KairOS shows each tool call (`ok`, `error`, `confirmation_required`).
- An **already-open** browser tab may show stale lists for up to ~**60 seconds** (client cache). Tell the user to **navigate away and back** (e.g. Dashboard → Tasks) or **refresh** to see changes immediately.
- **New navigation** to a route always loads fresh server data.

If the user says “I don’t see it in the app,” confirm same login account, suggest navigation/refresh, then `kairos call query_*` to verify the write.

## Safety (v1)

- **Destructive tools** — `cancel_event` requires confirmation (`confirmed: true` on retry). Do not delete tasks or budget via API.
- Only operate on the authenticated user’s data.
- On `confirmation_required`, show the message/preview and retry only after the user approves.

## References

- [auth.md](references/auth.md) — login, flags, credentials, troubleshooting
- [tools.md](references/tools.md) — tool names, payloads, HTTP shape
