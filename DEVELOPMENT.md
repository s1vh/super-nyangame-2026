# Local development and review

## Run

Use Node.js 24 LTS (minimum 22.12) and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173/super-nyangame-2026/. Move the pointer up and down; holding a button is unnecessary. On a touchscreen, drag vertically. START begins a run; the star on the result screen returns to the menu. Audio becomes available after a browser gesture.

The logical stage remains 1280 x 800 and scales proportionally with letterboxing. Valid pointer targets are strictly between y=50 and y=750. Hidden-document time is discarded and audio is suspended. No scores or settings are sent to a server.

## Check and build

```sh
npm run check
npm run preview
```

The production preview is http://127.0.0.1:4173/super-nyangame-2026/. `dist/` is a static build using that repository base path. For a different hosting path, pass an explicit Vite base override when building. Do not open index.html with file://.

`npm run assets` converts XML metadata and copies the original images, fonts and audio into ignored `public/assets/`. Development, test and build commands run that conversion automatically. `public/assets/` and `dist/` must not be hand-edited or committed. The legacy tree is excluded from the deployed output except for the assets explicitly copied by the converter.

## Browser checks

Build first, then install the test browsers once:

```sh
npx playwright install chromium firefox webkit
npm run test:browser -- --project=chromium --project=firefox --project=webkit
```

On Windows with Microsoft Edge installed, `npm run test:browser -- --project=edge` uses an isolated temporary profile. The suite checks responsive sizing, pointer mapping, repeated runs, failed asset recovery, unavailable audio, visibility suspension and the production base path. Its visibility test synthesizes the browser notification; it is not proof of every operating system's background-tab behavior. Browser traces on failures stay in ignored `test-results/`.

The optional development URL `?qa=1` shows visible controls for pausing, stepping, collecting, receiving damage, enabling Turbo and finishing a run. These controls are excluded from production JavaScript. They are test fixtures, not gameplay features. The animated START button intentionally never settles; browser tests click its current hit area without waiting for motion to stop.

## Layout

| Path | Responsibility |
| --- | --- |
| `src/main.ts` | Browser lifecycle, loading, screen transitions and input |
| `src/game/` | Fixed-step clock and renderer-independent simulation |
| `src/render/` | Pixi scenes, Starling-compatible clip geometry and bitmap score layout |
| `src/audio/` | Gesture activation, music, effects and suspension |
| `src/assets/` | Runtime manifests and progressive asset loading |
| `scripts/` | Reproducible build-time conversion |
| `tests/` | Source fixtures and isolated browser integration tests |
| `legacy/` | Unmodified historical source, artwork and build artifacts |

The source tree is intentionally small. There is no generic ECS, physics engine, backend, remote leaderboard or new game mode. The exact source ordering is documented in `PARITY.md`; preserve it when changing simulation code.

## Review and publication

The reviewed initial port is squash-integrated into local `dev`, and `codex/feature/legacy-parity` is closed. `main` remains at the pre-port baseline. Continue future work from `dev` on a new topic branch; detailed parity review remains open.

The prepared GitHub Actions workflow validates the build and tests; it has no deployment job. It has not been run remotely. Promotion to `main`, publishing, changing repository settings, and resolving the historical audio redistribution questions are separate follow-up work. See `CONTRIBUTING.md`, `BACKLOG.md` and `LICENSE.md`.

Tooling references: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [Playwright browser projects](https://playwright.dev/docs/test-projects), [Playwright web servers](https://playwright.dev/docs/test-webserver), [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0).
