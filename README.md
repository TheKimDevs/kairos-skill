# @kairos/skill

KairOS skill package for AI agents.

This package contains the skill instructions in `SKILL.md` for using the KairOS CLI and tool API.

## Install the skill

```bash
npx skills add <owner>/<skill-repo-or-slug>
```

Use your published skill slug/repo so users install only the KairOS skill.

## Prerequisites for users

```bash
npm install -g @kairos/agent-cli
kairos login --api-url https://your-kairos-url.com
kairos whoami
```

## Main files

- `SKILL.md` - user-facing skill instructions
- `references/auth.md` - login and troubleshooting details
- `references/tools.md` - tool names and payload examples
