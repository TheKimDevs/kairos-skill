# KairOS agent authentication

## Entities

- **User** — signs in to KairOS and runs `kairos login` to approve the CLI
- **AI Agent** — you; use this skill and the CLI
- **KairOS** — API host (`--api-url`); stores data and validates JWTs

## User setup (hosted)

1. `npm install -g @kairos/agent-cli` (on the user’s machine)
2. `npx skills add <slug>` — slug from the user’s KairOS dashboard
3. User runs `kairos login --api-url https://your-kairos.example.com` — browser **Authorize** on KairOS
4. `kairos whoami` — expect `Token valid: yes`

Prefer plain language (_What's on my calendar and tasks today?_) instead of exposing raw `kairos call` JSON to the user.

## Agent login (automated setup)

`kairos login` blocks until the user clicks **Authorize** (default timeout 5 minutes). Do **not** background the command.

1. `kairos whoami` — if `Token valid: no`, login is required.
2. Confirm the KairOS web app is running at the user’s URL.
3. `kairos login --no-open --api-url <url>` — user opens the printed URL and clicks **Authorize**.
4. Wait for `Saved credentials to …` on stdout (stderr shows progress while waiting).
5. On timeout or `CODE_EXPIRED`, run a **fresh** login and use only the **new** URL.

## Commands

```bash
kairos whoami
kairos login [--no-open] [--api-url <url>] [--timeout <sec>]
kairos logout
```

| Flag              | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `--no-open`       | Print URL only; do not open a browser (agents) |
| `--timeout <sec>` | Max wait for authorize (default 300, min 30)   |
| `--api-url <url>` | KairOS app URL; stored in credentials          |

## Credentials

`~/.config/kairos/credentials.json` (mode `600`):

```json
{
  "api_url": "https://your-kairos-site.example.com",
  "access_token": "<jwt>",
  "expires_at": "2026-05-18T12:00:00.000Z"
}
```

v1 has **no refresh token**. On expiry or tool **401**, run `kairos login` again (~1h).

## Troubleshooting

| Symptom                                 | Fix                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Login silent after URL                  | Waiting for **Authorize** — check stderr; user must complete browser step |
| `Login timed out after Ns`              | Re-run login; authorize within 5 minutes                                  |
| `Token valid: no` / `Not authenticated` | `kairos login`                                                            |
| `fetch failed`                          | App down or wrong `--api-url`                                             |
| Redirect to `/login`                    | Sign in on the web app, then authorize again                              |
| `CODE_EXPIRED` / `PKCE_INVALID`         | Fresh login; use the **latest** URL only                                  |
| Tool **401**                            | `kairos login`                                                            |

## Token exchange errors

`POST /api/cli/device/token` returns `{ "error": "…", "code": "…" }`:

| `code`              | Meaning                                  |
| ------------------- | ---------------------------------------- |
| `PKCE_INVALID`      | Verifier/challenge mismatch              |
| `CODE_EXPIRED`      | Code used, unknown, or past 5-minute TTL |
| `REDIRECT_MISMATCH` | Invalid redirect URI                     |
| `INTERNAL`          | Server configuration error               |
