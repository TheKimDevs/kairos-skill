# KairOS agent authentication

Agent-facing auth reference. Requires the **kairos-cli** npm package (`npm install -g kairos-cli`). **Setup order:** [SKILL.md § Setup](../SKILL.md#setup-hosted--production).

## Entities

- **User** — signs in to KairOS and runs `kairos login` to approve the CLI
- **AI Agent** — you; use this skill and the CLI
- **KairOS** — hosted app at **https://kairos.querobines.com**; stores data and validates JWTs

Prefer plain language (_What's on my calendar and tasks today?_) instead of exposing raw `kairos call` JSON to the user.

## Agent login (automated setup)

`kairos login` uses the **OAuth 2.0 Device Authorization Grant**: it prints a URL + a short verification code, then **polls** until the user approves in a browser. The browser does **not** need to be on the same machine as the CLI — this is what makes login work from a remote/sandboxed agent host. The command blocks while polling (default timeout 5 minutes); do **not** background it.

1. `kairos whoami` — if `Token valid: no`, login is required.
2. Confirm KairOS is reachable (browser loads **https://kairos.querobines.com**).
3. `kairos login --no-open` — give the printed URL **and verification code** to the user; they open it in any browser and click **Authorize**.
4. Wait for `Saved credentials as <email> to …` on stdout (stderr shows progress while polling).
5. On timeout or `EXPIRED`, run a **fresh** login and use only the **new** code.

## Commands

```bash
kairos whoami
kairos login [--no-open] [--timeout <sec>]
kairos logout
kairos tools
kairos call <toolName> '<json>'
```

| Flag              | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `--no-open`       | Print URL only; do not open a browser (agents) |
| `--timeout <sec>` | Max wait for authorize (default 300, min 30)   |

## Credentials

`~/.config/kairos/credentials.json` (mode `600`):

```json
{
  "api_url": "https://kairos.querobines.com",
  "access_token": "<jwt>",
  "expires_at": "2026-05-18T12:00:00.000Z",
  "email": "you@example.com"
}
```

`email` is the account the token belongs to (shown by `kairos whoami`). v1 has **no refresh token**. On expiry or tool **401**, run `kairos login` again (~1h).

**Web UI after CLI writes:** [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli).

## Troubleshooting

| Symptom                                  | Fix                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Login silent after URL                   | Polling for approval — check stderr; user must complete the browser step |
| `Login timed out after Ns`               | Re-run login; approve within 5 minutes                                   |
| `Token valid: no` / `Not authenticated`  | `kairos login`                                                           |
| `fetch failed`                           | KairOS unreachable — check network or try again                          |
| Redirect to `/login`                     | Sign in on the web app, then approve again                               |
| `EXPIRED` / `Authorization was declined` | Fresh login; use the **latest** code only                                |
| Tool **401**                             | `kairos login`                                                           |
| CLI works, web UI stale                  | Same user? See [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli)   |

## Token poll errors

`POST /api/cli/device/token` returns `{ "error": "…", "code": "…" }`:

| `code`                  | Meaning                                           |
| ----------------------- | ------------------------------------------------- |
| `AUTHORIZATION_PENDING` | Not approved yet — the CLI keeps polling (normal) |
| `ACCESS_DENIED`         | User clicked **Cancel** in the browser            |
| `EXPIRED`               | Device code unknown or past its 10-minute TTL     |
| `PKCE_INVALID`          | Verifier/challenge mismatch                       |
| `INTERNAL`              | Server configuration error                        |
