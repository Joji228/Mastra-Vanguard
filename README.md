[![Mastra Vanguard — Astra soaring over Meridian City](docs/media/mastra-vanguard-cover.jpg)](https://joji228.github.io/Mastra-Vanguard/)

# Mastra Vanguard

**Take to the skies. Break the sound barrier. Unleash the prism.**

A 2D superhero action-platformer starring **Astra**, a flying defender with super speed and a powerful prism arsenal. Fight across three distinct worlds, confront three unique bosses, or experiment freely in the Training Range.

<h2 align="center"><a href="https://joji228.github.io/Mastra-Vanguard/">▶ Jump in — play Mastra Vanguard</a></h2>

<p align="center">Desktop browser · Keyboard + mouse · No install or build step</p>

<p align="center">
  <a href="https://github.com/Joji228/Mastra-Vanguard/actions/workflows/smoke.yml"><img src="https://github.com/Joji228/Mastra-Vanguard/actions/workflows/smoke.yml/badge.svg" alt="Gameplay smoke-test status"></a>
  &nbsp; <a href="CHANGELOG.md">Release history</a>
  &nbsp; · &nbsp; <a href="#controls">Controls</a>
  &nbsp; · &nbsp; <a href="#play-locally">Play locally</a>
</p>

## Feel the power

- **Flight with momentum.** Launch from the ground, climb above the rooftops, and dive faster than you ascend.
- **Super speed with impact.** Build into Mach flight, trigger a Sonic Boom, and land with a damaging shockwave.
- **A prism-powered arsenal.** Aim a continuous Prism Beam, charge a piercing Super Beam, clear nearby threats with Prism Nova, or time a Prism Guard to block an attack.
- **Arcade missions.** Clear hostiles, reach the arena, and defeat the boss. Chase stage best scores and finish with a mission-results breakdown.

## Three worlds. Three bosses.

### Stage 1 · Meridian City

Neon rooftops, Shock Troopers, and Prism Drones. Astra's first deployment ends in a showdown with the **Prism Warden**.

[![Stage 1 gameplay — Astra fires a Prism Beam while flying above Meridian City's rooftops](docs/media/stage1.jpg)](docs/media/stage1.jpg)

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Stage 2 · Alien Frontier</h3>
      <p>Crystal terraces, Crystal Stalkers, and Spore Drones. Face the <strong>Astral Devourer</strong> beneath an alien sky.</p>
      <a href="docs/media/stage2.jpg"><img src="docs/media/stage2.jpg" alt="Stage 2 gameplay — Astra uses Prism Guard opposite the Astral Devourer"></a>
    </td>
    <td width="50%" valign="top">
      <h3>Stage 3 · Eclipse Foundry</h3>
      <p>An orbital solar forge with Solar Legionnaires, Flux Mantas, and Forge Weavers. Confront <strong>Heliarch Zero</strong>.</p>
      <a href="docs/media/stage3.jpg"><img src="docs/media/stage3.jpg" alt="Stage 3 gameplay — Astra fires at Heliarch Zero inside the Eclipse Foundry"></a>
    </td>
  </tr>
</table>

<sub>The cover is generated promotional artwork. Screenshots show the actual game renderer, with camera and actor placement arranged for readable stills. Click a screenshot to view it full-size.</sub>

<details>
<summary><strong>Training Range — practice without campaign pressure</strong></summary>

A separate **18,000 × 9,000-unit sandbox**, not a fourth campaign stage.

- Spawn any of the seven campaign enemy families or preview any of the three bosses.
- Test powers against a durable Practice Target with total-damage and rolling 2-second DPS readouts.
- Inspect collision/combat hitboxes, refill powers, clear targets, and reset the range.
- Campaign score and progression are never saved from the sandbox.

[![Training Range gameplay — practice targets, hitbox overlays, and spawning controls](docs/media/training.jpg)](docs/media/training.jpg)

</details>

## Start your first run

Choose **Stage 1** from the menu. Use `A` / `D` to move, tap `F` to fly, and hold the left mouse button while aiming. Clear the hostiles, then follow the arena marker to the boss.

Want to explore first? Toggle **God Mode** in the main or pause menu: invincibility, unlimited energy and Nova charges, and increased damage. Assisted runs have separate best scores.

## Controls

<details>
<summary><strong>Keyboard + mouse reference</strong></summary>

Gameplay keys follow physical key positions, independently of your typing layout.

| Input | Action |
| --- | --- |
| `A` / `D` | Move left / right |
| `W` / `S` | Jump or ascend / descend in flight |
| `F` | Toggle flight |
| Hold `Shift` | Build Super Speed |
| Hold `Shift` + `W` on the ground | Charge Power Launch |
| Aim + hold left mouse button | Continuous Prism Beam |
| Hold, then release `Space` | Charge and fire Super Beam |
| `V` | Prism Nova — area attack |
| `Q` | Prism Guard — timed shield |
| `Esc` | Pause / resume |
| `R` after defeat or completion | Retry |

**Power tips**

- Power Launch takes **0.6 seconds** and launches straight upward. Release either key during the charge to cancel.
- **Shift + S** builds into Mach speed in about **0.5 seconds** from a hover when energy and cooldown permit. Hit a deck at Mach speed for a damaging landing shockwave.
- Charge Super Beam fully for stronger damage; charging temporarily pauses the click beam.
- Nova starts with **three charges**. Defeating **three enemies** restores one charge; God Mode keeps charges unlimited.
- Guard lasts **one second** and costs speed energy. Block in its first **0.2 seconds** to regain flight energy. Its cooldown is five seconds.
- Health regenerates after **two seconds** without damage. Flight energy recovers while not flying and receives a boost after kills.

</details>

<details>
<summary><strong>Optional stage bonuses</strong></summary>

Each awards **+300 score** and can be skipped without blocking the boss.

- **Stage 1:** activate Prism Guard near the evacuation relay to protect it.
- **Stage 2:** destroy the crystal node with a beam or Nova.
- **Stage 3:** destroy the reactor regulator to stop its telegraphed vents.

</details>

## Make it comfortable

Open **Settings** from the main menu or pause with `Esc`. Adjust music and SFX volumes, screen-shake strength, **AUTO / HIGH / LOW** effects quality, reduced motion, and reduced flashing. Preferences are saved locally; system reduced-motion preferences provide the initial defaults.

The HUD adapts to smaller browser windows. You can hide control hints and minimize Training Range tools. Keyboard navigation is supported in the menus.

## Play locally

Download the repository and open **`index.html`** in a modern desktop browser. Keep `assets/` and `Background OST.mp3` beside it.

**No package install. No build process. No server required.** Node.js is only needed for developer tests, not for playing.

## An evolving project

Mastra Vanguard is a long-term creative project by [Joji228](https://github.com/Joji228), developed iteratively with **Codex**, beginning with **GPT-5.6**. Human direction and hands-on feedback guide the worlds, abilities, balance, and visual identity.

**Current version: 0.11 · Actively developed.** Recent work includes steadier hero animation and aiming, fairer boss hitboxes and warnings, sharper flight graphics, lighter loading, optional stage bonuses, and expanded Training Range tools.

Found a bug or have a gameplay idea? [Open an issue](https://github.com/Joji228/Mastra-Vanguard/issues). Include the stage, browser, reproduction steps, and a screenshot where possible.

<details>
<summary><strong>Development, tests & project history</strong></summary>

The game remains a dependency-free, single-file HTML/Canvas application with shared hero logic, a **120 Hz fixed simulation**, interpolated rendering, stage-specific artwork loading, and bounded effects.

Run the gameplay regression suite:

```sh
node tools/smoke-test.mjs
```

[Development & browser QA](docs/DEVELOPMENT.md) · [Release history](CHANGELOG.md) · [Gameplay audit](GAME_AUDIT.md) · [Original design brief](BENCHMARK_PROMPT.md) · [Presentation assets](docs/PRESENTATION.md)

Browser QA uses an existing Playwright installation; it is never required to play.

</details>
