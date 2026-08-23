# Mastra Vanguard

**Mastra Vanguard is a living 2D superhero action-platformer built as a long-term creative project with Codex and GPT-5.6. Every update deepens the combat, movement, art direction, and world of Meridian City.**

## [▶ Play Mastra Vanguard Online](https://joji228.github.io/Mastra-Vanguard/)

No installation is required. Open the link in a modern desktop browser and play immediately.

Mastra Vanguard is an original HTML5 Canvas action-platformer. You play as Astra, protecting Meridian City from shock troopers and prism drones with flight, super speed, and a hand-fired prism beam. The game uses local assets, runs from a single `index.html` file, and needs no build step or external runtime dependencies.

## Long-term development

This repository is the home for an ongoing game, not a one-off demo. Codex and GPT-5.6 are development partners in a continuing process of improving gameplay, visuals, animation, sound, balance, and the wider world. The ambition is simple: make Mastra Vanguard more expressive, polished, and fun with every playable release.

## Current highlights

- High-detail transparent artwork for Astra, shock troopers, and prism hunter drones
- Procedural fallback rendering if a sprite is unavailable
- Telegraphed shock-trooper rush attacks with distinct charge feedback
- Orbiting prism drones with visible charge states and three-shot shard volleys
- Improved hostile projectile silhouettes, trails, hit readability, and encounter scoring
- Genuine multi-frame Astra and shock-trooper sprite sheets: idle/breathing, alternating left/right footfalls, plus hand-fired prism beam, flight, and charge poses
- Supporting motion polish: flight banking, thruster trails, beam recoil, muzzle flashes, hit reactions, and hover pulses
- Disk-native alpha transparency for direct `index.html` play, plus four-beat walk timing and per-frame foot-baseline alignment
- Directional prism-beam poses: Astra's leading arm and hand now track steep/shallow upward and downward firing angles
- Hold-to-activate super speed for running and flight, with a separate rechargeable energy bar, afterimages, particles, streaks, and activation audio
- Four-beat breathing/weight-shift idle animation with a looping ambient cape breeze
- Dedicated four-frame airborne cape-ripple animation that accelerates with flight speed
- Smoothed, forward-only cape phase blending during flight acceleration and deceleration
- Expanded flight-energy capacity from 100 to 135 for 35% longer sustained flight
- Original Meridian City panoramic map artwork, blended with the procedural skyline as a deep parallax layer
- Four original modular building-facade styles layered across the playable city architecture
- Prism beams pass through building scenery while enemies and destructible crates still intercept shots
- Flight energy recharges 25% faster whenever Astra is not flying, and every enemy defeat restores 10% of the full meter
- Distance-synchronized Shift sprinting for Astra and animated alternating charge footfalls for shock troopers
- Looping Meridian City background OST with independent music/SFX volume controls and a full pause-menu mixer

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern desktop browser.

### Controls

| Input | Action |
| --- | --- |
| `A` / `D` | Move left / right |
| `W` | Jump or ascend while flying |
| `S` | Descend while flying |
| `F` | Toggle flight |
| Hold `Shift` | Activate super speed while moving |
| Left mouse / `Space` | Fire prism beam toward the cursor |
| `Esc` | Pause / resume |
| `R` | Restart after death or victory |

## Project notes

The original model-neutral design brief remains available in [`BENCHMARK_PROMPT.md`](BENCHMARK_PROMPT.md) as part of the project's history. Mastra Vanguard has since become its own long-term game project, with its direction shaped through continued iteration in Codex and GPT-5.6.
