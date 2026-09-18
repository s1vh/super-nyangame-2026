# Super NyanGame Revival — Product Requirements Document

**Document type:** Product Requirements Document (PRD)  
**Project:** Super NyanGame Revival  
**Legacy source:** `VJ1217-GAME`  
**Modernization target:** Browser-first static web game  
**Status:** Playable implementation / user parity review pending\
**Primary objective:** Faithful 1:1 port first, modernization second  
**Documentation language:** English  
**Prepared:** 2026-09-14

---

## Approved parity scope (2026-09-18)

The user approved the implementation plan recorded in `MIGRATION.md` and `PARITY.md`.

- Active repository: `s1vh/super-nyangame-2026`; historical upstream is read-only.
- Current ActionScript source is the behavioral authority, ahead of the SWF, video, and older GDD.
- Correct technical leaks and stale state without rebalancing gameplay; record observable differences.
- Preserve the original PNG atlases during parity. Convert metadata and organize loading bundles only. Physical splitting is deferred to SN-BL-001 after user acceptance. This explicitly supersedes atlas-splitting requirements in the original roadmap below.
- Deliver local commits on a topic branch from `dev`. Push, merge, and publication require a separate request.
- Suspend simulation and audio while the document is hidden; retain a fixed 60 Hz logical simulation.
- Maintained documentation lives at the repository root; historical implementation is preserved in `legacy/`.

---

## 1. Executive Summary

Super NyanGame Revival is a modernization of an older university game originally developed in ActionScript 3 using Adobe Flash and the Starling rendering framework.

The purpose of the revival is not to redesign the game immediately and not to present it as a project created from scratch in 2026. The initial goal is to preserve the original gameplay, pacing, structure, visual identity, and historical provenance while replacing the obsolete Flash runtime with a modern, lightweight, maintainable browser stack.

The selected stack is:

- **TypeScript**
- **PixiJS 8**
- **Vite**
- **HTML + CSS**
- **Web Audio API**
- **WebGL as the primary production renderer**
- **GitHub Pages for static hosting**
- **GitHub Actions for automated build and deployment**
- **Google Apps Script + Google Sheets as a possible future minimal leaderboard backend**

The first production milestone is a **1:1 behavioral port**. New enemies, gameplay systems, graphical redesigns, shaders, leaderboard functionality, or other expansions are explicitly secondary.

The end result must be playable directly in a modern browser with no plugins, launchers, installers, or proprietary runtimes.

---

# 2. Product Vision

## 2.1 Vision statement

> Restore a discontinued Flash/Starling game as a lightweight modern web game while preserving its original identity and making its technical evolution visible as part of the portfolio.

The project should communicate two things simultaneously:

1. what the original developers were capable of building during the Flash/Starling era;
2. how the same project can be responsibly modernized using current browser technologies.

The revival must therefore preserve historical continuity rather than replacing the legacy game with a conceptually unrelated remake.

## 2.2 Portfolio intent

The game is intended to work as both:

- a playable browser game;
- a technical portfolio piece documenting a real modernization process.

The modernization should make the progression from the original technology stack to the modern stack explicit:

```text
Legacy project
ActionScript 3
Adobe Flash
Starling
monolithic sprite atlas
Flash-era audio/input/runtime assumptions

        ↓ modernization

Modern revival
TypeScript
PixiJS 8
WebGL
modular asynchronous asset bundles
browser-native audio/input
static deployment
GitHub Pages
```

The portfolio value comes from continuity between the historical project and the modern implementation, not merely from the visual result.

---

# 3. Product Goals

## 3.1 Primary goals

The first production-ready revival should:

- reproduce the original gameplay as closely as practical;
- run directly in modern desktop browsers;
- require no browser plugin or external runtime;
- keep startup delay low;
- remain lightweight enough for static hosting;
- preserve the original artwork and game feel where legally and technically appropriate;
- retain clear separation between historical code and modernization work;
- use a maintainable codebase suitable for future expansion;
- support future additions such as new enemies and a leaderboard without forcing a rewrite;
- remain understandable to a developer inspecting the repository years later.

## 3.2 Secondary goals

The architecture should make it straightforward to add later:

- more enemy types;
- additional animation sets;
- new visual effects;
- custom shaders;
- gameplay modes;
- modern UI refinements;
- accessibility improvements;
- a public leaderboard;
- optional technical/debug statistics;
- improved mobile/touch support if desired;
- replay or challenge systems;
- additional sound/music packs.

These are architectural considerations, not requirements for the first parity milestone.

---

# 4. Non-Goals for the Initial Port

The 1:1 port must **not** become an uncontrolled remake.

The following are explicitly out of scope for the first milestone:

- redesigning the gameplay loop;
- replacing original enemy behavior with new AI;
- adding large new content packs;
- adopting a full engine such as Unity;
- introducing React, Vue, Angular, Svelte, or another application framework without a demonstrated need;
- adding a database;
- adding authentication;
- adding server-side rendering;
- introducing a permanent backend;
- adopting a physics engine unless a specific original mechanic cannot reasonably be reproduced without one;
- making WebGPU a production requirement;
- rewriting the visual identity before parity is reached;
- changing game balance merely because the port makes it convenient;
- replacing historically meaningful code patterns before their behavior has been verified.

Modernization must initially target the **runtime, maintainability, and deployment model**, not the creative design.

---

# 5. Legacy Technical Baseline

The original project was built around:

- ActionScript 3;
- Adobe Flash;
- Starling;
- sprite-based 2D rendering;
- texture atlases;
- animated clips;
- frame/tick-driven game logic;
- Flash-era sound APIs;
- Starling event/input abstractions;
- a largely monolithic sprite atlas;
- lightweight custom collision and movement logic.

The project already contains a complete playable concept and therefore does not require a new game engine architecture from first principles.

The modernization strategy should map existing concepts to modern equivalents wherever practical.

---

# 6. Core Framework Decision

## 6.1 Selected framework: PixiJS 8

**Decision:** Use **PixiJS 8** as the rendering and scene framework.

PixiJS is preferred because the original project already uses Starling and the programming model maps naturally to modern Pixi concepts.

The conceptual mapping is approximately:

| Legacy Starling / Flash concept | Modern equivalent |
|---|---|
| `Sprite` / display container | `PIXI.Container` |
| `Image` | `PIXI.Sprite` |
| `MovieClip` | `PIXI.AnimatedSprite` |
| `TextureAtlas` | `PIXI.Spritesheet` |
| frame/update callbacks | `PIXI.Ticker` |
| Starling touch events | Pixi pointer events |
| bitmap font rendering | `PIXI.BitmapText` |
| display tree | Pixi scene graph |
| visual filters | Pixi filters / custom shaders |
| Flash sound API | Web Audio API |

This reduces conceptual migration cost while still replacing the obsolete runtime completely.

## 6.2 Why PixiJS instead of raw Canvas/WebGL

The game could technically be rebuilt directly on:

- `<canvas>`;
- WebGL;
- custom JavaScript rendering code.

That option is rejected for the first port because it would require rebuilding infrastructure already solved by PixiJS, including:

- sprite batching;
- texture handling;
- animated sprites;
- scene graph management;
- pointer input;
- asset loading;
- render-loop integration;
- filters and shader plumbing;
- renderer/device compatibility logic.

Engineering effort should be spent on preserving and modernizing the game rather than recreating a rendering framework.

## 6.3 Why PixiJS instead of Phaser

Phaser remains a valid alternative, but it provides more game-engine functionality than this project currently needs.

The original game already has its own:

- gameplay loop;
- state transitions;
- spawning logic;
- collision logic;
- progression behavior;
- enemy behavior.

Using Phaser would likely result in either:

1. replacing working game architecture merely to fit Phaser conventions; or
2. carrying engine systems that are not meaningfully used.

PixiJS is therefore the narrower and more appropriate conceptual replacement for Starling.

## 6.4 Why not OpenFL

OpenFL is conceptually close to Flash and could reduce migration friction.

It is not selected because the modernization is intended to demonstrate a genuine transition away from the Flash ecosystem.

The preferred portfolio story is:

```text
ActionScript / Starling
        ↓
TypeScript / PixiJS
```

rather than preserving a Flash-like abstraction layer indefinitely.

## 6.5 Why not Ruffle

Ruffle would be useful for historical preservation of a Flash build.

It is not the target runtime for the revival because it would preserve the old execution model rather than modernize the source architecture.

Ruffle may still be useful later as an archival comparison tool, but not as the production implementation.

---

# 7. Programming Language

## 7.1 Selected language: TypeScript

**Decision:** Use TypeScript rather than plain JavaScript.

Reasons:

- improves maintainability during a large port;
- makes migrated state and entity structures explicit;
- reduces regressions during ActionScript-to-JavaScript translation;
- provides strong editor support;
- makes refactoring safer;
- documents contracts between systems;
- is appropriate for a portfolio project intended to continue evolving.

The first implementation should remain readable and avoid unnecessary abstraction.

TypeScript must support the game, not become an excuse to over-engineer it.

---

# 8. Build Tooling

## 8.1 Selected build tool: Vite

**Decision:** Use Vite for local development and production builds.

Vite is not part of the production runtime.

Its responsibilities are:

- local development server;
- TypeScript transformation;
- dependency bundling;
- development hot reload;
- production asset bundling;
- build-time configuration;
- generation of a deployable static `dist/` tree.

The production output must remain completely static.

## 8.2 No application framework

The project should not use React, Vue, Angular, Svelte, or similar frameworks unless a later feature creates a clear requirement.

The expected UI surface is small enough to implement using:

- semantic HTML;
- CSS;
- TypeScript;
- lightweight DOM components where useful.

This keeps:

- bundle size lower;
- architecture easier to understand;
- runtime overhead smaller;
- the project closer to a game than to a web application shell.

---

# 9. Rendering Strategy

## 9.1 Primary renderer: WebGL

**Decision:** WebGL is the production renderer for the initial modern port.

Reasons:

- broad browser compatibility;
- mature PixiJS support;
- appropriate performance for a sprite-heavy 2D game;
- support for custom shaders and filters;
- no plugin or user installation required.

## 9.2 WebGPU policy

WebGPU may be tested later but must not become an initial deployment dependency.

Possible future uses:

- renderer comparison;
- portfolio benchmarking;
- advanced visual effects;
- technical experimentation.

The parity build must not depend on WebGPU availability.

## 9.3 Shader support

The architecture must allow shaders without requiring a framework change.

Potential later effects include:

- CRT-style post-processing;
- chromatic aberration;
- scanlines;
- glow;
- distortion;
- turbo effects;
- background treatment;
- impact effects.

Shaders are optional modernization layers and must not be required to reproduce the original gameplay.

---

# 10. Static-First Architecture

## 10.1 Core hosting requirement

The game must be a **fully static web application** for its first public release.

Production hosting must require only:

- HTML;
- JavaScript;
- CSS;
- images;
- audio;
- static metadata files.

No game server should be required.

## 10.2 Deployment target: GitHub Pages

**Decision:** Use GitHub Pages as the preferred production host.

Reasons:

- the revival repository is intended to be public;
- the game is static;
- deployment remains close to the source repository;
- unnecessary infrastructure is avoided;
- it supports direct browser play;
- it fits the portfolio objective;
- long-term maintenance burden is minimal.

## 10.3 Vercel decision

**Decision:** Vercel is **not required** and is not the preferred deployment platform for the parity release.

It should only be reconsidered if a future feature creates a concrete requirement that GitHub Pages cannot satisfy.

The project must not adopt server infrastructure merely because it is available.

## 10.4 Deployment flow

Preferred deployment:

```text
GitHub repository
        ↓
GitHub Actions
        ↓
npm ci
npm run build
        ↓
Vite dist/
        ↓
GitHub Pages
```

The deployment pipeline should be reproducible and automated.

## 10.5 Base-path support

The Vite configuration must correctly support repository-scoped GitHub Pages URLs, for example:

```text
https://<user>.github.io/<repository>/
```

All runtime asset references must work from a non-root base path.

---

# 11. Asset Architecture

## 11.1 Current issue

The original game uses a large shared sprite sheet, including `media/gameSprites_sheet.png`.

This was a reasonable optimization for the original runtime, but it creates unnecessary coupling for future development.

The revival should preserve atlas-based rendering efficiency while reorganizing assets into smaller logical bundles.

## 11.2 Asset strategy

**Decision:** Replace the single monolithic atlas with multiple functional atlases/bundles.

Do **not** necessarily create one texture per sprite.

The preferred granularity is by logical group.

Example:

```text
assets/
├── ui/
│   ├── menu/
│   └── hud/
│
├── player/
│   ├── normal/
│   ├── turbo/
│   └── effects/
│
├── enemies/
│   ├── destroyer/
│   ├── asteroid/
│   └── ...
│
├── effects/
│   ├── stars/
│   ├── particles/
│   └── explosions/
│
├── backgrounds/
│   └── ...
│
└── audio/
```

This should improve both maintainability and asynchronous loading behavior.

## 11.3 Why not one atlas per object

A fully fragmented asset layout may:

- increase request count;
- reduce batching efficiency;
- create unnecessary metadata overhead;
- complicate texture management.

The design should therefore favor **bundle-level modularity**, not maximal fragmentation.

## 11.4 PixiJS asset bundles

Asset loading should be organized using logical bundles such as:

```text
boot
menu
core-game
player
enemy-pack-1
effects
audio
```

This supports future content growth without requiring the initial boot sequence to load everything.

## 11.5 Extensibility rule

A future enemy should be addable without rebuilding an unrelated mega-atlas.

The asset pipeline should therefore allow new families to be introduced independently while preserving efficient rendering.

---

# 12. Loading Strategy

## 12.1 Requirement

The game should feel immediately available.

Actual total asset size is less important than **perceived startup time**.

## 12.2 Preferred boot sequence

```text
HTML shell
   ↓
minimal JS
   ↓
boot/menu assets
   ↓
interactive title screen
   ↓
background preload of core game bundle
   ↓
user presses PLAY
   ↓
game begins with little or no additional waiting
```

## 12.3 Loading rules

The parity implementation should:

- load only critical boot assets before the title screen;
- begin preloading gameplay assets as soon as practical;
- avoid blocking the UI on nonessential audio;
- cache loaded assets;
- avoid duplicate texture loads;
- report load failures clearly;
- keep loading deterministic;
- avoid unnecessary visual loading screens when background preloading is sufficient.

---

# 13. Image Formats

The project should evaluate modern formats during asset migration.

Preferred policy:

- retain PNG where lossless alpha and exact pixel output justify it;
- consider lossless WebP where it meaningfully reduces transfer size;
- avoid visual degradation solely for compression;
- preserve original art fidelity.

The parity milestone must prioritize correctness over aggressive optimization.

---

# 14. Audio Architecture

## 14.1 Selected API: Web Audio API

**Decision:** Use browser-native audio.

No plugin or third-party runtime should be required.

## 14.2 Autoplay considerations

Modern browsers restrict unsolicited audio playback.

The implementation should therefore assume that audio becomes active only after user interaction.

The title/menu flow should naturally provide this interaction.

## 14.3 Loading policy

Audio should not unnecessarily block initial rendering.

Large tracks should be eligible for deferred/background loading.

---

# 15. Game Loop and Update Model

The modern game should use PixiJS ticker/update infrastructure or a clean `requestAnimationFrame`-based loop.

The loop should keep separate concepts for:

- elapsed time;
- rendering;
- spawning;
- entity updates;
- collisions;
- animation state;
- UI state.

Where the original code relies on frame-dependent timing, the first port should reproduce observed behavior before attempting time-step modernization.

Any later conversion from frame-based behavior to delta-time behavior must be validated against the original.

---

# 16. Input Model

The initial port should preserve gameplay input behavior using browser-native pointer concepts through PixiJS.

Primary supported input:

- mouse;
- trackpad/pointer;
- potentially touch where behavior maps cleanly.

The first milestone must not redesign controls unless required for browser compatibility.

---

# 17. Collision Strategy

The original project does not justify introducing a full physics engine for the parity build.

The preferred approach is to preserve lightweight collision checks such as:

- axis-aligned bounding boxes;
- simple bounds intersection;
- manually defined collision regions where necessary.

A physics engine should only be introduced later if new gameplay requires it.

---

# 18. Recommended Project Architecture

A recommended initial structure:

```text
src/
├── main.ts
├── app/
│   ├── Game.ts
│   ├── config.ts
│   └── lifecycle.ts
│
├── scenes/
│   ├── BootScene.ts
│   ├── MenuScene.ts
│   ├── GameScene.ts
│   └── GameOverScene.ts
│
├── entities/
│   ├── Player.ts
│   ├── Enemy.ts
│   ├── Star.ts
│   └── ...
│
├── systems/
│   ├── SpawnSystem.ts
│   ├── CollisionSystem.ts
│   ├── ScoreSystem.ts
│   └── AudioSystem.ts
│
├── assets/
│   ├── manifest.ts
│   └── bundles.ts
│
├── ui/
│   └── ...
│
└── legacy-map/
    └── migration-notes.md
```

This is a starting point, not a mandatory final architecture.

The actual structure should remain proportional to the size of the project.

---

# 19. 1:1 Port Strategy

## 19.1 Phase 1 objective

The first implementation milestone is behavioral parity.

The game should reproduce:

- original player behavior;
- original enemy behavior;
- original spawn logic;
- original score logic;
- original progression/speed logic;
- original collisions;
- original turbo behavior;
- original animations;
- original game-over behavior;
- original audio cues where assets permit;
- original menu/game flow.

## 19.2 Port rule

When deciding between:

- preserving original behavior;
- improving architecture;
- introducing a new feature;

the first milestone must prefer:

1. behavior preservation;
2. understandable architecture;
3. new functionality last.

## 19.3 Verification method

The port should be compared against:

- original source behavior;
- original assets;
- recorded gameplay footage;
- known game rules;
- historical implementation details.

Differences must be documented rather than silently introduced.

---

# 20. Migration Mapping

A migration document should be maintained during implementation.

Recommended format:

| Legacy class/file | Modern target | Strategy |
|---|---|---|
| Main/root class | `main.ts` / `Game.ts` | rewrite around browser bootstrap |
| Starling sprite containers | Pixi containers | direct conceptual port |
| Starling images | Pixi sprites | direct conceptual port |
| Movie clips | AnimatedSprite | direct conceptual port |
| Starling juggler | Pixi ticker | adapt |
| frame events | update loop | adapt |
| Flash sounds | Web Audio | replace runtime API |
| TouchEvent | pointer events | adapt |
| texture atlas | Pixi spritesheet/bundles | migrate and split |
| debug stats | optional modern overlay | later |

The migration map should be updated as real porting decisions are made.

---

# 21. Performance Requirements

The game should remain comfortably lightweight for ordinary browsers.

Initial requirements:

- responsive input;
- stable animation;
- no avoidable frame stalls during ordinary play;
- no asset loading during critical gameplay unless explicitly designed;
- no blocking synchronous network activity;
- no server round trips required to play;
- no unnecessary framework runtime;
- avoid needless per-frame allocations where practical.

Formal performance budgets may be added after the parity build exists.

---

# 22. Browser Support

Initial target:

- current Chrome/Chromium;
- current Firefox;
- current Edge;
- current Safari where feasible.

The game should rely on broadly supported browser APIs.

A browser incompatibility that cannot reasonably be solved should fail gracefully and be documented.

---

# 23. Responsive Behavior

The game is browser-first, but the original experience should not be distorted merely to make every layout fully mobile-native.

Initial priorities:

1. desktop browser correctness;
2. proportional responsive scaling;
3. basic touch/pointer compatibility where appropriate.

A dedicated mobile UX can be treated as a later enhancement.

---

# 24. Accessibility

The parity build should avoid introducing unnecessary accessibility regressions.

Where practical:

- UI text should remain readable;
- buttons should be actual interactive elements when implemented in DOM;
- focus states should be visible;
- motion-heavy effects should eventually respect reduced-motion preferences;
- audio should not be the only signal for critical state.

These requirements apply primarily to new interface elements, not to rewriting the historical game design during the parity phase.

---

# 25. Repository and Historical Continuity

## 25.1 Principle

The original university project should remain preserved as a historical artifact.

The modern revival must not destructively modify the delivered historical state.

## 25.2 Ownership / fork decision

The exact GitHub ownership arrangement remains intentionally **pending**.

Options under consideration include:

- keeping the original repository under the current user and making it public;
- moving historical university repositories into a dedicated organization;
- creating a real GitHub fork for the revival;
- preserving the original repository unchanged while development continues in the fork.

The selected option must respect:

- original authorship;
- historical continuity;
- the coauthor's contribution;
- preservation of the delivered university version;
- transparent attribution.

This governance decision is separate from the technical port and must not block local planning.

## 25.3 Modern repository naming

Current preferred working name:

```text
super-nyangame-revival
```

Alternative names may be considered before repository creation.

The name should communicate continuation/restoration rather than imply that the project first originated in 2026.

---

# 26. Documentation Requirements

All project documentation must be written in **English** unless a future localization-specific file is intentionally created.

The modern repository should eventually include:

- `README.md`
- this PRD
- migration notes
- legacy-to-modern architecture mapping
- build instructions
- deployment instructions
- asset pipeline documentation
- license/attribution documentation
- historical context
- changelog or release notes

The README should clearly distinguish:

```text
Original university project
vs.
2026 modernization
```


## 26.1 Root documentation map and usage

The core project governance and portfolio documents should live in the **repository root** so that contributors, reviewers, and portfolio visitors can understand the project without searching through internal folders.

Expected root documents:

```text
README.md
PRD.md
BACKLOG.md
CONTRIBUTING.md
LICENSE.md
```

Each file has a distinct role and should be used as follows:

| File | Purpose | Usage rule |
| --- | --- | --- |
| `README.md` | Public-facing project overview, history, portfolio presentation, quick-start information, and links to the playable build and deeper documentation. | Keep it concise enough for first-time visitors. It should explain what the project is and where to go next, not duplicate the full technical specification. |
| `PRD.md` | Canonical product and technical requirements for the revival, including the selected stack, architectural decisions, parity goals, constraints, and planned phases. | Use this document to decide **what the project is supposed to become** and which technical/product decisions are currently authoritative. Update it when a durable requirement or architectural decision changes. |
| `BACKLOG.md` | Deferred, future, or discovered work that is not part of the currently authorized implementation scope. | Adding an item does **not** authorize implementation. Tasks should be prioritized and scoped before work begins. Post-parity features must remain here until the 1:1 milestone is accepted. |
| `CONTRIBUTING.md` | Canonical repository workflow: branch roles, topic-branch rules, squash merges into `dev`, promotion to `main`, documentation-only exceptions, release checks, and contribution hygiene. | Consult this before creating branches, merging work, promoting a release, or deciding whether a lightweight documentation change can be committed directly to `main` or `dev`. |
| `LICENSE.md` | Licensing boundaries for modern code, legacy code, creative assets, historical music, acquired sound effects, and third-party material. | Review this before adding, replacing, redistributing, or relicensing any code or asset. When provenance or rights are uncertain, do not assume that another repository license applies automatically. |

### Source-of-truth rule

When documents overlap, use the most specialized file as the source of truth:

```text
project overview / portfolio context  → README.md
product and technical requirements   → PRD.md
future or deferred work              → BACKLOG.md
repository workflow                  → CONTRIBUTING.md
licensing and redistribution rights  → LICENSE.md
```

Documentation should link to the relevant canonical file instead of copying large sections between documents. This reduces drift and makes later maintenance easier.

### Change discipline

- Update `PRD.md` when a lasting product, architecture, or parity requirement changes.
- Update `BACKLOG.md` when new work is identified but not yet authorized or when a deferred task changes state.
- Update `CONTRIBUTING.md` when repository workflow, branch policy, validation, or deployment procedure changes.
- Update `LICENSE.md` whenever asset provenance, ownership, redistribution rights, or licensing boundaries change.
- Update `README.md` when the public story, current project status, setup instructions, or portfolio links change.

A code change should update the relevant documentation in the same development cycle whenever it invalidates or materially changes an existing statement.


---

# 27. Future Leaderboard Architecture

## 27.1 Requirement

A leaderboard is planned for a later phase.

It must not be required to play the game.

## 27.2 Preferred minimal backend

Preferred future architecture:

```text
GitHub Pages game
        ↓ HTTPS
Google Apps Script Web App
        ↓
Google Sheets
```

The game remains static even after the leaderboard is introduced.

## 27.3 Why not direct browser access to Google Sheets

The frontend must not contain privileged credentials that allow arbitrary modification of a private Sheet.

The browser should instead communicate with a narrow Apps Script endpoint.

## 27.4 Conceptual API shape

Score submission:

```http
POST /score
Content-Type: application/json

{
  "name": "Player",
  "score": 18750
}
```

Leaderboard retrieval:

```http
GET /leaderboard
```

Example response:

```json
[
  { "name": "Player", "score": 18750 },
  { "name": "Player2", "score": 14200 }
]
```

## 27.5 Backend responsibilities

The future Apps Script endpoint should be responsible for:

- validating input shape;
- normalizing player names;
- enforcing score bounds;
- limiting malformed submissions;
- appending approved rows;
- returning a sanitized leaderboard view;
- avoiding direct exposure of private Sheet access.

## 27.6 Anti-abuse expectations

A browser game cannot make a public leaderboard fully cheat-proof because the client is under user control.

The goal is therefore not perfect anti-cheat.

The goal is to prevent trivial abuse.

Possible later controls:

- rate limiting;
- score plausibility checks;
- run duration checks;
- simple challenge/session tokens;
- duplicate-submission detection;
- server-side normalization;
- moderation/removal workflow.

No leaderboard security mechanism should block the static-first parity milestone.

---

# 28. Security and Privacy Principles

The parity build has an intentionally small attack surface because it has:

- no authentication;
- no persistent user database;
- no privileged backend;
- no secrets in the client;
- no remote write operations.

General rules:

- no secrets may be committed to the repository;
- no privileged Google credentials may appear in frontend code;
- dependencies should be kept minimal;
- third-party scripts should be avoided unless justified;
- external network requests should be absent from the parity build unless explicitly approved later.

---

# 29. Dependency Policy

Dependencies should be minimized.

Core expected production dependency:

```text
pixi.js
```

Development dependencies may include:

```text
typescript
vite
linting/formatting/testing tools
```

New runtime dependencies should require a clear functional justification.

Avoid installing large utility libraries for functionality that can be expressed cleanly with browser APIs or small project-owned code.

---

# 30. Testing Strategy

## 30.1 Unit tests

Unit tests should focus on deterministic game logic where useful, including:

- score calculations;
- spawn rules;
- speed progression;
- collision helpers;
- state transitions;
- asset manifest validation.

## 30.2 Integration tests

Integration validation should cover:

- boot sequence;
- menu-to-game transition;
- restart flow;
- input;
- asset loading;
- audio activation;
- game-over flow;
- resizing;
- GitHub Pages base path behavior.

## 30.3 Visual/manual parity tests

Because this is a historical port, manual comparison is essential.

Testing should compare the modern build against:

- recorded original gameplay;
- known timing;
- sprite animation speed;
- enemy movement;
- score pacing;
- collision feel;
- visual composition.

A behavior difference should be classified as either:

```text
intentional modernization
or
porting defect
```

It should never remain ambiguous.

---

# 31. Error Handling

The game should fail gracefully.

Required behavior:

- missing critical asset → visible error state;
- unsupported renderer → clear browser message;
- failed audio asset → gameplay continues if possible;
- optional asset failure → degrade without breaking the game;
- future leaderboard failure → gameplay remains fully available.

A backend outage must never prevent local gameplay.

---

# 32. Build and Deployment Requirements

The project should provide at minimum:

```bash
npm install
npm run dev
npm run build
npm run preview
```

The build must:

- succeed from a clean checkout;
- generate only static assets;
- use the configured GitHub Pages base path;
- not require private environment variables for the parity version;
- not require a local database;
- not require a local server beyond the development server.

---

# 33. GitHub Pages Requirements

The production site should:

- load from the repository Pages path;
- support direct refresh without broken asset URLs;
- serve all required game assets over HTTPS;
- avoid runtime assumptions about `/` as the site root;
- work without backend routing.

If routing is introduced later, it should remain compatible with static hosting.

---

# 34. Development Workflow

Recommended branch model:

```text
main
  ↑
dev
  ↑
feature/*
```

Possible feature branches:

```text
feature/pixi-bootstrap
feature/asset-pipeline
feature/player-port
feature/enemy-port
feature/audio-port
feature/parity-polish
```

The exact branch model may be adapted once the repository/fork ownership decision is finalized.

---

# 35. Port Phases

## Phase 0 — Historical preservation

- freeze/identify the historical source state;
- decide repository/fork ownership;
- document original authorship;
- verify asset provenance;
- preserve original source unchanged.

## Phase 1 — Modern project bootstrap

- initialize Vite + TypeScript;
- add PixiJS;
- configure GitHub Pages base path;
- create minimal renderer;
- define folder structure.

## Phase 2 — Asset migration

- inventory the monolithic sprite atlas;
- convert existing atlas metadata without repacking; defer physical splitting to SN-BL-001;
- generate Pixi-compatible atlases/manifests;
- validate visual parity;
- implement bundles.

## Phase 3 — Core runtime port

- application bootstrap;
- scene/state flow;
- player;
- enemies;
- spawning;
- collision;
- score;
- game-over state.

## Phase 4 — Audio and polish

- Web Audio integration;
- original sound behavior;
- load sequencing;
- responsive canvas;
- input refinement.

## Phase 5 — Parity verification

- compare against historical gameplay footage;
- fix timing deviations;
- fix animation differences;
- validate browser compatibility.

## Phase 6 — Static publication

- GitHub Actions;
- GitHub Pages;
- public README;
- historical attribution;
- initial release.

## Phase 7 — Post-parity modernization

Only after parity is accepted:

- shaders;
- more enemies;
- new effects;
- telemetry/debug overlay;
- additional modes;
- leaderboard;
- other gameplay extensions.

---

# 36. Acceptance Criteria for the First Public Revival

The parity release is ready when:

- the game runs without Flash;
- the game runs directly in supported browsers;
- no plugin installation is required;
- no backend is required;
- the title/menu flow works;
- the core game loop matches the original;
- player movement matches the original;
- enemy behavior matches the original;
- scoring matches the original;
- turbo/progression behavior matches the original;
- collisions feel consistent with the historical version;
- required audio works after user interaction;
- loading remains short and non-disruptive;
- assets load through logical bundles; original PNG atlases remain intact until parity acceptance;
- production builds as a static site;
- GitHub Pages deployment works from the repository path;
- the repository clearly distinguishes historical and modern work;
- original coauthorship is preserved and credited;
- documentation is written in English.

---

# 37. Deferred Decisions

The following decisions are intentionally postponed:

- exact GitHub organization/user ownership arrangement;
- exact repository/fork workflow;
- final public repository name;
- exact atlas packing tool;
- exact image compression settings;
- WebGPU experimentation;
- mobile-specific UX;
- leaderboard schema;
- leaderboard anti-abuse implementation;
- advanced shaders;
- new enemy designs;
- new gameplay systems.

These decisions should not delay the parity architecture.

---

# 38. Architectural Principles to Preserve

## Preserve history

The project is a modernization, not an attempt to erase the legacy implementation.

## Prefer parity before redesign

Behavioral fidelity comes before creative expansion.

## Keep the stack small

Every dependency and service must justify its existence.

## Stay static by default

If a feature can work without a server, it should.

## Load progressively

Users should see an interactive game shell before nonessential assets finish loading.

## Keep assets modular

New content should not require rebuilding unrelated asset packs.

## Prefer browser-native capabilities

Use standard browser APIs where they are sufficient.

## Keep the game playable when optional services fail

Leaderboard or telemetry outages must never break gameplay.

## Separate legacy and modern code conceptually

Historical source should remain understandable and attributable.

## Avoid premature engine complexity

Do not introduce ECS, physics middleware, or large application frameworks unless later requirements actually demand them.

---

# 39. Selected Stack — Final Summary

```text
Language
└── TypeScript

Rendering / scene framework
└── PixiJS 8

Production graphics API
└── WebGL

Optional future graphics path
└── WebGPU experimentation

Build tool
└── Vite

UI shell
├── HTML
├── CSS
└── TypeScript DOM code

Audio
└── Web Audio API

Assets
├── modular PixiJS spritesheets
├── logical asset bundles
└── asynchronous preload strategy

Production hosting
└── GitHub Pages

CI/CD
└── GitHub Actions

Initial backend
└── none

Future leaderboard backend
├── Google Apps Script
└── Google Sheets

Primary architectural goal
└── lightweight static browser game

Primary product goal
└── faithful 1:1 modern port before expansion
```

---

# 40. Final Decision

The modernization will proceed as a **TypeScript + PixiJS 8 + Vite static web project** using **WebGL**, browser-native APIs, modular asynchronous assets, and **GitHub Pages** deployment.

The project will deliberately avoid unnecessary backend infrastructure and heavyweight application frameworks.

The first milestone is a faithful port of the original ActionScript/Starling game.

Once parity is established, the revival may continue as an actively developed game with new enemies, visual effects, shaders, and an optional lightweight leaderboard, while preserving the original project as the historical foundation of the work.
