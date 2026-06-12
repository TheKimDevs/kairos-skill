# @kairos/skill

Source of truth for the **KairOS agent skill** (published via [skills.sh](https://skills.sh)).

| File                                           | Audience                                     |
| ---------------------------------------------- | -------------------------------------------- |
| [`SKILL.md`](./SKILL.md)                       | AI agents — setup, calling tools, web vs CLI |
| [`references/auth.md`](./references/auth.md)   | Login, flags, credentials, troubleshooting   |
| [`references/tools.md`](./references/tools.md) | Tool names and JSON payloads                 |

**End users** install the skill **and** the npm CLI:

```bash
npx skills add TheKimDevs/kairos-skill    # this skill (skills.sh)
npm install -g kairos-cli       # Agent CLI (npm)
```

Full setup: [`SKILL.md`](./SKILL.md). Use the slug from the user's KairOS dashboard when it differs.

> **Maintainers:** `SKILL.md` and `references/*` sync to the public skills.sh repo — customer-facing only. Use public install commands (`npm install -g kairos-cli`, `npx skills add …`); never link repo-internal paths (`docs/`, monorepo folders).

## Monorepo workflow

Edit files in this directory, then from the repo root:

```bash
pnpm skill:validate   # check SKILL.md frontmatter
pnpm skill:sync       # copy to sibling ../kairos-skill (preserves its .git)
```

Publish the sibling **`kairos-skill`** repo to skills.sh. CLI source in this monorepo: `packages/agent-cli/` (published to npm as `kairos-cli`).
