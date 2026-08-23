# WinBridge Recovery 4.0.0

This is the first integrated WinBridge Recovery 4.0 release candidate built from the two V4 development branches.

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

## Demonstration safety

The ordinary desktop demonstration build does not include the `--enable-real-repair` launch flag. It can be used to inspect the interface without starting a real repair.

## Validation

- PowerShell syntax scan: passed.
- Automated runtime tests: 77 passed, 0 failed.
- Design Lab production build: passed (44 modules).
- Packaged runtime: Electron 43.4.0, Windows x64, 75 files, 365,468,250 bytes.
- Packaged EXE version: `4.0.0`.
- Packaged EXE SHA-256: `63D71A511A6F2245331571999DAB37B23733177B66BDC37194AE02957ED12CD0`.
- Packaged application contains `engine/integrated-4.0.0` and excludes the historical `engine/frozen-3.1.1` snapshot.
- The desktop demonstration shortcut launches without `--enable-real-repair`, so real repair remains disabled.
