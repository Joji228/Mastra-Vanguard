# Astra Vanguard — GPT 5.6 SOL Web Game Benchmark

**A zero-dependency browser-game benchmark created with GPT 5.6 SOL to evaluate an AI model's ability to turn a single detailed prompt into a complete, polished, playable web experience.**

## [▶ Play Astra Vanguard Online](https://joji228.github.io/astra-vanguard-gpt-5-6-sol-xhigh/)

No download or installation is required. Open the link in a modern desktop browser and play immediately.

Astra Vanguard is an original 2D superhero action-platformer rendered with the HTML5 Canvas API. This long-term fork keeps the game runtime in one `index.html` file and adds a small set of local, generated character assets under `assets/sprites/`. It still runs by opening `index.html` in a modern desktop browser—no server, package manager, build step, external library, or installation is required.

## Long-term fork upgrades

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
- Original Meridian City panoramic map artwork, blended with the procedural skyline as a deep parallax layer

## Benchmark provenance

| Field | Value |
| --- | --- |
| Model | GPT 5.6 SOL |
| Environment | Codex desktop |
| Generation date | August 17, 2026 |
| Input | One detailed natural-language specification |
| Primary output | One self-contained `index.html` |
| External runtime dependencies | None |

The complete model-neutral specification is available in [`BENCHMARK_PROMPT.md`](BENCHMARK_PROMPT.md). This repository is intended as a reproducible artifact for comparing AI models on end-to-end web game development—not merely code completion.

## What the benchmark exercises

- Long-form instruction following and requirement coverage
- JavaScript architecture within a single-file constraint
- Delta-time game loops and responsive input handling
- Ground movement, flight physics, energy management, and collision resolution
- Camera-aware mouse aiming and instant-hit beam combat
- Ground and flying enemy behavior
- Health, damage, invulnerability, scoring, victory, death, pause, and restart states
- Procedural Canvas art, animation, particles, parallax, HUD, and Web Audio effects
- Responsive rendering and device-pixel-ratio handling
- Delivery of a complete playable artifact without external assets

## Run the game

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

## Suggested evaluation dimensions

When using the prompt with another model, consider scoring:

1. **Completeness** — How many explicit requirements are implemented?
2. **Playability** — Does the result work immediately and feel coherent?
3. **Correctness** — Are camera transforms, collisions, timing, restart logic, and state transitions reliable?
4. **Game feel** — Are movement, flight, combat, feedback, and balance enjoyable?
5. **Visual polish** — Does procedural presentation feel intentional and readable?
6. **Code quality** — Is the single-file implementation organized and maintainable?
7. **Constraint adherence** — Is the result truly offline, original, and dependency-free?
