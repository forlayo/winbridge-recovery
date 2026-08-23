# WinBridge Recovery 4.0.0 — formal Windows x64 release

Release: https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0
Status: Latest Release (not a preview)

## Download and verify

- [Windows x64 installer](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe)
- [Installer SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-Setup-v4.0.0.exe.sha256)
- Installer SHA-256: `BA21C5369AE5BFA5A0236FF112A6FFCAE37EFB36FAA3E9E62E5EE3213A3B8D04`
- [Windows x64 portable ZIP](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip)
- [Portable ZIP SHA-256 sidecar](https://github.com/zemeng5208/winbridge-recovery/releases/download/v4.0.0/WinBridge-Recovery-v4.0.0-portable-win-x64.zip.sha256)
- Portable ZIP SHA-256: `FD8C6FEC7BF164D49BBC99B43303DA900B3CACCBBE2563FE52983ABA45C0EEA7`

The installer and portable V4 executable are Authenticode-SHA256 signed with the self-signed test certificate `CN=zemeng5208 Test Builds, O=GitHub, OU=Authorized Testing and Secondary Development`. The certificate is not publicly trusted, so Windows SmartScreen may still show an unknown-publisher warning. Verify the sidecar before running it. The installer uses a separate `WinBridge-Recovery-V4` installation, desktop shortcut, and per-user uninstall registration, and does not overwrite legacy 3.x.

## Verified 4.0.0 behavior

- The ordinary packaged demonstration does not include `--enable-real-repair`; it is intended for interface inspection without starting real repair.
- A current read-only preflight/diagnosis report and explicit user action are required before a packaged real-repair request can pass its separate gates.
- Five runtime layouts keep stage, terminal, progress, and plugin cards inside a scrollable window without overlap.
- Social entries strip frontend markup, expose source labels and translation controls, preserve unknown timestamps as `Time unavailable`, and use a bounded application-owned cache for official X avatars.
- Validation recorded 83 automated tests passing, Design Lab build/frontend sync/packaging checks passing, Electron 43.4.0 Windows x64 packaging, version `4.0.0`, and a clean five-second packaged smoke test.
- This release does not claim a complete fresh Windows 10/11 + Windows PowerShell 5.1 repair regression matrix; see [issue #13](https://github.com/zemeng5208/winbridge-recovery/issues/13).

---

# Historical release notes

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
