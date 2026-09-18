# Contributing to Super NyanGame Revival

This file is the canonical reference for repository workflow, branch promotion, lightweight documentation changes, and backlog maintenance.

Product goals and technical decisions belong in `PRD.md`. Deferred work belongs in `BACKLOG.md`. Licensing boundaries belong in `LICENSE.md`.

The project is intentionally static-first: there is no dedicated production branch. Stable releases are deployed directly from `main`.

---

## Current parity review

The user approved the initial port for local squash integration into `dev` and closure of `codex/feature/legacy-parity`. Subsequent work should start from `dev` on a new topic branch. The historical upstream remains read-only. Further merges, pushes and deployments require a separate user request. These local-only restrictions override the general promotion examples below. See `DEVELOPMENT.md` for the implemented commands and `VALIDATION.md` for evidence.

## Branch roles

### `dev`: primary development branch

`dev` is the persistent integration branch for active development.

- Create new feature and fix branches from `dev`.
- Prefer short-lived topic branches such as:
  - `feature/...`
  - `fix/...`
  - `refactor/...`
  - `docs/...`
  - `codex/feature/...` or `codex/fix/...` for work carried out with Codex.
- Keep each topic branch focused on one coherent change.
- Topic branches may be pushed normally for review, testing, backup, and collaboration.
- Do not merge incomplete work into `dev`.
- When a topic branch is complete, tested, and approved, **squash-merge it into `dev`** so the integration branch records one clear checkpoint for that feature or fix.
- Delete or archive the topic branch only after the squashed result is confirmed in `dev`.
- Code integrated into `dev` should remain runnable and internally coherent even while other features are still under development.

`dev` is not deployed publicly by default.

---

### `main`: stable and deployable branch

`main` represents the current stable version of Super NyanGame Revival.

- Keep `main` releasable at all times.
- Promote work from `dev` only when the complete integrated tree has been tested and is ready for public deployment.
- Promote the **coherent `dev` state**, rather than cherry-picking individual feature commits into `main`.
- A promotion should leave `main` functionally equivalent to the validated `dev` tree, apart from intentionally independent documentation-only commits.
- GitHub Pages deployment is triggered from `main`.
- Do not develop normal features directly on `main`.

There is intentionally **no `prod` branch**. The project does not currently need a separate deployment-specific source tree.

---

## Promotion flow

```text
topic branch
(created from dev)
      │
      │ complete + tested
      │ squash merge
      ▼
     dev
      │
      │ integrated validation
      │ release approval
      ▼
     main
      │
      ▼
GitHub Pages deployment
```

The normal path is:

```text
topic branch → dev → main → deployment
```

A topic branch is a working branch.  
`dev` is the integration checkpoint.  
`main` is the stable public release.

---

## Documentation-only changes

Small documentation changes do not require a dedicated feature branch when creating one would add more process than value.

Examples include:

- typo corrections;
- README wording;
- attribution clarifications;
- minor license notes;
- backlog updates;
- small PRD clarifications;
- links, badges, or formatting fixes.

These changes may be committed directly to:

### `main`

Use `main` when the documentation change:

- applies to the currently published project;
- is independent of unfinished development;
- should be visible publicly immediately.

If the same file is also relevant to ongoing work in `dev`, make sure the documentation change is incorporated into `dev` before the next promotion so it is not accidentally lost or reverted.

### `dev`

Use `dev` when the documentation change:

- describes work currently under development;
- updates the backlog while multiple features are active;
- documents behavior that is not yet released;
- belongs naturally with an upcoming development milestone.

Documentation should follow the branch whose state it describes.

---

## Publishing and deployment

The project is designed to deploy as a static site.

Expected release flow:

```text
main
  ↓
GitHub Actions
  ↓
Vite production build
  ↓
dist/
  ↓
GitHub Pages
```

Before promoting `dev` to `main`:

- confirm that the integrated build passes;
- confirm that the game runs from the configured GitHub Pages base path;
- verify that required assets load correctly;
- verify that no local-only files, credentials, private purchase records, or unrelated artifacts are included;
- update documentation when behavior, controls, architecture, or licensing changes;
- confirm that the release remains playable without a backend.

A leaderboard or other future service must remain optional and must not make the core game dependent on backend availability.

---

## Backlog management

`BACKLOG.md` records identified future work.

- A backlog entry does not authorize implementation by itself.
- Before work begins, confirm the scope, priority, and acceptance criteria.
- When a task starts, mark it **in progress** and record the working branch when useful.
- Completed entries should not simply disappear.
- Mark completed work **resolved** and record the relevant outcome, decisions, verification, and residual debt when appropriate.
- New ideas discovered during unrelated work should normally be added to the backlog rather than silently expanding the current task.

The initial project milestone remains a faithful 1:1 port. Post-parity ideas should stay deferred until that milestone is accepted.

---

## Historical preservation

Super NyanGame Revival is a modernization of an older university project, not a rewrite intended to erase its origin.

Contributions should preserve the distinction between:

- the historical ActionScript / Starling project;
- the modern TypeScript / PixiJS revival.

Do not rewrite historical authorship or silently replace legacy context.

When migrating old behavior:

1. reproduce it first;
2. verify parity;
3. refactor or expand it afterward.

The project principle is:

> **Preserve first. Port second. Improve third.**

---

## Licensing

Before adding or replacing assets, verify that the repository has the right to redistribute them.

In particular:

- newly written revival code follows the repository's software-license rules;
- creative assets follow the applicable content license;
- historical Nyan Cat music remains excluded unless its rights are verified;
- legally acquired sound effects remain subject to their original acquisition licenses;
- third-party libraries and assets retain their own licenses.

Do not assume that material is freely redistributable merely because it is old, widely shared, or part of an Internet meme.

---

## Readiness checklist

Before squash-merging a topic branch into `dev`:

- confirm that the task is complete;
- run the relevant tests, linting, and build;
- verify the affected behavior manually when appropriate;
- update documentation if the change alters behavior or architecture;
- confirm that no unrelated changes are included;
- leave the working tree clean.

Before promoting `dev` to `main`:

- validate the complete integrated tree;
- verify the static production build;
- verify GitHub Pages compatibility;
- confirm that documentation matches the release;
- confirm that licensing and attribution remain accurate;
- ensure `main` will receive the complete intended release state.

---

## Summary

```text
feature/fix branch
    ↓ squash
dev
    ↓ full validated release
main
    ↓
GitHub Pages
```

Keep topic branches focused, `dev` coherent, `main` stable, and the historical project clearly attributable.
