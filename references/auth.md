# KairOS agent authentication

Agent-facing auth reference. Requires the **kairos-cli** npm package (`npm install -g kairos-cli`). **Setup order:** [SKILL.md § Setup](../SKILL.md#setup-hosted--production).

## Entities

- **User** — signs in to KairOS and runs `kairos login` to approve the CLI
- **AI Agent** — you; use this skill and the CLI
- **KairOS** — hosted app (`--api-url`); stores data and validates JWTs

Use the user's production URL from **Dashboard → Connect your AI agent** or credentials `api_url`, not `localhost`, unless they develop locally.

Prefer plain language (_What's on my calendar and tasks today?_) instead of exposing raw `kairos call` JSON to the user.

## Agent login (automated setup)

`kairos login` blocks until the user clicks **Authorize** (default timeout 5 minutes). Do **not** background the command.

1. `kairos whoami` — if `Token valid: no`, login is required.
2. Confirm KairOS is reachable at the user's URL (browser loads the app).
3. `kairos login --no-open --api-url <url>` — user opens the printed URL and clicks **Authorize**.
4. Wait for `Saved credentials to …` on stdout (stderr shows progress while waiting).
5. On timeout or `CODE_EXPIRED`, run a **fresh** login and use only the **new** URL.

## Commands

```bash
kairos whoami
kairos login [--no-open] [--api-url <url>] [--timeout <sec>]
kairos logout
kairos tools
kairos call <toolName> '<json>'
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

Optional env: `KAIROS_API_URL` overrides default target when set (credentials `api_url` still wins for stored sessions).

**Web UI after CLI writes:** [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli).

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
| CLI works, web UI stale                 | Same user? See [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli)    |

## Token exchange errors

`POST /api/cli/device/token` returns `{ "error": "…", "code": "…" }`:

| `code`              | Meaning                                  |
| ------------------- | ---------------------------------------- |
| `PKCE_INVALID`      | Verifier/challenge mismatch              |
| `CODE_EXPIRED`      | Code used, unknown, or past 5-minute TTL |
| `REDIRECT_MISMATCH` | Invalid redirect URI                     |
| `INTERNAL`          | Server configuration error               |
