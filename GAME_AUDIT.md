# Mastra Vanguard — full-game audit

Date: 2026-09-29. Reviewed checkout: `d0b069b`, version 0.9.

## v0.11 implementation follow-up — September 30

- Reliable minimum-energy Power Launch, cancelled outward boundary velocity, and Mach feedback based on actual speed.
- Registered Astra pelvis/feet, phase-aware walk/sprint transitions, and an independent aiming arm on ground/vertical flight. Continuous beams track the rendered palm without changing simulation damage.
- Warden slams target and lock the real support floor; grounded shockwaves and missing-art floor warnings now work. Measured waist anchors stabilize its animation.
- Heliarch beams/dash contacts follow structural body bounds, its sweep uses exact capsule geometry, and lances originate at the authored firing palm. Dash pursuit/warnings share its visible chest. Devourer dash banking matches both travel directions.
- Brief minion hit reactions preserve attack telegraphs; hovering enemies retain facing; Stage 2 warnings reserve audio headroom.
- Includes the local responsive menu/HUD polish and expanded regression coverage. Existing movement speeds, HP, maps, powers and source artwork remain.

Some authored sprite effects still contain baked cutoffs/stray fragments. Source-art regeneration and new Stage 2 attack-transition frames are deferred; this release does not claim to recreate that artwork.

Validation: expanded smoke tests pass, including 30/60/120/144 Hz cases. Real-Chrome campaign checks pass for all three completion paths and 30 repeated restarts, plus powers, Training Range, settings, fullscreen and artwork recovery, with no captured console/page errors. UI checks pass at seven window sizes and across 768 HUD states. Normal-mode scripted boss probes and a 48-target/boss stress scene also pass. Completion checks use assisted positioning/God Mode; they are not an unassisted human campaign playthrough. Aiming composites are reused across boost afterimages rather than regenerated for each ghost.

## v0.10 implementation follow-up

The original audit below is retained as the pre-change record. The following fixes and polish have now been implemented:

- Capsule-shaped beam hit detection matching colored widths, with rounded-corner and all-stage regressions. Decorative glow does not deal damage.
- Full-charge Super Beam payoff restored; charging no longer stacks continuous-beam damage. Infinite range, God Mode and existing controls retained.
- Lossless optimization of 39 runtime PNGs: 74,369,050 → 69,453,447 bytes (6.61% saved), with exact pixel and metadata preservation. No art deleted or downscaled.
- Unused stage color-grading canvases released; AUTO quality includes simulation cost and slow frame intervals. Beam VFX cleanup is shared across all four modes.
- Consistent walk/sprint footstep phase and launch palm transforms; no new body wiggle or duplicate diagonal-flight silhouettes.
- Stronger contrast on boss dash/slam markers and reserved warning-sound voices, without more particle clutter.
- Artwork failure notice/retry without resetting the mission; minimized Training controls and optional hints persist. Version 0.10 is visible in Settings.
- Expanded smoke and Chrome release checks, including seeded normal-mode boss strategies and a 48-enemy/boss stress scene. A read-only GitHub smoke-test workflow was added.

Optional stage events, checkpoint/retry scoring, key rebinding and new vertical arm artwork remain future design work, not features claimed for this release. The current movement, authored maps, enemy HP and boss attack timings were preserved.

This is an audit and improvement plan, not an implementation pass. No gameplay, art, settings, version, or deployment changes were made.

## Overall assessment

The game has a solid foundation. All three campaign completion paths, Training Range, core powers, menus, restart flows and the tested flight/HUD layouts work in the current checks. The largest remaining opportunities are combat fairness, asset weight, animation continuity and stronger normal-mode balance validation. A movement rewrite or another stage is not the recommended next step.

Existing improvements worth preserving include the shared Player implementation, 120 Hz fixed simulation and interpolation, swept projectile collision, stage-specific loading/decode, viewport culling, bounded particle reuse, cached textures/gradients, accessibility settings and assisted-score separation. These are already implemented, not missing features.

## Validation and its limits

- Read the game, README, smoke tests, relevant asset metadata and previous audit notes; inspected current browser screenshots of hero poses, bosses, compact HUD and results.
- `node tools/smoke-test.mjs`: PASS, including 30/60/120/144 Hz regressions, shared powers, loading/fallbacks, settings and Training Range.
- `tools/browser-audit.mjs`: PASS in real Chrome using local `file://`. All three stages completed; ten restarts per stage; powers, keyboard/mouse, pause/menu, God Mode, resize/fullscreen, boss phases and failed-image handling checked. No captured console/page errors.
- `tools/flight-hud-audit.mjs`: PASS. Diagonal versus straight vertical flight and five window sizes from 1366×650 to 480×300 checked; windowed boss HUDs reviewed.
- Additional normal-mode probes reproduced the Super Beam balance and width issues below and quantified loaded image storage.

The campaign browser audit accelerates target positioning and uses God Mode for completion. It does **not** establish unassisted difficulty, a complete human playthrough, every possible collision, or subjective audio quality. Performance samples measure CPU update/Canvas submission, not completed GPU frames or universal FPS. Local loading times are not GitHub Pages network timings.

## Priority 1 — confirmed combat issues

### 1. Partial-charge Super Beam spam outperforms full charges

In a 13-second controlled normal-mode test against a stationary target:

| Input | Approximate damage/sec |
| --- | ---: |
| Release Super Beam every 0.34 seconds | 382 |
| Release fully charged Super Beam every 1.30 seconds | 208 |
| Partial charges plus held mouse beam | 587 |

`Player.fireSuperBeam` interpolates damage from 80 to 270 but uses a fixed 0.32-second cooldown. Cooldown advances during the next charge, so the substantial low-charge base damage rewards repeated partial charges. Continuous Prism Beam can also run throughout charging. Full charges therefore lose much of their intended payoff.

Recommended: tune the charge/damage curve and explicitly decide whether charging and continuous fire should stack. Preserve responsiveness, infinite screen-spanning range and existing controls. Add input-driven regressions for partial/full charge throughput, cooldown overlap and mouse+Space. Do not simply inflate boss HP to compensate.

### 2. Super Beam's visible thickness does not match damage

The full beam renders a 44-unit-wide colored band, but damage checks use a zero-width `rayRect` centerline. A 4×4 target offset 15 units from that centerline is inside the colored band and takes **zero** damage in the probe.

Recommended: define a damaging core width and use a swept/capsule-style beam-versus-hitbox check that matches it. Keep decorative glow non-damaging. Verify horizontal, vertical, diagonal and both-facing shots against minions and all three bosses, including phased-out Forge Weavers. Continuous beam has the same centerline approach; decide and document its narrower damaging core too.

## Priority 2 — loading and performance

### 3. Artwork is expensive to download and retain

Current image asset inventory is about 93 MiB; runtime-referenced assets account for about 71 MiB. Critical stage image sets total about 42.5 / 38.1 / 35.0 MiB for Stages 1/2/3; Training Range totals 56.3 MiB. Shared hero assets are included in each set and are normally reused, not downloaded again on every stage change. The soundtrack adds only about 0.71 MiB.

After visiting all stages, original decoded image dimensions imply approximately 222 MiB of uncompressed RGBA pixels, plus 36 MiB of cached tinted canvases. This is a **pixel-storage estimate**, not measured browser process/heap memory, and excludes canvas/GPU/browser overhead. Retaining a finite asset set is not evidence of an unbounded leak.

Recommended order:

1. Lossless PNG optimization; measure actual transferred bytes and decode times on a cold browser load.
2. Carefully reduce oversized source sheets where the displayed size permits it, preserving alpha, cape margins and all measured sprite anchors.
3. Split or trim unused sheet regions where worthwhile. Preserve authored originals in an art archive; do not delete historical art blindly. Roughly 22 MiB of legacy files are not referenced by the runtime registry, but removing them alone will not improve runtime loading.
4. Bound stage-specific tinted-texture retention; consider stage-image eviction only if measured memory pressure justifies reload costs.

Maintain direct `index.html` playability, existing fallbacks and no mandatory build system.

### 4. AUTO effects quality only measures render submission

The quality controller's measured cost starts after `advanceFrame`, so simulation cost is excluded. GPU shadow/compositing work may also complete asynchronously after Canvas submission.

Recommended: track simulation cost, render-submission cost and sustained frame intervals separately. Use conservative adaptation with hysteresis and always-visible attack telegraphs. Stress-test 48 Training Range enemies, boss previews, simultaneous powers and high-DPI windows before adding more pools.

Current campaign samples at 1280×800:

| Stage | Median CPU ms | p95 CPU ms | Draw-image calls/frame |
| --- | ---: | ---: | ---: |
| 1 | 0.7 | 1.8 | 17.8 |
| 2 | 0.4 | 0.7 | 22.8 |
| 3 | 0.3 | 0.5 | 10.0 |

These samples do not show an urgent campaign CPU bottleneck or justify pooling every object. Mobile/integrated-GPU and crowded-range measurements remain useful.

### 5. Failed loading needs clearer recovery

`requestStartMode` counts failed critical assets but starts the stage without a visible failure summary or Retry action. Fallback rendering works, but players cannot distinguish intentionally simpler graphics from failed artwork.

Recommended: a small non-blocking missing-art message and retry action. Test slow loads as well as outright failures, particularly late boss art and stage switching. Keep gameplay available with fallback graphics.

## Priority 3 — animation, presentation and camera

### 6. Improve transitions with the existing artwork first

Diagonal flight now correctly uses the side pose, and shooting keeps that body while the arm aims. Preserve this behavior. Straight up/down sprites, ground aim sheets and launch bodies still use different art/anchor paths; abrupt pose changes deserve targeted visual checks.

Recommended:

- Standardize torso/pelvis/head reference points and apparent body scale across idle, walk, sprint, flight and launch before generating more art.
- Make walk-to-sprint frame selection phase-continuous. Rendering currently switches sheets and phase divisors immediately; smoothed locomotion fields do not drive the selected body frame.
- Prefer a short transition pose or controlled rotation to overlapping two full silhouettes, which previously caused ghosting/wiggle.
- Test beams during the first 0.15 seconds after Power Launch: launch bodies and `flightArmAnchor` use different transforms, so their muzzle alignment is a code-review risk requiring visual confirmation.
- Improve vertical-flight arm aiming when shooting off-axis; its extended fist is currently fixed while the beam can point elsewhere. Ground aiming near extreme angles also merits review.

These are polish targets, not claims that the previous size/facing bugs have all returned. Existing flight/HUD checks pass.

### 7. Improve readability without more particle clutter

Boss telegraphs remain visible on LOW effects in the reviewed screenshots. Keep that separation. Add clearer danger outlines/silhouettes where magenta attacks overlap the Stage 2 background or orange attacks overlap Stage 3 scenery. Keep impact flashes brief and preserve Reduced Flashing. Avoid increasing effect density around Astra.

At small window sizes, the Training panel is scrollable and fits, but occupies substantial play space. Add a collapse/minimize button and an optional compact-controls hint. The current tests check bounding rectangles; add tests that every scrolled action remains reachable and that opening a panel does not steal combat input unexpectedly.

### 8. Tune high-speed camera visibility only where needed

Shared speed-sensitive look-ahead, safety framing and boss indicators already work. Further tests should focus on Mach dives at 480–800-pixel widths, abrupt reversals, knockback and arena edges. Consider modest speed-sensitive framing/zoom only after measuring reaction space; avoid adding lag or oscillation to ordinary flight.

## Priority 4 — balance, pacing and quality of life

### 9. Establish normal-mode combat baselines

Run unassisted boss encounters with repeatable seeds and record time-to-kill, incoming damage and attack opportunities. Compare grounded play, ordinary flight, high-altitude hovering, corner camping and Mach descent. Arena escapes/safe zones need targeted validation; this audit did not confirm an escape exploit.

Differentiate minion roles through windup, recovery, movement and counterplay instead of more health. Evaluate how Nova's kill recharge, regeneration, Guard and partial-charge beam throughput interact before altering enemy damage. Preserve existing God Mode rules.

### 10. Give stages one short distinctive pacing beat

All three still primarily follow clear hostiles → arena → boss. Optional, compact events could add identity without another stage: a city-defense beat in Stage 1, a crystal-node interaction in Stage 2, or a reactor vent hazard in Stage 3. Introduce only one small event at a time, with clear HUD instructions and restart/progression tests. Preserve infinite beams rather than restricting their range to solve pacing.

### 11. Add useful, lightweight convenience features

- Optional boss retry/checkpoint with clearly marked score/time rules; full arcade restart should remain available.
- Key rebinding and a short interactive Training explanation for Guard timing, Mach landing and charge behavior.
- Visible version/build identifier in settings so players can confirm GitHub Pages updates without guessing from graphics.
- Prioritize boss-warning sounds over repetitive combat sounds when the bounded audio voice budget is full; review audibility with music enabled.

Touch controls, gamepad support, more stages and additional powers are larger separate projects, not the next polish priority.

## Maintainability and release safeguards

Keep the single-file design and shared Player. Incrementally consolidate repeated stage update/cleanup/progression patterns using an explicit stage context, not a risky full rewrite. Training currently aliases campaign fields to reuse their logic; document those invariants and cover mixed-family targets/boss switching before changing them.

Add automated smoke/asset validation before deployment, plus browser checks where practical. Test sprite borders, anchor consistency, beam widths, charge balance, normal-mode boss counterplay and crowded-range stability. Keep generation notes, but separate art archives and historical release notes from the short README. Do not silently change tuned controls or upgrade versions during an audit.

## Recommended implementation sequence

1. Fix beam width and charge balance; add regressions.
2. Optimize image delivery and cache retention; improve loading recovery.
3. Smooth existing sprite transitions and verify launch/vertical muzzle anchors.
4. Normal-mode boss/minion balance pass, high-speed camera checks and compact Training UI.
5. Small stage-specific pacing/QoL additions only after the above stabilizes.

Evidence: regenerated `artifacts/browser-audit/report.json`, `artifacts/flight-hud-audit/` screenshots, and `artifacts/game-audit-2026-09-29/probes.json`. These are local ignored test outputs, not committed game assets.
