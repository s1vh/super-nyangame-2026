# Validation record — 2026-09-18

This is an implementation review record, not user acceptance of 1:1 parity.

## Reference integrity

- The source authority is the ActionScript tree at `e4e19ad`.
- All 230 historical blobs relocated to `legacy/` match their original Git object IDs. No upstream files were changed.
- Both PNG atlases, two font image/metadata pairs, the result star, particle image, six effects and two music files are copied without changing bytes. Asset tests verify the 16 copied files against SHA-256 provenance.
- The converter emits 131 gameplay regions and five menu regions, preserving frame names, trim offsets and animation order. Runtime asset output is approximately 5.10 MB before HTTP compression.

## Automated checks

`npm run check` passed on the final runtime: strict TypeScript checking, 30 tests in six files, and a production Vite build.

The tests cover takeoff, pointer limits, smoothing/rotation, 60/120/144 Hz equivalence, stall limits, collision bounds, source RNG/spawn quirks, delayed collection/damage, recovery, Turbo, forward-removal behavior, bounded long runs, immutable asset bytes, clip geometry/frame boundaries, bitmap glyph metrics, rendered-run cleanup, and audio lifecycle/failure.

The production entry JavaScript is approximately 256.46 kB (75.59 kB gzip), with additional Pixi chunks loaded as needed. The build resolves assets under `/super-nyangame-2026/`; it contains no development QA controls.

Final browser integration run: **14/14 passed** (2.7 minutes), seven checks each in Firefox 155.0 (Playwright build 1543) and installed Microsoft Edge 153.0.4234.32. The suite launches isolated profiles and never uses personal browser sessions.

| Check | Edge | Firefox |
| --- | --- | --- |
| Wide/short/portrait proportional canvas | passed | passed |
| Hover input and invalid edge targets | passed | passed |
| Five complete runs with fresh state | passed | passed |
| Failed critical asset then successful retry | passed | passed |
| Missing audio still permits play | passed | passed |
| Hidden-document suspension and resume | passed | passed |
| Production base path, no QA controls, no runtime/network errors | passed | passed |

The integration tests explicitly wait for the game scene after asynchronous loading and observe the first resumed update directly, avoiding test-click latency in timing assertions.

## Visual and interactive review

The in-app Chromium browser was used to inspect the original menu layout, scaled stage, entry, normal flight, collection particles, hit animation, low-health rainbow opacity, background stars, an enemy, bitmap score and result screen. Five complete menu/play/result/menu cycles produced fresh state. No uncaught runtime errors appeared in that interactive pass.

A 1280 x 720 window initially exposed a CSS grid sizing problem; the host now uses the viewport, giving a 1152 x 720 canvas centered with 64-pixel side margins. Logical pointer coordinates are independent of those margins.

Numerical fixtures establish movement/timing rules independently of rendering. They do not establish that the completed port feels identical to the user.

## Remaining review limits

- User acceptance of visuals, difficulty and control feel is pending. Compare using the current ActionScript source as authority; recordings and shipped SWFs may represent different revisions.
- There is no paired pixel-difference run against a freshly compiled ActionScript executable. Starling compatibility was reconstructed from the game source and published Starling 1.x source; exact rasterization can differ across GPUs and browsers.
- Safari/macOS/iOS and real mobile touch hardware have not been tested. Portrait resizing alone is not a mobile usability certification. The configured WebKit project is available for follow-up, but it does not replace Safari-device testing.
- The browser visibility test dispatches a controlled hidden-document notification. The clock and audio suspension are covered, but every OS background-tab policy has not been exercised.
- Historical audio bytes, cues, offsets and repeat limits are retained. Human listening comparison remains appropriate for decoder timing and perceived loudness.
- The prepared CI workflow has not run on GitHub. The user subsequently approved local squash integration into `dev` and closure of the topic branch. The tested implementation is unchanged; only integration-status documentation differs. There has been no push, repository-settings change or deployment. Historical audio publication questions remain in the deferred backlog.

## User review route

1. Run `npm run dev` (or `npm run preview` after building), press START and move the pointer without holding a button.
2. Check takeoff, vertical following, tilt and how much warning each enemy gives.
3. Collect stars, take damage, inspect the hit animation and trail opacity, and survive to Turbo (about 33.67 seconds of uninterrupted flight).
4. Lose, click the result star and start again. Verify that the second run feels fresh.
5. For a controlled inspection, use `?qa=1` on the development server to pause/step and trigger low health, collection, hits or Turbo. These fixtures are absent from the production build.

Record any mismatch with the screen/state, input, expected source behavior and observed result. Keep enhancements and atlas splitting deferred until parity is accepted.
