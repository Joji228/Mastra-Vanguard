# Mastra Vanguard

<h2><a href="https://joji228.github.io/Mastra-Vanguard/">▶ Click here to play Mastra Vanguard</a></h2>

Mastra Vanguard is a three-stage 2D superhero action-platformer spanning Meridian City, an alien planet, and the Eclipse Foundry. A separate Training Range sandbox is included for movement, combat and boss testing. Play as Astra: fly, sprint at super speed, and unleash powerful prism abilities.

This is a long-term creative game project developed with Codex and GPT-5.6.

## Version 0.11 highlights

- Smoother Astra aiming, movement animations, and reliable Power Launch
- Fairer boss attacks, aligned sprites, and clearer enemy reactions
- Polished responsive menus/HUD and expanded regression tests

Older releases: [Changelog](CHANGELOG.md).

## Training Range

- Large sandbox map with elevated platforms and long vertical flight space
- Spawn every campaign enemy family, preview all three bosses, refill powers, or reset the range
- Sandbox score and campaign progression are never saved
- Open flight shafts connect upper decks to the deep range; nearby target spawning is capped at 48
- Boss previews use matching combat floors; Refill Powers also revives Astra after defeat
- Ground targets require a nearby deck; use flying targets while exploring open space

## Play locally

Open `index.html` in a modern desktop browser. No install or build step is needed.

Run `node tools/smoke-test.mjs` for the gameplay smoke tests.

Optional browser QA: `node tools/browser-audit.mjs` with an existing Playwright installation. Set `PLAYWRIGHT_MODULE` to its module directory and `BROWSER_PATH` to a Chrome/Chromium executable if needed. Reports and screenshots go to the ignored `artifacts/browser-audit/` directory. No browser-test dependency is required to play. Focused checks: `node tools/flight-hud-audit.mjs`, `node tools/release-audit.mjs`, `node tools/ui-fit-audit.mjs` and `node tools/ui-polish-audit.mjs` using the same environment overrides.

## Controls

Gameplay controls follow physical key positions, independently of the typing layout.

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
| `Q` | Prism Guard (timed shield) |
| `Esc` | Pause |
| `R` | Retry after defeat / completion |

**Prism Guard:** press Q for a 1-second animated shield without interrupting movement or flight. Costs 20 speed energy, with a 5-second cooldown. Block within the first 0.2 seconds to recover 10% flight energy (once per cast). Custom sprites smoothly form, shimmer, turn gold on a perfect block, and dissolve. God Mode waives the energy cost; falling out of the map cannot be blocked.

**Flight:** hold S to dive up to 45% faster than climbing; Shift + S reaches Sonic Boom in about 0.5 seconds from a hover when energy and cooldown allow. Hold W to pull up, or release movement to brake toward a stable hover. Applies in every stage.

Super Beam: full charges now deal more damage than rapid partial charges. Charging pauses the click beam; both beams damage within their colored core, not the decorative glow.

Beams preserve Astra's moving body and legs while his firing arm follows your aim, on the ground and in flight. Diagonal travel uses sideways flight; straight ascent/descent uses the vertical poses. Power Launch only reports ready when both energy reserves can sustain takeoff.

Menus and Settings fit a 1080p screen without scrolling, including normal browser chrome; small windows retain accessible scrolling. The HUD automatically compacts for smaller browser windows. Training controls can be minimized, and the controls hint can be hidden in Settings. Artwork failures show a retry option without restarting the mission. Settings displays the current version.

The interface uses stage-colored mission cards, clear resource values, three Nova charge indicators and live Guard/Launch states. Navigate stage selection with arrow keys or Home/End, then Enter; Tab also reaches Settings, Sound and Fullscreen. Reduced motion applies to menu transitions as well as gameplay effects.

Open **Settings** from the main menu or pause with `Esc` to adjust audio and visual preferences. AUTO effects account for simulation, rendering and sustained slow frames; all quality levels preserve attack warnings. Reduced-motion system preferences supply the initial accessibility defaults. `R` restarts after defeat/completion; use the pause menu to restart an active mission.

Project history and the original design brief: [`BENCHMARK_PROMPT.md`](BENCHMARK_PROMPT.md).
