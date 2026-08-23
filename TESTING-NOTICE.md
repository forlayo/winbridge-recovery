# WinBridge Recovery Testing Notice

Project homepage: https://github.com/zemeng5208/winbridge-recovery

This is an independent, non-commercial student project. It is not affiliated
with, sponsored by, or endorsed by OpenAI.

The current public build is the formal **WinBridge Recovery 4.0.0** Windows x64
release. The [Latest Release](https://github.com/zemeng5208/winbridge-recovery/releases/tag/v4.0.0)
contains the installer, portable ZIP, and SHA-256 sidecars. The installer and
portable V4 executable use a self-signed test certificate; it is not rooted in
the public Windows trust store, so Windows SmartScreen may still show an
unknown-publisher warning.

Testing of WinBridge Recovery covers plugin/runtime recovery, diagnostics,
backup/rollback, launcher behavior, packaging, and related compatibility. The
formal release records automated/build checks and a clean packaged smoke test;
it does not claim a complete fresh Windows 10/11 + Windows PowerShell 5.1
repair matrix. That follow-up is tracked in
[#13](https://github.com/zemeng5208/winbridge-recovery/issues/13).

The ordinary packaged demonstration starts without `--enable-real-repair` and
is intended for interface inspection without starting a real repair. A current
read-only preflight/diagnosis report and an explicit user action are required
before a packaged real-repair request can pass its separate gates.
A successful repair means the relevant plugin/runtime surface can be validated
again. It does not mean that an interrupted Computer Use or Browser task,
last page, click/action trail, changed-file history, hidden model context,
internal CUA run state, or exact execution step has been restored.

Task/session checkpoint recovery is intentionally outside the current project
roadmap. WinBridge also does not add background screen recording, key logging,
or broad work-activity capture as a partial substitute for unsupported internal
task-state recovery. See `SCOPE-AND-LIMITATIONS.md` for the complete boundary.

This notice does not transfer ownership of third-party software, trademarks,
or assets. The public 4.0.0 installer is self-signed for testing; verify its
SHA-256 sidecar before running it rather than treating SmartScreen status as a
public-trust check.

Any historical/testing certificate identifies project metadata only. It is not
an official OpenAI signature and does not make the public 4.0.0 installer
trusted.
