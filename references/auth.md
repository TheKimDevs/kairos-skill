# KairOS agent authentication

Agent-facing auth reference. Requires the **kairos-cli** npm package (`npm install -g kairos-cli`). **Setup order:** [SKILL.md § Setup](../SKILL.md#setup-hosted--production).

## Entities

- **User** — signs in to KairOS and mints an API token at **Settings → API Tokens**
- **AI Agent** — you; use this skill and the CLI
- **KairOS** — hosted app at **https://kairos.querobines.com**; stores data and validates API tokens

Prefer plain language (_What's on my calendar and tasks today?_) instead of exposing raw `kairos call` JSON to the user.

## API tokens (the one auth path)

Auth is a long-lived **`kairos_sk_` API token**. There is no browser login flow — the **user** creates the token in KairOS **Settings → API Tokens** (recommend: scope it to the tools you need, and set an expiry rather than "never"). The token is shown **once** — the user gives it to you to store securely.

Use it one of two ways:

```bash
# Preferred for headless / always-on: env var — no login, no credentials file
export KAIROS_API_TOKEN="kairos_sk_…"
kairos call query_today '{}'

# Or persist it to the credentials file
kairos login --token kairos_sk_…
```

API tokens **don't expire client-side** (the server enforces revocation/expiry on every call), so `kairos whoami` reports `Token valid: yes` and tools keep working until the user revokes the token. If a tool returns **401**, the token was revoked or expired — the user must mint a new one. A **403** means the token is scoped and the tool isn't in its allowlist.

## Agent setup flow

1. `kairos whoami` — if `Token valid: no` or `Not logged in`, a token is needed.
2. Ask the **user** to create one at **https://kairos.querobines.com** → Settings → API Tokens and share it with you.
3. `kairos login --token kairos_sk_…` (or export `KAIROS_API_TOKEN`).
4. `kairos whoami` — expect `Token valid: yes`.

## Commands

```bash
kairos whoami
kairos login --token <kairos_sk_...> [--api-url <url>]
kairos logout
kairos tools
kairos call <toolName> '<json>'
```

| Flag / env             | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `--token <kairos_sk_>` | Save the API token to the credentials file      |
| `--api-url <url>`      | Non-default API base URL (self-host, local dev) |
| `KAIROS_API_TOKEN` env | API token used directly (no login/file; wins)   |
| `KAIROS_API_URL` env   | API base URL for the env-token path             |

## Credentials

`~/.config/kairos/credentials.json` (mode `600`):

```json
{
  "api_url": "https://kairos.querobines.com",
  "access_token": "kairos_sk_…",
  "expires_at": "",
  "email": null
}
```

`expires_at` is always empty — the server enforces expiry/revocation on every request. A non-`kairos_sk_` `access_token` (stale credentials from the retired browser-login flow) is treated as logged out; re-run `kairos login --token …`.

**Web UI after CLI writes:** [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli).

## Troubleshooting

| Symptom                                 | Fix                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `Token valid: no` / `Not authenticated` | `kairos login --token <kairos_sk_…>` (user mints one in Settings)      |
| `fetch failed`                          | KairOS unreachable — check network or try again                        |
| Tool **401**                            | Token revoked/expired — user mints a new one in Settings → API Tokens  |
| Tool **403**                            | Token is scoped and the tool isn't in its allowlist                    |
| `kairos login` asks for a token         | Expected — browser login is retired; always pass `--token`             |
| CLI works, web UI stale                 | Same user? See [SKILL.md § Web app vs CLI](../SKILL.md#web-app-vs-cli) |
