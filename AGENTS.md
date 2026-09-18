# Project rules

- Work only on `s1vh/super-nyangame-2026`. The upstream university repository is a read-only reference. Never propose or make changes there.
- Deliver commits on a local `codex/...` topic branch, originating from `dev`. Do not push, merge, publish, or deploy without a separate user request.
- The initial milestone is parity with the ActionScript source at `e4e19ad`. Source behavior takes precedence over the older GDD, recordings, and compiled SWFs.
- Preserve controls, timing, collision semantics, art, audio cues, and gameplay quirks. Fix resource leaks and stale state between runs; document any observable difference.
- Keep the original PNG atlases intact. Physical atlas splitting (SN-BL-001) is deferred until the user accepts parity.
- `legacy/` is a byte-preserved reference snapshot, excluded from the runtime build. Do not edit it as part of the port.
- Keep maintained documentation in English at the repository root. Consult `PRD.md`, `CONTRIBUTING.md`, `BACKLOG.md`, and `LICENSE.md` according to their responsibilities.
- Update the parity tracker in `BACKLOG.md` with each implemented feature and record verification and remaining work.
- Use TypeScript, PixiJS 8, WebGL, Vite, and Web Audio. Keep the production runtime static and small.
- Read `MIGRATION.md` and `PARITY.md` before modifying gameplay or asset conversion.
