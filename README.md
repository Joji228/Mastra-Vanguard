# Astra Vanguard — GPT-5.6 Sol Web Game Benchmark

**A zero-dependency browser-game benchmark created with GPT-5.6 Sol to evaluate an AI model's ability to turn a single detailed prompt into a complete, polished, playable web experience.**

Astra Vanguard is an original 2D superhero action-platformer rendered entirely with the HTML5 Canvas API. The whole game lives in one `index.html` file and runs by opening that file in a modern desktop browser—no server, package manager, build step, external library, downloaded asset, or installation is required.

## Benchmark provenance

| Field | Value |
| --- | --- |
| Model | GPT-5.6 Sol |
| Environment | Codex desktop |
| Generation date | August 17, 2026 |
| Input | One detailed natural-language specification |
| Primary output | One self-contained `index.html` |
| External runtime dependencies | None |

The complete input specification is preserved verbatim in [`BENCHMARK_PROMPT.md`](BENCHMARK_PROMPT.md). This repository is intended as a reproducible artifact for comparing AI models on end-to-end web game development—not merely code completion.

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

## Originality

The game uses an original hero, setting, visual identity, and procedurally drawn assets. It does not use Superman names, logos, characters, costumes, music, or downloaded intellectual property.

