# WinBridge Recovery v4.0.0

This is the first integrated WinBridge Recovery 4.0 formal Windows release built from the two V4 development branches. The [GitHub Release](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0) is the current Latest Release.

## Integrated in this version

- Electron desktop shell with an isolated Worker process and fixed preload API.
- React interface with structured terminal output, independent plugin status, configurable layout/material/color controls, accessibility fallbacks, Snake, and Minesweeper.
- Verified `integrated-4.0.0` engine snapshot using the mature 3.1.1 repair core.
- Unified read-only preflight report before diagnosis or repair.
- Access Guard checks for running Desktop processes, file locks, permissions, security-product context, and post-failure evidence.
- Bounded retry for transient atomic directory move failures.
- Long-path-safe resource mirror and log retention cleanup.
- Diagnose-first gating: a current structured report and explicit user action are required before a packaged real-repair launch.
- Real repair uses a dedicated 30-minute UI request timeout instead of the generic 120-second timeout.
- Repair failures are localized in the visible status area while the terminal retains the original English diagnostic text.
- Both “Skip repair and open GPT” and “Open GPT directly” terminate only the current WinBridge-owned repair process tree before launching GPT.
- After either GPT handoff succeeds, WinBridge Recovery 4.0 shuts down completely while leaving GPT running.
- Browser, Chrome, and Computer Use cards update independently from live diagnostic and repair log evidence before the final report arrives.
- Stage 4 switches from the user-decision state to repair-in-progress immediately after confirmation; Stage 5 starts when Desktop reports that it has opened and remains active through post-start verification.
- Development-only stage-state text has been removed from the packaged interface.
- All five runtime layouts keep their panels inside the scrollable window at narrow and normal desktop sizes; stage, terminal, progress, and plugin cards no longer cover one another.
- Social feed entries strip frontend markup, show official X profile avatars through a bounded local cache, preserve unknown timestamps as `Time unavailable`, and expose source labels and translation controls.

## Demonstration safety and repair gate

The ordinary desktop demonstration build does not include the `--enable-real-repair` launch flag. It can be used to inspect the interface without starting a real repair. A current read-only preflight/diagnosis report and an explicit user action are required before a packaged real-repair request can pass its separate gates.

## Distribution

- Windows x64 installer: [`WinBridge-Recovery-Setup-v4.0.0.exe`](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe).
- Windows x64 portable archive: [`WinBridge-Recovery-v4.0.0-portable-win-x64.zip`](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip).
- SHA-256 sidecars are published beside both artifacts.
- Installer SHA-256: `8D49B10F0ADB0E01F21A1D8B0B03D477AA58F3466B08BFD964A21F13B18ECF77`.
- Portable ZIP SHA-256: `D0EFB50EB104306AA00185668255D0B44BFECE430C4B02699827DE1E7B46B601`.
- The installer creates a separate `WinBridge-Recovery-V4` installation, desktop shortcut, and per-user uninstall registration; it does not overwrite the legacy 3.x installation.
- The public installer is currently unsigned; Windows SmartScreen may show the normal warning for an unsigned first-party build.

## Validation status

- PowerShell syntax scan: passed.
- Automated runtime tests: 83 passed, 0 failed.
- Design Lab production build, frontend sync, and packaging input checks: passed.
- Packaged runtime: Electron 43.4.0, Windows x64.
- Packaged EXE version: `4.0.0`.
- Packaged EXE SHA-256: `C2C4FA49F7FC58775194F443A8B0372D568B741E563DBC57F379D0F856D96F33`.
- Packaged EXE smoke test: stayed alive for five seconds in a clean environment and was then stopped; no exact-package processes remained.
- Packaged application contains `engine/integrated-4.0.0` and excludes the historical `engine/frozen-3.1.1` snapshot.
- A full fresh Windows 10/11 + Windows PowerShell 5.1 repair regression matrix remains a follow-up validation item; see [#13](https://github.com/zemeng5208/winbridge-recovery/issues/13). The release does not claim universal Windows host compatibility.

---

# Historical release notes
---

# WinBridge Recovery v3.1.1

## Scope clarification — 2026-08-15

- Clarified that WinBridge Recovery repairs plugin/runtime infrastructure state; it is not a Computer Use, Browser, or Agent task-checkpoint system.
- WinBridge does not restore the last clicked/viewed page, reconstruct click/action or screenshot trails, recover unsaved editor state, identify the exact files changed by a previous Agent task, or resume the original task from the exact interrupted step.
- WinBridge does not read, reconstruct, replay, or write back hidden model context, Agent plans, internal Computer Use/CUA run state, or an internal execution cursor.
- A background screen/activity/key recorder is intentionally not being added as a partial substitute because it cannot guarantee exact task resumption and would materially expand privacy, permission, security, storage, and maintenance scope.
- Task/session checkpoint recovery is therefore explicitly outside the current roadmap unless a stable, supported interface becomes available that permits reliable recovery without weakening the project's privacy and safety model.
- This is a documentation/scope clarification only; the v3.1.1 repair core and distributed binaries are unchanged.
- See `SCOPE-AND-LIMITATIONS.md` for the complete policy.

## Maintenance update

- Fixed in-app update discovery when the newest GitHub release is marked as a prerelease.
- Fixed Snake and Minesweeper closing immediately after selection when launcher auto-close is enabled.
- Restored the compact gear menu: mini games, theme, public activity, then full settings.
- Reduced main progress and particle animation frequency and wave sampling to improve pointer and settings responsiveness.
- Fixed uninstall failures on deeply nested backup trees that exceed the legacy Windows path limit.
- The uninstaller now uses Unicode long-path APIs, tolerates entries that disappear during cleanup, clears blocking file attributes, and does not traverse directory reparse points.
- Unified private and public launcher version metadata at `3.1.1`.

## Verification

- Public and private launcher compilation: PASS.
- Public launcher file version: `3.1.1.0`.
- Settings, game selection, and launcher functions: user acceptance test PASS.
- Uninstaller source regression test: PASS with a 427-character path, a read-only file, and an already-missing directory.
- Rebuilt installer payload regression test: PASS using the uninstaller extracted by an isolated `--test-mode` installation.
- Repair-core PowerShell behavior was not modified in this maintenance release.

## v3.1.1 download verification

```text
SHA256  DC3248E7C16620CA2B0940D036F1C01C81B77EC96672E8456B7654A13605E9A6  WinBridge-Recovery-Setup.exe
SHA256  6918D3280B79249B5DDD7C46ACB157D4FA51586E8C26474DEB563D77E76EFC5D  WinBridge-Recovery-v3.1.1-portable.zip
```

---

# WinBridge Recovery v3.1.0 Beta 1

Independent Windows recovery launcher for GPT/Codex Desktop Browser, Chrome, and Computer Use plugin state.

## What changed

- Added a complete accordion settings center with clear left/off and right/on switches.
- Added selectable retention of one, two, or three verified recovery backups.
- Added selectable public activity count from one to ten posts.
- Added six UI languages: Arabic, Chinese, English, French, Russian, and Spanish; first run follows the Windows UI language.
- Added an optional public activity view for Tibo, OpenAI, and ChatGPT, with RSS sources, cache-first behavior, and reader fallback.
- Activity visibility now depends on a real endpoint probe. When no source is reachable and no cache exists, the feature is hidden rather than showing a broken surface.
- Activity translation follows the selected interface language across the six supported languages.
- Replaced Breakout with Minesweeper and retained Snake.
- Added in-app update checking, installer download, SHA-256 verification, and update-mode installation.
- Added a configurable download mirror prefix with official GitHub fallback; verification remains mandatory for every source.
- Update mode reuses the existing install and backup locations when the installed registration is available.
- Removed the obsolete Breakout implementation from the runtime source.

## Recovery behavior retained

- Reads the current official package's `cua_node/manifest.json` instead of assuming a fixed runtime layout.
- Uses the full package version and bundled-plugin, CLI, and CUA hashes for resource-mirror identity.
- Keeps only the newest two valid resource mirrors.
- Preserves marketplace, cache, `latest`, registration, rollback, and post-launch consistency checks.
- Does not redistribute official Desktop or plugin payloads.

## Verification status

- Public and private launcher compilation: PASS.
- Six-language settings resource load: PASS.
- Minesweeper reveal, flood-fill, flag count, and timer interaction: PASS on the development machine.
- Social activity window loaded four live/cached public posts and completed Chinese translation: PASS during development.
- Browser, Chrome, and Computer Use independent interaction checks: previously PASS on the development machine; this historical result is not a substitute for a fresh target-machine check.
- In-app update source compiles and requires SHA-256 before installation: PASS.
- v3.1 update metadata is supplied by the GitHub Release and companion SHA-256 files; the update path rejects installers without a matching SHA-256.
- Final v3.1 installer and uninstaller isolated checks: PASS. The installed payload reported v3.1.0 and MIT License, uninstall removed only the owned product, preserved the selected backup folder, and left an unrelated marker untouched.
- Final portable ZIP clean-extraction self-test: PASS. The original repair-core script hash remained unchanged.
- Public source and package privacy scan: PASS with zero detected machine-local paths, email addresses, access tokens, or private-key markers.

## Safety notes

- Public activity sources may be unavailable on restricted networks. The launcher does not bypass those restrictions.
- A mirror prefix only changes the download route. It cannot change the expected SHA-256.
- The installer uses a self-signed testing certificate and is not publicly trusted. Verify the published SHA-256 before running it.

## Download verification

```text
SHA256  6775CE0559985A221C183145A405964F05A9CC228D276FCAB95DB9466177D978  WinBridge-Recovery-Setup.exe
SHA256  91919C978BBBD3A2082107F522CE948915422EF778FC173FDEFD80F703DFC45E  WinBridge-Recovery-v3.1.0-beta.1-portable.zip
```

The portable ZIP contains 27 runtime/documentation/certificate files. It passed the packaged self-test after clean extraction and contains no machine-local configuration, logs, backups, resource mirrors, credentials, private signing material, or official Desktop/plugin payloads.
