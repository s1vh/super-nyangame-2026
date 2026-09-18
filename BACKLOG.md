# Super NyanGame Revival — Implementation Tracker and Backlog

> Deferred work for **Super NyanGame Revival** after the first faithful 1:1 port of the historical ActionScript / Starling game has been completed and validated.
>
> This backlog does **not** authorize implementation before parity is accepted. The first milestone remains preservation and behavioral equivalence with the original game.

---

## Authorized parity implementation (2026-09-18)

Integration branch: local `dev`. The user approved the initial approximation for squash integration and closure of `codex/feature/legacy-parity`. Scope and acceptance: `MIGRATION.md`, `PARITY.md`. Further parity review remains open; post-parity features are not authorized by this integration.

| ID | Feature | Status | Verification / remaining work |
| --- | --- | --- | --- |
| SN-PORT-001 | Preserve baseline and local workflow | resolved | Local main/dev/topic branches; historical files relocated unchanged; upstream untouched |
| SN-PORT-002 | Source-first parity contract | resolved | Source fixtures and Starling 1.x geometry/order recorded in PARITY.md; visual acceptance pending |
| SN-PORT-003 | TypeScript/Vite/Pixi bootstrap | resolved | TypeScript strict, PixiJS 8/WebGL, responsive logical stage; initial typecheck/build passed |
| SN-PORT-004 | Atlas and font conversion | resolved | 3 asset tests passed: 136 regions, clip vertex fixtures, hashes for 16 copied assets |
| SN-PORT-005 | Loading and screen flow | resolved | Original menu/play/result flow and proportional input verified in-browser; recoverable loaders implemented |
| SN-PORT-006 | Clock, input and player | resolved | Numerical fixtures passed; 60/120/144 Hz equivalence, bounded stalls, pointer limits |
| SN-PORT-007 | Spawns and obstacle movement | resolved | Seeded fixtures passed: source RNG, spawn bands, red edge spawn and Turbo attraction |
| SN-PORT-008 | Collision, health, score and Turbo | resolved | Delayed flags, forward-removal contacts, 63-tick recovery, Turbo and bounded long run tested |
| SN-PORT-009 | Rainbow, particles, background and HUD | resolved | Clip/glyph fixtures and 5 rendered-run cleanup checks passed; collection, impact, low-health trail and result reviewed in-browser |
| SN-PORT-010 | Web Audio | resolved | 5 audio lifecycle tests passed: activation, first cue, original repeat limits, suspension, stale effects and failure |
| SN-PORT-011 | Lifecycle and parity validation | resolved for local review | 30 unit/asset/render/audio tests and 14 Edge/Firefox integration checks passed; user parity acceptance and Safari review pending |
| SN-PORT-012 | Static delivery and review | resolved | Production base path verified; build-only CI prepared; local commits and review documentation; no deployment |

Completed rows retain verification evidence. New post-parity ideas remain deferred. SN-BL-001 is explicitly excluded from this implementation.

---

## Current baseline

The modernization target is:

```text
TypeScript
PixiJS 8
WebGL
Vite
HTML + CSS
Web Audio API
GitHub Pages
```

The initial release must remain browser-native, static-first, lightweight, playable without plugins or downloads, free of mandatory backend dependencies, and faithful to the original gameplay before new design work begins.

The tasks below are intentionally deferred until the 1:1 port is considered stable.

---

# Pending

## SN-BL-001 — Split the legacy sprite atlas into modular asset bundles

**Status:** pending after parity

**Priority:** high

The historical project uses a large shared sprite sheet containing most of the game artwork. After parity has been established, reorganize the visual asset pipeline into smaller logical atlases and PixiJS asset bundles.

Preferred grouping:

```text
assets/
├── ui/
├── player/
├── enemies/
├── effects/
├── backgrounds/
└── audio/
```

Do not fragment the project into one network request per sprite. The goal is **functional modularity**, not maximal file splitting.

Candidate bundles:

```text
boot
menu
core-game
player
enemy-pack-1
effects
audio
```

The new structure should allow future enemies, effects, and animation sets to be added without rebuilding an unrelated monolithic atlas.

### Requirements

- preserve visual fidelity;
- preserve animation timing and frame order;
- keep efficient texture batching where practical;
- avoid increasing perceived loading time;
- preload only the assets needed for the current screen or gameplay phase;
- document the atlas-generation and packing workflow;
- keep the asset pipeline understandable without proprietary tools where practical.

### Acceptance criteria

- the game remains visually identical to the accepted parity build;
- asset loading remains stable on GitHub Pages;
- new enemy asset families can be added independently;
- no unnecessary duplicate textures are loaded;
- bundle boundaries are documented.

---

## SN-BL-002 — Add a public leaderboard

**Status:** pending after parity

**Priority:** medium

Add an optional public high-score leaderboard without turning the game into a server-dependent application.

Preferred architecture:

```text
GitHub Pages
      │
      │ HTTPS
      ▼
Google Apps Script
      │
      ▼
Google Sheets
```

The game must remain fully playable when the leaderboard is unavailable.

### Initial scope

Support:

```text
POST score
GET leaderboard
```

The backend should validate and normalize submissions before writing them to the Sheet.

### Requirements

- no privileged Google credentials in frontend code;
- gameplay must not depend on backend availability;
- sanitize player names;
- validate score format and plausible bounds;
- define a reasonable submission rate limit;
- detect obviously malformed or abusive submissions;
- keep the returned leaderboard payload minimal;
- define how ties are sorted;
- define whether only the highest score per player is retained or every valid run is stored;
- include a simple moderation/removal workflow.

### Security note

A browser game cannot make a public leaderboard fully cheat-proof because the client is controlled by the player.

The objective is to prevent **trivial abuse**, not to claim authoritative anti-cheat security.

Possible later controls include:

- run-duration plausibility;
- short-lived challenge/session tokens;
- duplicate detection;
- coarse gameplay telemetry;
- server-side score ceilings;
- submission throttling.

### Acceptance criteria

- leaderboard outages never prevent gameplay;
- scores cannot be appended directly to the private Sheet from arbitrary frontend credentials;
- malformed submissions are rejected;
- the public response exposes no private Sheet data;
- the feature can be disabled without changing the core game.

---

## SN-BL-003 — Resolve the licensing of the two historical Nyan Cat music tracks

**Status:** pending investigation

**Priority:** high before final public redistribution of historical audio

The historical game contains two separate music tracks associated with Nyan Cat:

1. a version of the original theme commonly associated with the meme;
2. a piano arrangement used on the title / welcome screen.

The exact redistribution rights of the historical files have not yet been verified conclusively. The piano arrangement's arranger, performer, recording source, and license are currently unknown.

Both files are therefore excluded from the licenses granted by the repository.

### Investigation tasks

For the original-theme track:

- identify the exact source file and version used in the 2014 project;
- distinguish composition rights from recording / cover / arrangement rights;
- identify the relevant author or rights holder where possible;
- determine whether the specific recording can legally be redistributed in a public source repository and playable web build;
- preserve evidence of any applicable license or permission.

For the piano arrangement:

- search the original project history, filenames, metadata, coursework documentation, local archives, and historical references for provenance;
- identify the arranger, performer, or source if possible;
- determine whether the recording was licensed for redistribution;
- avoid assuming that widespread meme circulation implies public-domain status.

### Decision

If redistribution rights cannot be established with sufficient confidence, replace the historical music in the modern public build.

The repository may preserve documentation explaining what the original game used without redistributing an uncertain audio file.

### Acceptance criteria

One of the following must be true for each historical music track:

```text
A. rights and redistribution terms verified and documented
or
B. track removed/replaced from the modern public release
```

No unresolved track should be silently presented as covered by MIT or CC BY-NC-SA 4.0.

---

## SN-BL-004 — Produce replacement music if historical licensing cannot be verified

**Status:** pending outcome of SN-BL-003

**Priority:** medium

If either historical Nyan Cat music file cannot be cleanly redistributed, create or acquire replacement music with explicit rights suitable for the public revival.

Preferred options:

1. original music produced specifically for Super NyanGame Revival;
2. commissioned music with a written license;
3. appropriately licensed stock / library music;
4. public-domain material where appropriate.

For portfolio clarity, original replacement music is preferred if practical.

### Creative direction

```text
welcome / title
→ light, playful, melodic, lower intensity

gameplay
→ energetic, repetitive, arcade-friendly, able to loop cleanly
```

### Requirements

- explicit provenance for every replacement track;
- documented license;
- clean looping where appropriate;
- browser-friendly audio encoding;
- reasonable file size;
- separate source/master files retained outside the runtime bundle where practical.

### Acceptance criteria

- the public build contains no music of uncertain redistribution status;
- attribution and license information are documented;
- the replacement works with the Web Audio loading policy;
- title and gameplay pacing remain appropriate.

---

## SN-BL-005 — Preserve and document legally acquired sound effects

**Status:** pending documentation

**Priority:** medium

The gameplay sound effects used for events such as collecting stars and receiving enemy damage were legally acquired.

Their original licenses should be located and documented before the revival is treated as a fully auditable public release.

### Tasks

- identify the original source or vendor for each sound pack where possible;
- locate purchase receipts or license records;
- determine whether redistribution of the raw audio files is permitted;
- distinguish runtime-use rights from source-repository redistribution rights;
- replace any effect whose license cannot support the intended public distribution model.

### Acceptance criteria

- every shipped sound effect has documented provenance;
- no private purchasing information is committed publicly;
- redistribution rights are clear;
- `LICENSE.md` or a dedicated attribution file reflects the final status.

---

## SN-BL-006 — Add new enemy types

**Status:** pending after parity

**Priority:** medium

Resume game development beyond the historical university submission by introducing additional enemies.

New enemies should expand the game rather than invalidate its original arcade loop.

### Design principles

- readable movement patterns;
- clear collision silhouettes;
- escalating challenge;
- minimal tutorial dependence;
- compatible with the existing speed / Turbo progression;
- distinct visual identity;
- low runtime overhead.

### Acceptance criteria

- original enemies remain unchanged unless separately rebalanced;
- each new enemy has documented behavior;
- new enemies do not require a heavyweight physics engine;
- spawn logic remains deterministic enough to test;
- difficulty changes are measured and reviewed.

---

## SN-BL-007 — Add optional modern visual effects and shaders

**Status:** pending after parity

**Priority:** low

Explore restrained modern visual effects after the original look has been reproduced faithfully.

Possible effects:

- CRT treatment;
- subtle scanlines;
- glow;
- chromatic aberration;
- distortion;
- impact flashes;
- improved Turbo visuals;
- background treatment;
- lightweight post-processing.

Use PixiJS filters and custom GLSL where appropriate.

### Requirements

- preserve an option to view the game close to its historical appearance;
- effects must not compromise gameplay readability;
- avoid large performance regressions;
- respect reduced-motion preferences where applicable;
- do not require WebGPU.

### Acceptance criteria

- effects can be disabled;
- the core game remains functionally identical when effects are off;
- no synchronous GPU readbacks are introduced merely for decoration;
- visual changes are documented as post-parity modernization.

---

## SN-BL-008 — Add a technical performance overlay

**Status:** pending after parity

**Priority:** low

Add an optional portfolio/debug overlay showing lightweight runtime statistics.

Candidate metrics:

```text
FPS
frame time
JS memory usage when supported
active entity count
loaded asset bundle count
canvas resolution
device pixel ratio
WebGL version
```

The overlay should remain observational and must not affect gameplay state.

### Requirements

- hidden by default;
- toggleable through UI and keyboard;
- low-frequency DOM updates;
- no synchronous GPU queries;
- memory values must be feature-detected;
- unsupported values should display `N/A` or be omitted;
- hiding the overlay should suspend unnecessary telemetry work.

### Acceptance criteria

- negligible effect on measured performance;
- gameplay continues identically with the overlay shown or hidden;
- metrics remain readable and clearly labeled;
- unsupported APIs fail gracefully.

---

## SN-BL-009 — Review mobile and touch-specific UX

**Status:** pending after desktop parity

**Priority:** low

The first port prioritizes desktop browser parity.

After parity, review whether the game should offer a more intentional mobile experience.

Potential work:

- touch-control tuning;
- orientation handling;
- viewport-safe UI;
- mobile performance review;
- audio activation behavior;
- reduced asset resolution where appropriate;
- input ergonomics.

### Acceptance criteria

- desktop behavior remains unchanged;
- touch interaction is deliberate rather than accidental;
- mobile-specific changes are documented;
- performance remains acceptable on representative devices.

---

## SN-BL-010 — Evaluate WebGPU as an optional renderer experiment

**Status:** optional research

**Priority:** low

After the WebGL version is mature, evaluate PixiJS WebGPU support as a technical experiment.

WebGPU must not become a requirement for ordinary gameplay unless browser support and project needs clearly justify that change.

Potential goals:

- renderer comparison;
- performance measurements;
- future shader experiments;
- portfolio write-up.

### Acceptance criteria

- WebGL remains the supported baseline;
- WebGPU code does not complicate the main build unnecessarily;
- fallback behavior is explicit;
- any performance claims are based on measured data.

---

## SN-BL-011 — Extend post-parity gameplay and progression

**Status:** future design

**Priority:** to be determined

Once the historical game is faithfully restored, evaluate which unfinished or newly imagined ideas are worth developing.

Possible areas:

- additional enemy families;
- challenge variants;
- score multipliers;
- new Turbo interactions;
- difficulty modes;
- achievements;
- run modifiers;
- expanded scoring systems;
- new backgrounds or themes.

This entry intentionally does not authorize any specific mechanic.

Every expansion should preserve the project's core identity as a lightweight arcade game.

---

## SN-BL-012 — Finalize public portfolio presentation

**Status:** pending after first playable release

**Priority:** medium

Once the revival is playable, polish the public-facing repository and project page.

Potential work:

- animated gameplay GIF or short capture;
- screenshots comparing 2014 and 2026 builds;
- architecture diagram;
- clear historical timeline;
- direct **Play** link;
- technical migration notes;
- attribution and licensing summary;
- performance notes;
- original gameplay video link;
- portfolio case-study text.

### Acceptance criteria

A visitor should be able to understand within a few minutes:

```text
what the original project was
who created it
what technology it used
what was preserved
what was modernized
what the new stack is
where to play it
```

---

# Recommended post-parity implementation order

```text
1. Resolve music rights / replacement decision
2. Document sound-effect licenses
3. Split the monolithic sprite atlas into modular bundles
4. Publish and validate the first clean static release
5. Add portfolio presentation material
6. Add the leaderboard
7. Add technical stats overlay
8. Add new enemies
9. Add optional shaders / modern visual effects
10. Review mobile-specific UX
11. Explore broader gameplay extensions
12. Evaluate WebGPU only if it remains technically interesting
```

---

# Release principle

None of the features in this document are required to prove that the revival works.

The first milestone remains:

```text
original game
        ↓
faithful browser-native port
        ↓
parity accepted
        ↓
post-parity development begins
```

---

# Core principles

## Preserve before expanding

Do not use modernization as an excuse to overwrite the historical behavior before it has been reproduced and documented.

## Keep the browser build lightweight

New systems should not undermine the static-first architecture.

## Keep optional services optional

Leaderboard or external-service failures must never prevent gameplay.

## Make licensing explicit

No uncertain music or asset should silently inherit a repository license.

## Favor modular assets

Future content should be addable without rebuilding unrelated resources.

## Measure before optimizing

Performance work should respond to profiling and real bottlenecks.

## Keep new development visibly distinct from historical work

The value of the revival comes partly from showing the evolution from the original university project to the modern implementation.
