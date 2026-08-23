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

## Demonstration safety

The ordinary desktop demonstration build does not include the `--enable-real-repair` launch flag. It can be used to inspect the interface without starting a real repair.

## Validation

- PowerShell syntax scan: passed.
- Automated runtime tests: 75 passed, 0 failed.
- Design Lab production build: passed (44 modules).
- Packaged runtime: Electron 43.4.0, Windows x64, 75 files, 365,466,102 bytes.
- Packaged EXE version: `4.0.0`.
- Packaged EXE SHA-256: `466D27B55EAC1ABCD1303FAF560B681DD635052049944AB86E354C805D804290`.
- Packaged application contains `engine/integrated-4.0.0` and excludes the historical `engine/frozen-3.1.1` snapshot.
- The desktop demonstration shortcut launches without `--enable-real-repair`, so real repair remains disabled.
