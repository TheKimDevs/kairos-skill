# KairOS AI tools (v1)

**CLI:** install `kairos-cli` from npm (`npm install -g kairos-cli`), then `kairos call …`.

**KairOS** base URL: **https://kairos.querobines.com** (stored as `api_url` in credentials after login).

Agents call tools via the CLI only. The web app has no dashboard quick-add for tools.

## Before calling tools

1. `kairos whoami` — need `Token valid: yes` (user completed login).
2. If not, follow [auth.md](./auth.md) — user must authorize on KairOS.
3. KairOS must be reachable at that base URL.

Auth: `Authorization: Bearer <access_token>` from `~/.config/kairos/credentials.json`.

## After calling tools

- Writes persist immediately in the database.
- User can verify in **Settings → Activity** (`ai_tool_call_log`).
- Open browser tabs may lag ~60s — see [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli).

## HTTP shape

**Success:** `{ "ok": true, "data": <tool result> }`

**Error:** `{ "ok": false, "error": "<message>" }` (400 validation / tool error, 401 unauthorized, 404 unknown tool)

List tools: `GET /api/ai/tools` → `{ "ok": true, "data": [{ "name", "description", "implemented" }] }`

## Calendar

### `query_calendar`

`POST /api/ai/tools/query_calendar`

```json
{
  "from": "2026-05-18",
  "to": "2026-05-25"
}
```

Returns calendar events (ISO date strings for `start`/`end`).

### `schedule_event`

`POST /api/ai/tools/schedule_event`

```json
{
  "title": "Meeting",
  "start": "2026-05-19T14:00:00.000Z",
  "end": "2026-05-19T15:00:00.000Z",
  "allDay": false,
  "calendarId": "personal",
  "description": "optional",
  "recurrence": { "unit": "week", "interval": 1, "byweekday": [0, 2, 4] }
}
```

Optional `recurrence` for **fixed calendar series** (meetings, classes) — `unit`: `day`|`week`|`month`|`year`, `interval` (default 1), optional `byweekday` (0=Mon…6=Sun), `until`, `count`. For chores that reset when done, use task `recurrence` (Tasks below).

### `update_event`

`POST /api/ai/tools/update_event`

```json
{
  "id": "<uuid>",
  "title": "Updated title"
}
```

### `cancel_event`

Deletes a user-created calendar event. First call without `confirmed: true` returns `confirmation_required`; retry with `confirmed: true` only after the user approves.

`POST /api/ai/tools/cancel_event`

```json
{
  "id": "<uuid>",
  "confirmed": true
}
```

## Tasks

Task objects use ISO strings for `dueAt`, `createdAt`, and `updatedAt`.

**Status values:** `backlog`, `todo`, `in_progress`, `blocked`, `done`, `dropped`

**Priority values:** `low`, `medium`, `high`

**Recurring tasks** are the right home for personal recurring reminders and chores (e.g. "clean the water filter every 3 months") — do **not** use repeating calendar events or cron jobs for these. A task carries an optional `recurrence`:

```json
{
  "unit": "month",
  "interval": 3,
  "anchor": "completion"
}
```

- `unit`: `day` | `week` | `month` | `year`. `interval`: every N units (default 1).
- `anchor`: `completion` (next due counts from when you finish it — default, best for chores) or `due` (next due counts from the previous due date — best for fixed schedules).
- Optional `until` (ISO date) and `count` (total occurrences) bound the series.

### `query_tasks`

`POST /api/ai/tools/query_tasks`

```json
{
  "status": "todo",
  "activeOnly": true,
  "leadId": "<uuid>",
  "dueAtFrom": "2026-05-01T00:00:00.000Z",
  "dueAtTo": "2026-05-31T23:59:59.000Z"
}
```

All fields optional. `activeOnly: true` excludes dropped tasks only (not `done`). `dueAtFrom` / `dueAtTo` filter by due-date range (tasks without a due date are excluded). Returned tasks include their `recurrence` when set.

### `create_task`

`POST /api/ai/tools/create_task`

```json
{
  "title": "Clean water filter",
  "description": "optional",
  "status": "todo",
  "priority": "high",
  "dueAt": "2026-05-22T17:00:00.000Z",
  "leadId": "<uuid>",
  "recurrence": { "unit": "month", "interval": 3, "anchor": "completion" }
}
```

`status` defaults to `todo` when omitted. `recurrence` is optional (omit for a one-off task).

### `update_task`

`POST /api/ai/tools/update_task`

```json
{
  "id": "<uuid>",
  "title": "Renamed task",
  "status": "in_progress",
  "dueAt": "2026-05-22T17:00:00.000Z",
  "recurrence": { "unit": "week", "interval": 1, "anchor": "completion" }
}
```

At least one field besides `id` is required. Set `recurrence` to change it, `"recurrence": null` to clear it, or `"recurrence": { ..., "paused": true }` to stop spawning without losing the rule.

### `complete_task`

`POST /api/ai/tools/complete_task`

```json
{
  "id": "<uuid>"
}
```

Marks the task `done`. For a recurring (non-paused) task it also creates the next occurrence and returns `{ "task": <completed>, "next": <new task or null> }` (`next` is `null` once `until`/`count` is exhausted).

### `schedule_task`

`POST /api/ai/tools/schedule_task`

Creates a calendar event and links it on the task (`scheduledEventId`).

```json
{
  "taskId": "<uuid>",
  "start": "2026-05-19T14:00:00.000Z",
  "end": "2026-05-19T15:00:00.000Z"
}
```

## Leads

Lead objects use ISO strings for milestone `occurredAt` and timestamps.

**Stage values:** `sourced`, `applied`, `phone_screen`, `interview`, `final_round`, `offer`, `negotiation`, `accepted`, `onboarded`, `rejected`, `dropped`

**Comp period:** `hourly`, `monthly`, `yearly`

### `query_leads`

`POST /api/ai/tools/query_leads`

```json
{
  "stage": "interview",
  "activeOnly": true,
  "sortBy": "ev",
  "sortDir": "desc"
}
```

All fields optional. `sortBy` may be `company`, `role`, `stage`, `probability`, `ev`, or `updated_at`.

### `create_lead`

`POST /api/ai/tools/create_lead`

```json
{
  "company": "Acme",
  "role": "Staff Engineer"
}
```

Stage defaults to `sourced`.

### `advance_lead_stage`

`POST /api/ai/tools/advance_lead_stage`

```json
{
  "leadId": "<uuid>",
  "toStage": "phone_screen"
}
```

### `set_lead_probability`

`POST /api/ai/tools/set_lead_probability`

```json
{
  "leadId": "<uuid>",
  "probability": 0.25
}
```

### `set_lead_comp`

`POST /api/ai/tools/set_lead_comp`

```json
{
  "leadId": "<uuid>",
  "amount": 180000,
  "currency": "USD",
  "period": "yearly"
}
```

### `get_lead_ev`

`POST /api/ai/tools/get_lead_ev`

```json
{
  "leadId": "<uuid>"
}
```

## Budget

### `record_expense`

`POST /api/ai/tools/record_expense`

```json
{
  "amount": 42.5,
  "currency": "USD",
  "date": "2026-05-22",
  "note": "Coffee"
}
```

### `record_income`

`POST /api/ai/tools/record_income`

```json
{
  "amount": 5000,
  "currency": "USD",
  "date": "2026-05-01"
}
```

### `query_budget`

`POST /api/ai/tools/query_budget`

```json
{
  "month": "2026-05"
}
```

## Cross-feature

### `query_today`

`POST /api/ai/tools/query_today`

```json
{}
```

Optional `date` (`YYYY-MM-DD`) overrides today.

### `query_expected_value_summary`

`POST /api/ai/tools/query_expected_value_summary`

```json
{
  "activeOnly": true
}
```
