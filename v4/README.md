# WinBridge Recovery 4.0.0

This directory contains the first integrated WinBridge Recovery 4.0 source release.

> Status: `4.0.0` first integrated release. The ordinary desktop demo keeps real repair disabled unless the explicit packaged repair capability is enabled.

## Projects

- `design-lab`: React/Vite interface, themes, structured terminal, fluid progress UI, settings, and mini games.
- `runtime`: Electron shell, isolated Worker, bounded logs, plugin asset bridge, integrated 4.0.0 engine snapshot, tests, and packaging validation.

Real repair is disabled by default. The desktop demonstration build therefore cannot modify plugin state unless it is deliberately launched with the packaged repair capability flag.

## Local development

```powershell
cd v4\design-lab
npm ci
npm run build

cd ..\runtime
npm ci
npm run sync:frontend
npm run verify:frontend
npm test
npm run verify:snapshot
npm run pack:check
npm start
```

`pack:check` validates packaging inputs without creating a package.

## Collaboration

Base follow-up development on the integrated 4.0 branch after it is reviewed. Create focused feature branches, keep commits scoped to real changes, and run the relevant checks before merging.

Do not commit `node_modules`, build output, local logs, screenshots, caches, secrets, personal paths, or signing material.

## Current boundaries

- Real repair remains gated and disabled in ordinary demonstration runs.
- The mature 3.1.1 repair core remains preserved inside the verified 4.0.0 wrapper snapshot.
- Final publication still requires the packaged Windows build and live acceptance evidence recorded for this commit.
