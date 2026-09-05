# Mastra Vanguard

<h2><a href="https://joji228.github.io/Mastra-Vanguard/">▶ Click here to play Mastra Vanguard</a></h2>

Mastra Vanguard is a three-stage 2D superhero action-platformer spanning Meridian City, an alien planet, and the Eclipse Foundry. Play as Astra: fly, sprint at super speed, and unleash powerful prism abilities.

This is a long-term creative game project developed with Codex and GPT-5.6.

## Version 0.7 highlights

- Smoother movement, stronger Sonic Boom, and clearer boss attacks
- Faster stage loading, lighter effects, and accessibility settings
- Mission results and fixes across all three stages

## Version 0.6 highlights

- Global God Mode toggle with unlimited Prism Nova charges
- 50% larger Prism Nova range
- Stage 1 naming and menu polish

## Version 0.5 highlights

- New Stage 3: Eclipse Foundry
- Unique Solar Legionnaire, Flux Manta, Forge Weaver, and Heliarch Zero boss
- New map art, enemy/boss visuals, VFX, and polished Stage 3 combat

## Version 0.4 highlights

- Power Launch and dedicated vertical-flight poses
- Upgraded walk, sprint, and wind-flowing idle animation
- Full-range piercing Super Beam in both stages
- Refined boss effects, combat, hitboxes, and movement

## Version 0.3 highlights

- New Astral Devourer model and animations
- Smoother Stage 2 enemy movement
- Fixed wall and ledge stalls
- Rebalanced minion and boss combat

## Version 0.2 highlights

- New alien-world Stage 2
- Animated alien enemies and scenery
- Three-phase Astral Devourer boss
- Continuous piercing heat vision

## Version 0.1 highlights

- Stage 1 campaign and Prism Warden boss fight
- Stage 1 and God Mode
- Flight, Shift super speed, Super Beam, and Prism Nova ultimate
- Animated Astra, shock troopers, drones, boss, and city scenery
- Original Meridian City art, music, sound effects, and pause-menu audio controls

## Play locally

Open `index.html` in a modern desktop browser. No install or build step is needed.

Run `node tools/smoke-test.mjs` for the gameplay smoke tests.

Optional browser QA: `node tools/browser-audit.mjs` with an existing Playwright installation. Set `PLAYWRIGHT_MODULE` to its module directory and `BROWSER_PATH` to a Chrome/Chromium executable if needed. Reports and screenshots go to the ignored `artifacts/browser-audit/` directory. No browser-test dependency is required to play.

## Controls

| Input | Action |
| --- | --- |
| `A` / `D` | Move |
| `W` / `S` | Jump, ascend, or descend |
| `F` | Toggle flight |
| Hold `Shift` | Super speed |
| `Shift` + `W` | Power Launch |
| Click | Fire prism beam |
| Hold then release `Space` | Super Beam |
| `V` | Prism Nova |
| `Esc` | Pause |
| `R` | Restart |

Open **Settings** from the main menu or pause with `Esc` to adjust audio and visual preferences. AUTO effects reduce cosmetic work after sustained slow rendering; all quality levels preserve attack warnings. Reduced-motion system preferences supply the initial accessibility defaults. `R` restarts after defeat/completion; use the pause menu to restart an active mission.

Project history and the original design brief: [`BENCHMARK_PROMPT.md`](BENCHMARK_PROMPT.md).
