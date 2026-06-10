# @kairos/skill

KairOS skill package for AI agents — install via skills.sh, then use with `kairos-cli`.

## Install the skill

```bash
npx skills add kairos/kairos
```

Use the slug from the user’s KairOS dashboard if configured (`NEXT_PUBLIC_KAIROS_SKILL_SLUG`).

## User setup (production)

```bash
npm install -g kairos-cli
npx skills add kairos/kairos
kairos login --api-url https://kairos.querobines.com
kairos whoami
kairos tools
```

Copy API URL and skill command from **Dashboard → Connect your AI agent** when available.

## Main files

- `SKILL.md` — agent instructions (setup, tools, web sync)
- `references/auth.md` — login, credentials, troubleshooting, web UI sync
- `references/tools.md` — tool names and payload examples

## Local development (monorepo)

```bash
pnpm skill:link   # symlink .agents/skills/kairos → packages/kairos-skill
pnpm skill:validate
```

Publish updates to skills.sh so `npx skills add` users receive changes.
