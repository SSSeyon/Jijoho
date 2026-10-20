# Jijoho Residence — session handover

## Where things live
- **Real repo**: `G:\My Drive\Personal things\App\Jijoho\Jijoho\` (has `.git`, remote `https://github.com/SSSeyon/Jijoho.git`). Branch `main`, currently **level with `origin/main`** — clean, nothing to push.
- **Outer folder** `G:\My Drive\Personal things\App\Jijoho\` has no `.git`. It's an untracked duplicate that the dev server actually serves from. **Standing rule: make every change in the nested repo, then copy the changed files out to the matching path in the outer folder** so the preview stays in sync. Verify with `diff` before trusting a browser check — see memory `repo-lives-in-nested-folder`.
- Dev server: `.claude/launch.json` config `"jijoho-static"`, port 8177. Preview at `http://localhost:8177/index.html`.
- No `node`/`python` on PATH; a portable node binary lives in the session scratchpad at `<scratchpad>/node-v24.19.0-win-x64/node.exe` if you need to run a script or `node --check`.

## Standing constraints from the user
- **"Commit only, I'll push"** was said once, but the user has since pushed on their own — most recent commit `73364f8` (".") is already on `origin/main`. Don't assume the constraint still holds; ask or check `git status -sb` before pushing anything yourself.
- The nested repo is the single source of truth for all current and future changes.

## What happened this session (in order)
1. Did a **full measured design review** of the model — read every JS file, ran the live scene in the browser, pulled real numbers via `window.__J` (rooms, `PLANNING`, `QUANT`, collision-based clear-floor sampling, `renderer.info`). Published it as an Artifact:
   **https://claude.ai/code/artifact/215418bc-99f5-401f-ad12-ffa96faaef43** ("Jijoho Design Review", 38 findings across livability / missing services / bloat / doc-vs-model drift / performance).
   - Two live-watch subscriptions on that artifact both dropped (connection kept failing, gave up reconnecting). The page itself is untouched and still updatable by republishing the same file path — the failed watches only mean this session won't be auto-notified of outside edits.
2. User asked to **act on two items from the review**:
   - **C2-adjacent: removed the outdoor kitchen** entirely from `js/05-upper-floor.js` (counter run, screen wall, grill, sink, breakfast bar, stools, light — the whole IIFE), plus its `ZONES` entry and "Jump to…" viewpoint in `js/07-controls.js`, its bullet in `index.html`, and its line in the cost table. Rewrote the two gym comments and the garden-intro comment that referenced it (door stays on the east elevation; noted the gym could grow south into the freed ground but I didn't do that).
   - **C5: removed `CTOFF`** and all now-dead machinery: the `CTOFF` map itself, all six `if(x.t && CTOFF[x.t]) continue;` guards (in `06-plans.js` and `07-controls.js`), `tagged()`, `setRear()`, `rearBlock`, and the `CTOFF:`/`setRear:`/`rear:` keys in the `window.__J` debug export. Left `CTAG` and the `t:"garden"` labels in place (written, currently unread) as a documented hook in case a rear-option toggle ever comes back — **flagged this as a judgement call the user might want reversed.**
3. Verified in the running browser: `node --check` passes on all 7 JS files; console shows only the pre-existing (unrelated) `BufferGeometryUtils` interleaved-attribute errors, nothing new; `zoneAt`/`collides`/`floorAt` at the old outdoor-kitchen coordinates now read `Rear garden` / not-colliding / lawn height; walked the camera through the freed ground and the gym in-game and screenshotted it — reads as continuous lawn, gym unaffected.
4. Mirrored the five changed files (`index.html`, `js/01-core.js`, `js/05-upper-floor.js`, `js/06-plans.js`, `js/07-controls.js`) from the nested repo out to the outer served copy.
5. Reported the diff to the user; they committed and pushed it themselves as `73364f8`. **`/model` was then switched to `claude-sonnet-5`** for this session (was Opus 5 previously — note this if behavior/quality expectations shift).

## Open items / not yet done
- **The published review artifact is now stale on finding C3** ("four structures in an 8.3 m garden strip") — it's three now that the outdoor kitchen is gone. Offered to refresh it; not done.
- Only 2 of the review's 38 findings were acted on (outdoor kitchen removal, CTOFF cleanup). The rest — including the two flagged as most urgent, **A1 (no ground-floor shower)** and **B2 (no roof drainage drawn)** — are still open. See the artifact for the full list and the "if you only do six things" shortlist at the bottom.
- Outer/nested copies are in sync as of the last check in this session (`diff --strip-trailing-cr` clean across all `js/*.js` and `index.html`). Re-verify if anything changed outside this session.
- `standalone.html` (992 KB stale duplicate, flagged as C4 in the review) has not been touched.

## Session 2 (2026-08-29) — Vantage UI + garden changes

Uncommitted at time of writing. Changed: `index.html`, `css/app.css`,
`js/01-core.js`, `js/02-fittings.js`, `js/05-upper-floor.js`, `js/06-plans.js`,
`js/07-controls.js`. Also **new and untracked: `.claude/launch.json` +
`.claude/serve.ps1`** in the nested repo (the preview tool needs a launch config
in the cwd; the outer folder's copies are untouched).

1. **Implemented the "Vantage" UI redesign** from a Claude Design canvas
   (`Jijoho Vantage.dc.html`, delivered as a zip — the DesignSync MCP needs
   `/design-login`, which cannot run in a non-interactive session).
   - Old `#bar` top bar, `#hint` box, `#goto` dropdown and `#mobileHelp` are
     gone. New: `#hdr` wordmark, `#capsule` (hover-revealed two-row bottom
     capsule), `#roomIndex` ("Walk me to…" sheet, built live from `ROOMS` and
     `ZONES`), `#helpOverlay` (one-time, replaces the hint box).
   - Every original control ID was kept and re-wired, so camera/quality/
     day-cycle/gate/vehicle logic is untouched. `dismissHint()` keeps its name
     and call sites but now closes the help sheet.
   - Ivory/clay theme applies to the capsule, sheets and `#infoPanel` only.
     **`#planPanel` is deliberately still dark** — its SVG colours are tuned to
     it. Note the pre-existing teal-on-teal `.b.on` label bug in `#planBar`.
2. **Mobile fix** (user reported the new capsule overlapping the nav pad):
   under 720px the directional `#pad` is hidden (joystick + drag already do
   it), `#nav` moves to the right edge at mid-height, `#foot` moves to below
   the wordmark, and both capsule rows wrap instead of scrolling.
3. **Floating lights fixed.** The pergola lamp sat *above* its own rafters and
   the tent lamp hovered 35 mm under the ridge bar. New `hangLight()` in
   `02-fittings.js` (next to `pendant()`) drops a rod from a named member.
4. **Mini gym moved indoors.** The 4.10 × 2.80 garden pavilion is deleted; the
   gym is now the former upstairs sitting area (`Z("Upstairs gym")`, was
   `"Upstairs sitting area"` — renamed in `01-core.js`, `07-controls.js` SPOTS
   and the `index.html` schedule). `06-plans.js` no longer counts it toward
   coverage (worth ~11.5 m² off). Its garden ground is now plain lawn.
5. **A playground was built in the rear garden and then removed at the user's
   request** ("take out the playground"). Everything was reverted: the block in
   `05-upper-floor.js`, the `MAT.rubberSafe`/`MAT.sandPit` materials, the zone,
   the viewpoint, and the `index.html` bullet. The two hedge runs and the shrub
   at (0.70, 8.85) were restored to their original values. **If a playground is
   wanted again, the ground is there** — roughly 5.5 × 5.5 m between the
   pergola, the path and the kitchen garden.

Open: the published review artifact
(https://claude.ai/code/artifact/215418bc-99f5-401f-ad12-ffa96faaef43) is now
stale on several counts (C3's structure count, and the whole UI section).
A1 (no ground-floor shower) and B2 (no roof drainage) are still not done.

## Useful commands for a fresh session
```bash
cd "G:/My Drive/Personal things/App/Jijoho/Jijoho" && git status -sb
```
```bash
cd "G:/My Drive/Personal things/App/Jijoho" && for f in js/*.js index.html; do diff --strip-trailing-cr "$f" "Jijoho/$f" | grep -c '^[<>]' | grep -qv '^0$' && echo "DRIFT: $f"; done; echo checked
```
