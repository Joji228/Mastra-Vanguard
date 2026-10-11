# Presentation assets

[← Back to the game showcase](../README.md)

These images are documentation-only. They do not replace any game artwork and add no gameplay download cost. All five JPEGs together are approximately 1.2 MB.

## Visual direction

Use Astra's established cyan prism light, blue/silver armor, gold trim, and magenta-violet cape. The cover presents Meridian City's twilight skyline with a clear white two-line wordmark. Stage 2 keeps its violet/teal identity; Stage 3 keeps its amber/orange foundry identity.

Use **Mastra Vanguard** for the game, **Astra** for the hero, and **Stage 1 / Stage 2 / Stage 3** for campaign navigation. Training Range is a sandbox, not Stage 4. Keep promotional art distinct from actual gameplay captures.

## Files

| Asset | Use |
| --- | --- |
| [mastra-vanguard-cover.jpg](media/mastra-vanguard-cover.jpg) | README header; generated promotional key art, 1600 × 640 |
| [play-online.svg](media/play-online.svg) | Self-contained 240 × 52 play-link button; code-native SVG using the existing navy/cyan palette |
| [stage1.jpg](media/stage1.jpg) | Meridian City, flight and continuous beam |
| [stage2.jpg](media/stage2.jpg) | Alien Frontier, Prism Guard and Astral Devourer |
| [stage3.jpg](media/stage3.jpg) | Eclipse Foundry, beam and Heliarch Zero |
| [training.jpg](media/training.jpg) | Sandbox tools and hitbox inspection |

Gameplay captures are 1440 × 900 and come from the actual local game renderer. Actor/camera positions are arranged for readable stills; the capture helper pauses simulation without opening a pause overlay. It does not change sprite scales, remove HUD elements, or fabricate features. It waits for artwork and the menu transition, and fails on captured browser errors.

## Refresh screenshots

With the existing browser-test environment described in [Development](DEVELOPMENT.md):

```sh
node tools/capture-presentation.mjs
node tools/check-presentation.mjs
```

This deliberately overwrites the four documentation screenshots; inspect them before committing. The cover is preserved unless `--cover` is supplied with a new generated PNG path. That optional argument resizes/encodes the artwork as a JPEG without changing its composition.

## Cover generation record

Generated with the **built-in image-generation tool**, using the existing `assets/sprites/astra-vanguard.png` and `assets/backgrounds/meridian-city-v1.png` as identity/world references. The final project copy is `docs/media/mastra-vanguard-cover.jpg`; the high-resolution generated source remains in Codex's generated-images directory and is not needed by this repository.

Final prompt:

> Use case: ads-marketing. Asset type: wide GitHub README cover artwork for the original 2D browser superhero game Mastra Vanguard. Input images: Image 1 is the identity reference for Astra; preserve his short dark hair, blue/silver armor, gold trim, bright cyan prism chest, flowing magenta-violet cape. Image 2 is the visual world reference for Meridian City. Create polished illustrated key art, not a gameplay screenshot, with Astra in a dynamic soaring pose on the right and the neon blue city at twilight fading into deep navy on the left. Strong readable silhouette, restrained cyan prism light and magenta cape accents, epic but uncluttered. Wide landscape composition about 2.5:1. Large bold futuristic white wordmark on the left in two lines, exact text "MASTRA" then "VANGUARD", generous safe margins, entirely legible at thumbnail size. Typography is integrated and crisp, no additional text. Preserve the reference character design, original identity; no other superheroes, no logos of existing properties, no weapons, no extra characters, no UI, no watermark. This is promotional cover artwork, keep it faithful to the game.

## Suggested GitHub About copy

If the repository owner wants to update the GitHub sidebar, use:

**Description:** A browser-based 2D superhero action-platformer: fly at Mach speed, wield prism powers, battle three bosses, and experiment in a Training Range.

**Website:** https://joji228.github.io/Mastra-Vanguard/

**Topics:** `browser-game`, `javascript`, `html5-canvas`, `platformer`, `superhero`, `indie-game`, `game-development`

Repository metadata and GitHub's social-preview upload are separate from the README. They are not changed by these local files.
