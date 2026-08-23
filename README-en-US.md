# WinBridge Recovery

**Independent Windows recovery launcher for GPT/Codex Desktop Browser, Chrome, and Computer Use plugins.**

WinBridge Recovery detects and repairs bundled marketplace, plugin cache, `latest` pointer, runtime path, and registration drift after Desktop updates or restarts. It uses only the official package already installed on the target computer.

> Current formal release: **[WinBridge Recovery 4.0.0 (Latest Release)](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0)**. The release provides Windows x64 installer and portable ZIP assets. The public installer is currently unsigned, so Windows SmartScreen may show its normal warning; always verify the SHA-256 sidecar from the Release page.

> Independent, non-commercial student project. Not affiliated with, sponsored by, or endorsed by OpenAI. Third-party names are used only to identify compatibility. No third-party logos or official application/plugin files are redistributed.

## Explicitly not supported: task/session checkpoint recovery

WinBridge Recovery restores **plugin/runtime infrastructure state**. It is not a Computer Use, Browser, or Agent task-execution checkpoint system.

The project intentionally does **not** implement or promise any of the following:

- restoring the last page Computer Use or Browser clicked or viewed before an interruption;
- reconstructing a click/action trail, screenshot trail, or exact UI step sequence;
- identifying or restoring the exact project files changed as part of a previous Agent task;
- recovering unsaved editor buffers or application-specific undo state;
- reading, reconstructing, replaying, or writing back hidden model context, Agent plans, internal Computer Use/CUA run state, or an internal execution cursor;
- resuming the original Computer Use/Browser task from the exact interrupted step after plugin repair;
- running a background screen recorder, key logger, activity recorder, or broad work-context recorder as an approximation of those capabilities.

A file that was already saved before a plugin failure may remain on disk in its saved state. WinBridge does not treat that as task-state recovery and does not infer what the Agent intended to do next.

The reason is deliberate: WinBridge Recovery is an independent external project and currently has no supported interface that can reliably read and write the complete internal execution state of the official Desktop Computer Use/Browser task runtime. A partial external recorder would still not honestly guarantee exact-step task resumption and would materially expand privacy exposure, permissions, security review, storage, and maintenance cost.

For those reasons, **task/session checkpoint recovery is intentionally not on the WinBridge Recovery roadmap**. This boundary will only be reconsidered if a stable, supported interface becomes available that makes reliable recovery possible without weakening the project's privacy and safety model.

See [SCOPE-AND-LIMITATIONS.md](SCOPE-AND-LIMITATIONS.md) for the complete boundary.

## Feedback

**Tried WinBridge Recovery? Please tell me what happened — success reports are useful too.**

- [Quick feedback: worked / partly worked / did not work](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=quick_feedback.yml)
- [Report a bug](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=bug_report.yml)
- [Request a feature](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=feature_request.yml)
- [Ask a question](https://github.com/zemeng5208/winbridge-recovery/issues/new?template=question.yml)

A one-sentence report is enough. If WinBridge solved your problem, saying so helps validate the recovery path; if it did not, even a short description helps identify what should be fixed next. If you find the project useful, a GitHub Star also helps other users discover it.

Please do **not** post passwords, cookies, tokens, API keys, account/session data, private configuration, or unredacted private paths/logs.

## Project history

WinBridge Recovery is the current maintained implementation of an earlier public, script-based project: **[Codex Desktop Plugin Repair Safety Kit](https://github.com/zemeng5208/codex-desktop-plugin-repair-safety-kit)**.

The earlier Safety Kit focused on conservative health checks and targeted `node_repl` repair for Windows Codex Desktop plugin-runtime failures. WinBridge Recovery continues the same recovery problem space at a broader engineering level, adding version-aware package detection, bundled marketplace/cache and `latest` reconciliation, runtime/registration recovery, verified backups and rollback, a GUI launcher, installer, portable distribution, and compatibility work for newer Desktop package layouts.

The predecessor repository is intentionally preserved rather than merged or rewritten so its original Git history remains available as the earlier public stage of the project. Active development and releases are maintained here.

## Features

- Version-aware detection of the locally installed Codex Desktop package.
- Reads the current package's `cua_node/manifest.json` instead of assuming a fixed runtime layout.
- Uses the full package version plus bundled-plugin, CLI, and CUA content hashes to invalidate stale mirrors after updates.
- Browser lock prevention by closing Chrome and Edge before cache reconciliation.
- Repair only when static state is inconsistent.
- Long-path-safe backup manifests for deeply nested plugin dependencies.
- User-selectable retention of one, two, or three verified recovery backups; backups are preserved by default during uninstall.
- Optional public activity view for Tibo, OpenAI, and ChatGPT. It is hidden when its public sources cannot be reached and never attempts to bypass network restrictions.
- Layout, material, color, and accessibility-fallback controls, plus Snake and Minesweeper mini games.
- 4.0.0 ordinary packaged demonstration launches without `--enable-real-repair`; real repair remains behind the current-report and explicit-user-action gates.
- Post-launch consistency checks, diagnostics, rollback, and self-test.

### 4.0.0 verified UI and social-feed behavior

- All five runtime layouts keep their panels inside the scrollable window at narrow and normal desktop sizes; stage, terminal, progress, and plugin cards do not cover one another.
- Social-feed entries strip frontend markup, expose source labels and translation controls, and preserve unknown timestamps as `Time unavailable`.
- Official X profile avatars are fetched only through the controlled main-process route and stored in a bounded application-owned cache. Browser cookies are not imported and official plugin files are not redistributed.
- A read-only preflight/diagnosis report must be current and valid before the explicit repair gate can be reached.

## Safety boundaries

- Does not take ownership of or patch `C:\Program Files\WindowsApps`.
- Does not bundle credentials, passwords, cookies, tokens, API keys, sessions, logs, or private keys.
- Does not record or restore Computer Use/Browser task click trails, work context, hidden execution context, or internal session checkpoints.
- Does not bypass enterprise or browser security policy decisions.
- Writes only to documented installation, backup, and required Codex user-state locations.
- Uninstall removes only files owned by the installation manifest, not an arbitrary selected parent directory.

## Install or run portable

### Installer

- [Download the Windows x64 installer](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe)
- [Download the installer SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe.sha256)

The installer creates a separate `WinBridge-Recovery-V4` installation, desktop shortcut, and per-user uninstall registration; it does not overwrite the legacy 3.x installation. The installer is unsigned. Verify `8D49B10F0ADB0E01F21A1D8B0B03D477AA58F3466B08BFD964A21F13B18ECF77` before running it.

### Portable ZIP

- [Download the Windows x64 portable ZIP](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip)
- [Download the portable ZIP SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip.sha256)

Extract the complete `WinBridge-Recovery-V4-win32-x64` folder to a normal user-writable location, and run:

```text
WinBridge-Recovery-V4-win32-x64\WinBridge-Recovery-V4.exe
```

The portable package does not install a service, create an uninstall entry, or bundle any official Desktop/plugin files. Keep the extracted folder together; do not run individual scripts directly from inside the ZIP. Ordinary packaged demonstration launch does not start real repair.

Before either method, compare the downloaded file's SHA-256 with the value shown in the Release page. Do not treat an unsigned installer or a SmartScreen warning as a successful signature check.

## Updates and public activity

The public update entry point is the [GitHub Latest Release](https://github.com/zemeng5208/winbridge-recovery/releases/latest). Re-check the installer or portable ZIP sidecar after each download; do not treat Preview 1 or an old 3.x asset as the current release.

The public activity view is read-only after a successful connectivity probe. If all fixed public sources are unavailable, the setting and entry are hidden. Entries strip frontend markup, expose source labels and translation controls, preserve unknown timestamps as `Time unavailable`, and use a bounded application-owned cache for official X profile avatars.

## Verification meaning

A successful static check does not prove all three plugin surfaces are available at runtime. Browser, Chrome, and Computer Use should still be validated independently with a real interaction.

A successful repair or validation means the plugin/runtime surface is usable again. It does **not** mean that a previously interrupted page, click trail, task context, or original Computer Use session has been restored.

## Build

The default `main` branch preserves the older script history. The formal 4.0.0 source tree is available at tag `v4.0.0` and branch `v4-integration-first-release`; check out that tree before running the build:

```powershell
git checkout v4.0.0
cd .\v4\design-lab
npm ci
npm run build
cd ..\runtime
npm ci
npm run sync:frontend
npm test
npm run verify:snapshot
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Build-Release.ps1
```

The public installer is currently unsigned. Verify the SHA-256 published with each release.

See [SCOPE-AND-LIMITATIONS.md](SCOPE-AND-LIMITATIONS.md), [README.md](README.md), [LEGAL-NOTICE.md](LEGAL-NOTICE.md), and [SECURITY.md](SECURITY.md).
