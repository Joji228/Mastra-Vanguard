# Development & verification

[← Back to the game showcase](../README.md)

Mastra Vanguard runs directly from `index.html`. The optional tools below are for development only: do not introduce a build step or mandatory dependency for players.

## Project map

| Location | Purpose |
| --- | --- |
| `index.html` | Menus, shared player, three campaign stages, Training Range, Canvas rendering, audio and settings |
| `assets/sprites/` | Hero, enemies, bosses and effects artwork |
| `assets/backgrounds/` | Stage environments and facades |
| `Background OST.mp3` | Looping gameplay soundtrack |
| `tools/` | Regression tests and optional browser audits |
| `docs/media/` | README artwork and gameplay captures; never loaded by the game |
| `CHANGELOG.md` | Numbered release history |

## Gameplay regression tests

Use Node.js 24, matching the GitHub workflow:

```sh
node tools/smoke-test.mjs
```

The suite covers shared powers, stage completion, collision/combat geometry, enemies and bosses, settings/loading, Training Range, and behavior at 30/60/120/144 Hz rendering rates. GitHub runs it on pushes to `main` and pull requests.

## Optional real-browser checks

Use an **existing** Playwright installation and Chrome/Chromium. No browser-test dependency is necessary for gameplay. If Playwright is available through ordinary module resolution, overrides are optional.

PowerShell example — replace these placeholders with your installed paths:

```powershell
$env:PLAYWRIGHT_MODULE = 'C:\path\to\node_modules\playwright'
$env:BROWSER_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node tools/browser-audit.mjs
```

| Tool | Checks |
| --- | --- |
| `browser-audit.mjs` | All three campaign completion paths, powers, menus, restarts, fullscreen, asset recovery and console errors |
| `release-audit.mjs` | Sprite registration, boss geometry, combat probes and crowded-range checks |
| `flight-hud-audit.mjs` | Flight poses, aiming and windowed HUD |
| `ui-fit-audit.mjs` | Menu/settings fit across viewport sizes |
| `ui-polish-audit.mjs` | HUD and interface state combinations |
| `polish-features-audit.mjs` | Dual Shift, range damage readouts, optional events and animation caches |
| `audit-fixes-test.mjs` | Gameplay focus after toolbar/canvas clicks, Reduced Flashing including fallback art, late loading, Retry and stage-switch recovery |

Reports/screenshots are written to the ignored `artifacts/` directory. Automated campaign completion uses assisted positioning/God Mode: it is integration coverage, **not** an exhaustive unassisted playthrough or a guarantee of subjective balance. CPU Canvas-submission samples are not GPU/FPS measurements.

## Presentation checks

```sh
node tools/check-presentation.mjs
node --check tools/capture-presentation.mjs
```

These commands check local documentation links, image dimensions/budgets, the advertised version, and the optional capture script's syntax. See [Presentation assets](PRESENTATION.md) for screenshot refresh instructions.

## Working on the game

- Preserve the existing artwork, tuned movement and single-file architecture.
- Hero changes must apply consistently to all three stages and the range.
- Keep attack warnings readable at every effects setting.
- Add regressions for changed mechanics, then check the relevant browser paths.
- Keep release notes short; detailed audit findings belong in the audit documents.

For a bug report, include the stage/mode, browser and viewport, God Mode state, exact inputs, expected/actual behavior, and a screenshot or recording. Never include credentials or personal data in reports.
