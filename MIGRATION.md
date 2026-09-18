# Migration record

## Baseline and approved scope

The reference is the ActionScript source at `e4e19ad` (2026 documentation checkpoint; gameplay code inherited from the historical project). The original files now live in `legacy/`, unchanged. `SuperNyanGameGDD.pdf` and `LEGACY_PRESENTATION.txt` retain the historical documentation at the root.

Only the active revival repository may receive changes. The upstream repository remains read-only. After reviewing the initial approximation, the user authorized local squash integration into `dev` and closure of `codex/feature/legacy-parity`. The reviewed topic tip was `7c2b37e0aead773a5d75dd3ed6da596c61f45149` (seven commits). Integration preserves its tested implementation; only branch-status documentation is updated. No push or publication is authorized.

The user approved source-first parity, technical bug fixes, intact PNG atlases, proportional scaling, and suspension of simulation/audio while the page is hidden. Final visual and control-feel acceptance remains with the user.

## Implementation sequence

1. Preserve the baseline and align repository documentation.
2. Specify numerical and visual parity checks.
3. Bootstrap TypeScript, Vite, and PixiJS 8/WebGL.
4. Convert atlas metadata and reuse bitmap fonts without repacking images.
5. Implement progressive loading and the original screen flow.
6. Port the 60 Hz simulation, pointer input, and player.
7. Port spawning, enemies, and stars.
8. Port collision, score, health, progression, and Turbo.
9. Port the rainbow, particles, background, and HUD.
10. Integrate Web Audio and browser activation.
11. Verify lifecycle, numerical behavior, visuals, and browsers.
12. Prepare a static Pages-compatible build and local review commits.

## Source map

| Historical source | Modern responsibility |
| --- | --- |
| `Main.as`, `Game.as`, navigation event | Browser bootstrap and scene lifecycle |
| `Assets.as`, PNG/XML atlases, FNT files | Asset conversion, manifests, sprites and bitmap text |
| `Welcome.as`, `GameOver.as` | Menu and result scenes |
| `InGame.as` | Explicit run state and ordered 60 Hz simulation |
| `Cat.as` | Player model, animation, Starling-compatible geometry |
| `Obstacle.as` | Spawn data and enemy/star movement |
| `bgStar.as`, `Particle.as` | Background and collection effects |
| `Sounds.as` | Web Audio loading, activation, music and effects |

## Deliberate runtime adaptations

- Simulation executes fixed 1/60-second steps independent of display refresh. Long stalls are bounded; hidden-tab time is discarded instead of fast-forwarded.
- Audio starts/resumes only from a user gesture. A first gesture on START begins gameplay audio directly.
- Every run receives fresh state. Removed entities and inactive screens do not retain listeners, animation registrations, or audio channels.
- Original atlases stay intact. Asset bundles organize loading, not repacking.
- Historical audio is available for local parity review. Public redistribution remains subject to the unresolved items in `LICENSE.md` and SN-BL-003/004/005.
- Ported gameplay and substantial derivatives retain the legacy licensing boundary in `LICENSE.md`; TypeScript conversion does not automatically make them MIT.

## Validation status

The complete browser port is implemented. Verification evidence is recorded in `VALIDATION.md`, with operational commands in `DEVELOPMENT.md`. The parity tracker in `BACKLOG.md` distinguishes implementation from user acceptance. Visual and control-feel acceptance is still pending; this delivery has not been published.
