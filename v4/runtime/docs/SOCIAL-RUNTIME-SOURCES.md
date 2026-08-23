# Social runtime source and license record

## Facts

- Product behavior and fixed account/source choices were read from the project's own frozen 3.1.1 UI source at review time: `LauncherUI/SocialFeedWindow.cs` in the separately controlled Publish tree. That source was read-only and was not modified or copied into V4App.
- Fixed public accounts are Tibo (`thsottiaux`), OpenAI (`OpenAI`), and ChatGPT (`ChatGPT`). The fixed official X profile HTML route is tried first for fresh, structured timestamps and post links; XXU RSS and RSSHub remain read-only mirrors, with the Jina public page reader as the optional last fallback. Official profile avatars are fetched through the main-process allowlist and cached locally as bounded image data.
- V4App's broker, parsers, validators, cache, and tests in this change are newly implemented for the 4.0 runtime. No third-party code or visual asset was copied or vendored.
- The formal 4.0.0 implementation fetches official X profile avatars only through the main-process allowlist, converts them to bounded image data, and stores them in the application-owned bounded avatar cache. It does not redistribute official plugin files or import browser cookies. `avatarDataUrl` remains optional in the response contract so a missing avatar affects only that card.

## License obligations

- No new package dependency, bundled source, font, icon, or media asset was added by this social runtime work.
- Public endpoint behavior is not treated as source-code licensing permission. Any future vendoring of code or assets requires a separate license review and source record.

## Operational boundary

- This record describes implementation provenance only. It is not approval to run live requests, accept third-party terms, ship, or publish; those decisions remain with total control.
