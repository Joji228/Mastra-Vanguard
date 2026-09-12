# Gameplay polish audit — September 2026

## September 12 follow-up — local, unreleased

- Fixed missing kill rewards when Sonic Boom or Mach landing knocks a ground enemy into a gap. All three stages now award the usual score, flight energy and Nova progress once, with a five-second credit window. Unrelated or much later falls do not grant free kills.
- Made Forge Weaver teleport visibility consistent with combat: it cannot take damage or be staggered while phased out, and its health bar no longer reveals an invisible body. It becomes vulnerable again as it reappears. All damaging hero powers respect the same visibility rule.
- Retained the local menu/accessibility fixes: a separate pause-action footer avoids overlapping settings on small screens, Esc restores menu keyboard focus, and Reduced Flashing disables Prism Guard's repeating shimmer.
- Expanded smoke regressions cover both knockback abilities in all stages, an actual rooftop fall, duplicate/expired kill credit, and all damaging powers against phased-out Weavers followed by their return to vulnerability.
- Complete smoke and real Chrome browser audits pass. Browser checks cover all three boss-completion paths, ten restarts per stage, powers, menus, resize/fullscreen, loading failures and accessibility settings. No console/page errors were recorded. Combat uses assisted positioning/God Mode; this is not an unassisted difficulty playthrough.
- Latest 100-sample CPU update/Canvas-submission medians were 0.8 / 0.4 / 0.4 ms for Stages 1/2/3, with 17.84 / 22.75 / 10 draw calls per frame. These samples are not GPU/FPS measurements or evidence of a new performance gain.

No version change or GitHub push was made for this follow-up.

### Flight tuning follow-up

- Gravity-assisted dives now reach 1.45× climbing speed: 1,044 versus 720 units/s normally, and 3,335 versus 2,300 at full boost. Upward speed, Power Launch velocity, energy costs and the Mach-only landing requirement remain unchanged.
- Faster dive acceleration and stronger reversal braking make downward flight weightier while allowing responsive pull-outs. Releasing directional input retains powered hover; the speed envelope eases excess momentum away instead of snapping it to a cap.
- Velocity-driven blends soften sideways/ascent/descent pose changes. Vertical Mach afterimages now match the vertical hero art, with the sideways sheet retained as a missing-art fallback.
- Smoke regressions pass for every hero class at 30/60/120/144 Hz, including top speeds, diagonal limits, reversals, hover, pose blending, reset and sprite fallbacks. Keyboard flight checks and the complete three-stage Chrome integration audit pass without console/page errors.

### Airborne shooting follow-up (version 0.8)

- Added a transparent four-frame airborne shooting/cape sheet shared by all stages, with measured palm anchors, full vertical aim and matching boost afterimages. Ground shooting and beam damage/range remain unchanged.
- Super Beam charging uses the airborne pose too. Continuous beam rendering follows the interpolated hand without changing the simulation damage trace, avoiding a detached muzzle at high speed.
- Cape frames blend on a reused 180×128 offscreen surface, preventing the opacity dip caused by ordinary overlapping crossfades. Browser pixel checks measured chest alpha 253–254/255 through the loop.
- Regression coverage includes true asset transparency, all three stages, both facings, vertical/diagonal aiming, every cape frame, charge poses, beam interpolation and failed-art fallback. Built-in generation prompt and asset details are beside the new sprite.

## Original version 0.7 audit

Gameplay audit included in version 0.7. No new stage, mandatory dependency, or artwork replacement.

## Root-cause fixes and polish

- **Timing:** 120 Hz fixed simulation, bounded catch-up, and render interpolation. Input taps survive frames with no simulation tick. Existing tuned maximum speeds are preserved.
- **Shared Astra:** Stage 2 now inherits the same movement, collision and powers as Stages 1/3. This fixes Stage 2 God Mode void recovery and prevents future stage-specific power drift.
- **Flight:** releasing Shift decelerates through the existing boost curve; depleted energy no longer rapidly toggles boost. Vertical poses follow actual momentum rather than prematurely flipping on a direction key.
- **Combat:** continuous beams apply the God Mode damage multiplier and respect boss beam hitboxes. Hit feedback is throttled independently of damage, so it no longer repeatedly freezes minion animation/velocity. Fast projectiles use swept collision.
- **Sonic Boom:** 28 base damage within 220 units, brief minion stagger, interrupted windups and stronger airborne push. A three-second cooldown prevents threshold spam. Boss attack timing is unchanged; Mach landing remains the stronger impact and consumes its armed landing state.
- **Enemies/bosses:** stuck detection measures attempted movement before collision stops velocity. Warden dash targets are locked and telegraphed; the Heliarch sweep shows its actual starting ray and traversed sector, with matching active beam width.
- **Camera/HUD:** shared speed-sensitive tracking and bounded look-ahead, boss framing where both bodies fit, an off-screen boss indicator, shared hero HUD, and boss bars clear of action buttons.
- **Loading/performance:** stage-specific image loading and decoding, a deployment screen, boss art ready before play, graceful image failures, prewarmed color grading, visible-only facade tiles, cached gradients, and bounded particle reuse.
- **Menus/settings:** saved AUTO/HIGH/LOW effects, shake strength, reduced motion and reduced flashing; OS reduced-motion defaults; keyboard focus handling; charge cancellation on pause; sticky pause actions.
- **Completion:** score/best/time/kills/damage/health results, replay and next-stage buttons. God-assisted runs use separate stage best scores even if God Mode is subsequently disabled.

The authored layouts, enemies, artwork, soundtrack and existing powers remain. Extra mid-stage events were deliberately deferred to keep this a focused polish pass rather than add untested pacing systems.

## Validation

- Existing smoke suite passed before editing; the expanded suite passes after changes.
- Regression comparisons produce matching run, flight and boost states at 30/60/120/144 rendering rates across all three stages.
- All three boss-death/completion paths, repeated restarts, particle bounds, pause timing, image success/failure and accessibility behavior are covered.
- Real Chrome tests open local `index.html` with `file://`: keyboard/mouse controls, flight, Power Launch, Mach, landing impact, beams, Nova, God Mode, pause/restart/menu, resize/fullscreen, artwork loading, and results.
- Browser combat clears all minions using the real beam input, samples opening and late-phase boss attacks (including LOW effects), then verifies each boss defeat and results panel.
- Browser checks include ten consecutive restarts per stage, an intentionally failed boss image, OS reduced-motion defaults, and console/page-error collection.

Browser combat uses accelerated positioning and God Mode; late phases are reached by lowering boss health. It is a repeatable integration playtest, not a claim of an exhaustive unassisted campaign or human difficulty evaluation.

## Performance measurement

Initial 1280×800 Chrome samples (100 update/draw calls per stage) measured approximately 17.8 / 28 / 10.1 `drawImage` calls per frame for Stages 1/2/3. An intermediate optimized Stage 2 sample used 22.8 calls, about 19% fewer; Stage 1/3 draw counts were effectively unchanged.

CPU update/Canvas-submission medians were sub-millisecond before and after; these are not GPU completion times or universal FPS claims. Final per-stage samples and screenshots are regenerated by `browser-audit.mjs` in the ignored `artifacts/browser-audit/` folder.

Run `node tools/smoke-test.mjs`. The optional browser audit requires an existing Playwright installation; see the README for environment overrides.
