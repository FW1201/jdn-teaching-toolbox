# Gems Portal Decommission Backup

Date: 2026-05-31

## Source

- Local project: `projects/web/gems-portal`
- Git remote: `https://github.com/FW1201/gems-portal.git`
- Latest local commit observed before migration: `79f583a chore: add .vercel to .gitignore`
- Vercel project name: `gems-portal`
- Vercel project id: `prj_T5p0ryq9i7bE9DfdPyGdhFKVMSkc`
- Vercel org id: `team_nU8RjZUWLKg9G7LII8BJlfh2`

## Migration Result

- 22 Gemini Gems were migrated from `projects/web/gems-portal/index.html` to `src/data/gems.ts`.
- Gems now live in an independent `Gems 資源` section and are not mixed into the no-AI classroom tools.
- Old visitor badge and third-party hit counter were not migrated.

## Decommission Gate

Only delete the old GitHub repository and Vercel project after all of these are true:

- `npm run build` passes for `jdn-teaching-toolbox`.
- Production deployment for `FW1201/jdn-teaching-toolbox` is reachable.
- Gems page shows all 22 migrated Gems.
- Chrome Web Store page shows the 6 extension cards.
- This backup document exists in the new repository.

## Decommission Status

- New production URL: `https://jdn-teaching-toolbox.vercel.app`
- New GitHub repo: `https://github.com/FW1201/jdn-teaching-toolbox`
- Old Vercel project `gems-portal`: removed successfully on 2026-05-31.
- Old GitHub repo `FW1201/gems-portal`: deletion attempted after the new production gate passed, but the command was blocked by API/network access in the current Codex sandbox. The command below remains the required final cleanup step.

## Decommission Commands

```bash
gh repo delete FW1201/gems-portal --yes
vercel project rm gems-portal --yes
```
