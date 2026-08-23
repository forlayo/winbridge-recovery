# Security

## Scope

The current formal release is [WinBridge Recovery 4.0.0](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0). The project manages local launcher and plugin/runtime recovery state for ChatGPT/Codex Desktop on Windows. Reports about unintended file writes, unsafe path handling, secret exposure, backup deletion, command injection, privilege escalation, or installer/uninstaller behavior are in scope.

Computer Use/Browser task-state reconstruction is **not** part of the security or product scope. WinBridge does not promise to restore the last page, click/action history, screenshots, files changed by a previous Agent task, unsaved editor buffers, hidden model context, internal CUA run state, or the exact execution step of an interrupted task.

## Reporting

Open a GitHub issue with a minimal reproduction that does not contain account credentials, browser cookies, API keys, access tokens, private certificates, session databases, or personal absolute paths. Redact usernames and machine-specific values from logs before attaching them.

Do not publish live credentials as a proof of concept. Revoke any credential that may already have been exposed.

A failure to resume an interrupted Computer Use/Browser task, recover its previous page, or reconstruct its action history is not by itself a WinBridge security defect or repair-core defect; see `SCOPE-AND-LIMITATIONS.md`.

## Data minimization

WinBridge intentionally avoids becoming a broad work-activity recorder. It does not add background screen recording, key logging, task click-history capture, or generalized work-context collection as a substitute for unsupported internal task checkpoint recovery.

This boundary reduces privacy exposure, permissions, sensitive local storage, and the amount of user activity data that the project would otherwise need to protect.

## Release and repair gates

- The ordinary 4.0.0 packaged demonstration starts without `--enable-real-repair` and is intended for interface inspection without starting a real repair.
- A current read-only preflight/diagnosis report and an explicit user action are required before a packaged real-repair request can pass its separate gates.
- Static diagnosis, package smoke tests, and connector availability are not interchangeable with a fresh real Windows Browser, Chrome, or Computer Use interaction.
- The public Windows x64 installer and portable V4 executable carry an Authenticode-SHA256 signature from the self-signed test certificate `CN=zemeng5208 Test Builds, O=GitHub, OU=Authorized Testing and Secondary Development`. The certificate is not rooted in the public Windows trust store; use the Release page's SHA-256 sidecar before running it and expect SmartScreen may still report an unknown publisher.
- The v4.0.0 release does not claim universal Windows 10/11 repair compatibility. Fresh target-machine regression remains tracked in [issue #13](https://github.com/zemeng5208/winbridge-recovery/issues/13).

## Trust model

- The launcher consumes resources from the locally installed official Desktop package.
- The public v4.0.0 installer is self-signed with a test certificate; the repository must never contain a private signing key.
- A public certificate file may be present for historical/testing metadata; it contains no private key and is not proof that the v4.0.0 installer is trusted.
- A successful static check does not prove all plugin surfaces are available at runtime.
- A successful repair means plugin/runtime consistency has been restored; it does not mean a previously interrupted Computer Use/Browser task or internal session checkpoint has been restored.
- WinBridge is an independent external project and does not rely on unsupported access to hidden model context or internal task execution state.
