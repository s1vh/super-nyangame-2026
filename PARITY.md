# Source-first parity contract

Reference: `legacy/src` at original commit `e4e19ad`. The GDD describes earlier values and is not authoritative when it conflicts with executable source.

## Numerical baseline

| Behavior | Expected value / rule |
| --- | --- |
| Stage | 1280 x 800; background #110e20; simulation 60 Hz |
| Takeoff | x = -1280; y = 402 initially, then 400; x += (330-x)/15 while x < 256; 45 movement steps, flying on step 46; final x = 257.80937130071567 |
| Pointer | Accept only 50 < logical y < 750; hover works without a held button; an invalid target leaves the last valid target unchanged |
| Player | y += (target-y)/20; rotation updates only inside half the transformed cat height, using remaining vertical error / 3 degrees |
| Speed | 10 initially; +ln(1.02)*0.25 per flying tick; capped at 20; Turbo on tick 2020 of uninterrupted flight |
| Damage | Applied on the next tick; speed resets to 10, then ordinary acceleration resumes; -20 HP normally; -10 in Turbo, minimum 1 HP |
| Recovery | 63 flying ticks; damage is blocked during recovery; stars can still be collected |
| Collection | Deferred boolean flag gives +1 score and +1 HP up to 100, even if more than one star was detected on that tick |
| Spawn delay | 100 initially; each detected star reduces it by 1 above 60, 0.5 above 40, 0.25 above 20 |
| Spawn clock | += floor(speed * 0.1); spawn only when elapsed >= delay and horizontal clearance is available |
| Spawn roll | 1 + round(random * 9): 1-4 green, 5-7 stars, 8-10 red; replace a consecutive red with green |
| Row size | 1 + round(random * 4), preserving endpoint weighting; star spacing 75 |
| Enemy motion | x -= round(speed); red additionally y += cos(x * 0.005) * 10 using updated x |
| Turbo stars | Two rows, y offsets +/-75; extra horizontal attraction and two sequential vertical tests from the source |
| Rainbow | Segments 5 x 75; x = floor(cat.x-cat.x/9.5); y = cat.y-cat.height/9.5; alpha = ceil(HP/10)/10 |
| Particles | Five per detected star; original random calls, shrinking, drag, spin and removal threshold |
| Background | Spawn interval 20 + round(random*30); scale .25 + random*.75; motion round(width*speed*.01) |

## Animation and presentation

- Cat idle: 21 frames at 20 FPS. Cat hit: 21 frames at 21 FPS.
- Each enemy: 21 frames at 20 FPS. Collectible: 15 frames at 20 FPS.
- HUD token: 27 frames at 26 FPS. Background stars: 3 frames at 3 FPS.
- Idle and hit animations continue their phases while their respective artwork is hidden, as in the original juggler.
- Preserve XML frame offsets, original dimensions, initial clip dimensions, pivots, layers, bitmap font metrics, and transparent edges. Do not equate spawn dimensions with collision rectangles.
- Menu: original sine/cosine frequencies and amplitudes, mirrored right cat, image button. Result: static star button and final bitmap score, returning to the menu.
- Verify button pressed behavior and logical hit areas, including transparent padding.

## Acceptance checks

- Numerical fixtures independently derived from the source: takeoff, smoothing, speed/Turbo, recovery, delayed damage and collection, RNG thresholds, spawn rules and collision edges.
- Fixed-step equivalence at 60/120/144 Hz, bounded long stalls, hidden-tab suspension.
- Controlled multi-contact scenarios including source forward-iteration removal behavior; no accidental score or difficulty rebalance.
- All 131 gameplay and 5 menu regions converted; original PNG bytes unchanged; fonts and audio resolve under the repository base path.
- Visual checkpoints: menu, entry, normal flight, turn/tilt, hit, low health, Turbo, particles, result and repeat play.
- Repeated runs clear state and resources. Missing critical assets show a recoverable error; failed audio does not prevent play.
- Test current installed desktop browsers and record actual results, including untested Safari separately.
- Final acceptance requires user review of visuals and feel. No automated test alone establishes that acceptance.


## Starling compatibility evidence

The preserved SWF's ABC constant pool identifies Starling 1.7.1. The upstream's published `v1.7` source was inspected for the 1.x semantics (there is no `v1.7.1` release tag). No Starling runtime is included in the port.

- `Image` / `MovieClip`: the first texture determines the quad dimensions; changing animation textures does not call `readjustSize`.
- `SubTexture.adjustVertexData`: each frame translates vertices by its offsets; it does not scale those offsets. For a clip with initial width W0, a packed frame width W, and declared frame width F, the rendered width is W0 + W - F. The equivalent formula applies vertically.
- `Quad.getBounds`: collisions use the original quad before trim adjustment. Container bounds include invisible child art. Both cat clips begin with the same 167 x 106 quad at (-83, -53).
- `Starling.advanceTime`: input, stage events, then juggler. Stage events use a snapshot of listeners; newly spawned obstacles first move on the next tick, but their animation advances in the current juggler step.
- `MovieClip.advanceTime`: frame boundaries use strict greater-than. Hidden clips remain registered and advance.
- `Button`: a missing down texture gives a centered 0.9 pressed scale, with the untrimmed logical rectangle as its hit area.

References: https://github.com/Gamua/Starling-Framework/tree/v1.7/starling/src/starling (Image, MovieClip, Quad, SubTexture, Stage, Starling, Button). Renderer differences and exact platform rasterization still require visual review.

### Additional source quirks preserved

- Red-roll branches set `x = stageWidth + obstacle.width` BEFORE adding the obstacle to the stage. Art is only created on `ADDED_TO_STAGE`, so that width is zero: both red and substituted green begin at x=1280. Ordinary green begins at 1480. The first star of a row begins at 1505.
- The star vertical retry loop makes at most one retry (`break` inside the loop). Enemy retries continue until the band is clear.
- Forward `splice` while checking obstacles skips the next adjacent item for that collision pass. This affects multi-contact behavior and is retained explicitly.
- Rainbow cleanup and run-reset leaks are corrected while retaining the visible segment trajectory.

## Technical cleanup boundaries

The following differences are intentional and are not balance changes:

- A new run clears recovery flags/counters, pending collision flags, previous spawn bands, obstacle eligibility, background timing and every transient object. The original left several of these values behind.
- Removed clips and particle views are destroyed without destroying the shared atlas. Five rendered runs are checked for bounded child counts and shared texture survival.
- The invisible first rainbow sentinel and off-screen bookkeeping leak are replaced by bounded visible segments. The visible trajectory and opacity calculation remain source-derived.
- Once a fatal collision selects the result screen, the abandoned game update stops. The original could continue creating hidden objects later in the same callback.
- Enemy rejection sampling has a 1,024-retry escape for a degenerate random source. Ordinary draws preserve the original sequence; an exhausted sampler chooses a legal edge. This prevents a permanently blocked page.
- The browser shell adds proportional letterboxing, pointer coordinate conversion, keyboard-operable menu/result buttons, a loading/retry message and gesture-gated audio. It does not add movement keys or alter the 60 Hz formulas.
- Stalls process at most 250 ms (15 simulation steps). Hidden-document transitions discard accumulated time and suspend/resume audio. Menu motion still uses wall-clock sine/cosine phases.

Music retains the original start offsets and repeat limits: welcome starts at 2 seconds with 999 repeats; gameplay starts at zero with 9,999 repeats. Effect files are reused unchanged. Audible comparison and platform-specific MP3 decoder differences remain part of human review.
