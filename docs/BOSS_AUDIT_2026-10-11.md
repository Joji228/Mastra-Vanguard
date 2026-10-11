# Boss fight audit and local playtest pass — October 11, 2026

Local changes for player review, version 0.11. Nothing committed or pushed.

## Findings and fixes

All three slams previously emitted two shallow, horizontal floor waves. Flying above their 28–34-unit hit areas bypassed the attack. Each slam now emits one expanding circular blast centered at the locked floor impact, damaging ground and airborne bodies in every direction. The visual and collision radii match. Each blast makes at most one damage attempt; a Guard block consumes that attempt. It expands over roughly 0.7–0.9 seconds and fades for 0.22 seconds. The filled interior remains dangerous until it fades, so moving into the blast is unsafe too.

The full destination circle appears during both windup and descent, including when the boss body is offscreen. Its boundary remains readable with LOW effects, Reduced Flashing, and unavailable VFX. Devourer and Heliarch land at the locked horizontal destination. Leaving the circle, climbing beyond its radius, and timing Guard remain valid responses.

| Boss | HP before → after | Blast radius by phase | Blast damage by phase | Additional pressure |
| --- | --- | --- | --- | --- |
| Prism Warden | 2000 → 2200 | 440 / 485 / 530 | 18 / 20 / 22 | Slams introduced in phase one, slightly faster bolts; generous warnings/recovery |
| Astral Devourer | 3400 → 3800 | 540 / 585 / 630 | 22 / 24 / 26 | Faster predictive volleys, shorter volley recovery, existing pulse and final-phase shards |
| Heliarch Zero | 3900 → 4800 | 640 / 685 / 730 | 25 / 27 / 29 | Wider predictive fans, phase-two sweeps, core volleys during sweeps, airborne foundry zones |

Heliarch's foundry zones previously used floor-only ellipses. Boss zones now use circles at the hero's altitude at cast time, retain the authored lateral safe corridor, and add one delayed circle at the old hero position. They never track after appearing. Ground-only Weaver hazards retain their existing geometry.

## Artwork

Warden's lower movement poses crossed the source row separator and lost helmet pixels. Devourer's raised hands and dash silhouette extended outside nominal source cells. Heliarch's old sheet contained hard vertical cuts in capes/attack poses.

Built-in imagegen produced a replacement Warden movement sheet and replacement Devourer/Heliarch sheets. The source poses were packed into padded equal runtime cells. Original artwork remains available. All runtime frame borders have zero visible alpha. Waist/chest roots, Devourer/Heliarch solid-body bounds, palm emitters, and landing contacts are registered against the new pixels. Devourer dash collision now follows its horizontal artwork. See [saved generation prompts and atlas details](../assets/sprites/boss-replacements.prompts.md).

## Validation

- `node tools/smoke-test.mjs`: passes, including all-direction airborne blast collision at 30/60/120/144 Hz, circular corner exclusions, expiry, single-hit Guard behavior, foundry altitude/delay, offscreen LOW/reduced warning visibility, and genuine alpha gutters in every replacement frame.
- `tools/boss-fights-audit.mjs`: real Chrome passes with no captured page/console errors. Tests airborne slams for all three bosses, normal-health fight strategies, and visual pose/warning/blast captures.
- `tools/browser-audit.mjs`: full Chrome campaign suite passes, including all three completion paths, repeated restarts, powers, loading and Training Range.
- Presentation and whitespace checks pass.
- During the initial boss pass, the older `release-audit.mjs` timed out in its simulated artwork Retry check because the notice auto-recovers. The final game audit corrected the test race and the release suite now passes; see [the final audit](FINAL_GAME_AUDIT_2026-10-11.md).

Normal-health stationary probes, with automatic Guard and a fixed random seed:

| Boss | Held-click clear / damage taken | Full-charge clear / damage taken | Air-hover charge clear / damage taken |
| --- | --- | --- | --- |
| Warden | 21.64 s / 68 | 16.80 s / 35 | 16.80 s / 54 |
| Devourer | 30.81 s / 100 | 23.60 s / 111 | 23.60 s / 96 |
| Heliarch | 38.51 s / 173 | 29.95 s / 110 | 29.95 s / 154 |

These are repeatable pressure probes, not a human difficulty rating. Damage totals include damage healed by regeneration. All strategies completed, and individual strategies vary; the progression is strongest in encounter duration and airborne pressure. Player feedback should decide further tuning.

## Playtest

Open the local game and select Training Range → Boss Preview to try each boss directly with God Mode off, or play the campaign. Test slams while hovering 250–400 units above the impact, escaping the marked radius, and using Guard. Check both facings during movement, dash, shooting, slam and recovery. For Heliarch, change altitude during foundry warnings and move around the core sweep while its volleys fire.

Generated browser captures and the machine-readable report are in the ignored `artifacts/boss-fights-audit/` directory.

## Attack artwork follow-up

On the player's request, generated and integrated three additional effect atlases with built-in ImageGen: per-boss charging/blast rings, four solar-foundry states, and Heliarch's core orbs/emitter flare/beam/endpoint flare. See [prompts and packing metadata](../assets/sprites/attack-effects.prompts.md). The existing character replacements remain in use.

The area textures are clipped to the real damage circle, and the laser texture is clipped to its 26-pixel damage band. The chest flare uses the registered emitter origin and core orbs are centered on their actual projectile position. Native warning outlines and image-failure fallbacks remain. All new cell edges have zero alpha. Shared blast art loads in each stage; solar art loads in Stage 3 and Training Range. This follow-up changes rendering only: damage, ranges, delays, volley count and projectile speed are unchanged.

`tools/attack-vfx-audit.mjs` passes in real Chrome: asset loading scope, per-pixel circle/beam containment, LOW/reduced settings, missing-image fallback rendering and visual captures. The smoke suite passes new atlas-gutter/core/legacy-effect regressions. The boss fight audit passes again with unchanged seeded clear times and damage totals for all nine strategies and no browser errors. The visual captures are saved in ignored `artifacts/attack-vfx-audit/`. Everything remains local for player review; no GitHub push or commit was made.
