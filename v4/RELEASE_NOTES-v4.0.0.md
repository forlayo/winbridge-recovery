# WinBridge Recovery 4.0.0

This is the first integrated WinBridge Recovery 4.0 formal Windows release built from the two V4 development branches.

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
- Both "Skip repair and open GPT" and "Open GPT directly" terminate only the current WinBridge-owned repair process tree before launching GPT.
- After either GPT handoff succeeds, WinBridge Recovery 4.0 shuts down completely while leaving GPT running.
- Browser, Chrome, and Computer Use cards now update independently from live diagnostic and repair log evidence before the final report arrives.
- Stage 4 switches from the user-decision state to repair-in-progress immediately after confirmation; Stage 5 starts when Desktop reports that it has opened and remains active through post-start verification.
- Development-only stage-state text has been removed from the packaged interface.
- All five runtime layouts keep their panels inside the scrollable window at narrow and normal desktop sizes; stage, terminal, progress, and plugin cards no longer cover one another.
- Social feed entries strip frontend markup, show official X profile avatars through a bounded local cache, preserve unknown timestamps as `Time unavailable`, and expose source labels and translation controls.

## Demonstration safety

The ordinary desktop demonstration build does not include the `--enable-real-repair` launch flag. It can be used to inspect the interface without starting a real repair.

## Distribution

- Windows x64 installer: `WinBridge-Recovery-Setup-v4.0.0.exe`.
- Windows x64 portable archive: `WinBridge-Recovery-v4.0.0-portable-win-x64.zip`.
- SHA-256 sidecars are published beside both artifacts.
- Installer SHA-256: `8D49B10F0ADB0E01F21A1D8B0B03D477AA58F3466B08BFD964A21F13B18ECF77`.
- Portable ZIP SHA-256: `D0EFB50EB104306AA00185668255D0B44BFECE430C4B02699827DE1E7B46B601`.
- The installer is self-contained and creates a separate `WinBridge-Recovery-V4` installation, desktop shortcut, and per-user uninstall registration; it does not overwrite the legacy 3.x installation.
- The public installer is currently unsigned; Windows SmartScreen may show the normal warning for an unsigned first-party build.

## Validation

- PowerShell syntax scan: passed.
- Automated runtime tests: 83 passed, 0 failed.
- Design Lab production build: passed.
- Frontend sync verification: passed.
- Packaging input check: passed (Electron 43.4.0, Packager 20.3.0).
- Packaged runtime: Electron 43.4.0, Windows x64.
- Packaged EXE version: `4.0.0`.
- Packaged EXE SHA-256: `C2C4FA49F7FC58775194F443A8B0372D568B741E563DBC57F379D0F856D96F33`.
- Packaged EXE smoke test: stayed alive for five seconds in a clean environment and was then stopped; no exact-package processes remained.
- Packaged application contains `engine/integrated-4.0.0` and excludes the historical `engine/frozen-3.1.1` snapshot.
- The desktop demonstration shortcut launches without `--enable-real-repair`, so real repair remains disabled.
