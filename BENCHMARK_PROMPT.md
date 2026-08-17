# Model-Neutral Benchmark Prompt

This model-neutral version preserves the complete game specification while removing the original model-specific opening.

```text
You are acting as an expert JavaScript game developer. Build me a **complete, playable browser-based superhero platformer game** inspired by the *feeling* of Superman-style powers, but **do not use copyrighted Superman names, logos, costumes, characters, music, or assets**. Create an original flying superhero.

## Main requirement

Create the entire game so that it runs by simply opening:

`index.html`

in a modern desktop browser.

Preferably make the entire game contained in **one single `index.html` file**, with HTML, CSS, and JavaScript included internally. Do not require npm, Node.js, a server, build tools, external libraries, external assets, or installation.

The final result should be genuinely playable, polished, and fun—not just a technical demo.

## Game concept

Create a small 2D side-view platformer/action sandbox where the player controls a powerful flying superhero.

The character should be able to:

- Walk left/right
- Jump
- Fly
- Toggle flying on/off
- Hover
- Move freely while flying
- Fire laser/heat-vision beams
- Kill enemies
- Take damage
- Consume flight energy
- Recover flight energy
- Explore a compact platforming map

## Controls

Use these controls:

- `A` = move left
- `D` = move right
- `W` = jump / move upward while flying
- `S` = move downward while flying
- `F` = toggle flight mode
- `Left Mouse Button` = fire laser toward mouse cursor
- `Space` = alternative laser/fire button
- `R` = restart after death
- `Esc` = pause/unpause if practical

Display the controls somewhere on screen.

## Player movement

Ground movement should feel responsive.

Implement:

- Acceleration
- Deceleration/friction
- Gravity
- Jumping
- Platform collision
- Horizontal collision
- Ground detection
- Facing left/right
- Sensible maximum running speed

Do not make movement feel overly slippery.

## Flight system

Pressing `F` toggles flight mode.

While flying:

- Gravity is heavily reduced or disabled
- `WASD` allows movement in all directions
- Character should accelerate smoothly
- Character should have a maximum flight speed
- Releasing movement keys should produce mild drag rather than instantly stopping
- Flight should feel significantly faster and more powerful than walking

### Flight energy

Add a clearly visible **Flight Energy bar**.

Flight continuously drains energy while active.

Example behavior:

- Maximum energy: 100
- Flight drains approximately 8–12 energy per second
- Energy regenerates while grounded/not flying
- When energy reaches zero, flight automatically disables
- The player falls normally
- Flight cannot reactivate until a small amount of energy has regenerated

Balance these values based on playtesting.

The HUD should make it obvious when flight energy is low.

## Laser / heat vision

The hero can fire a laser beam toward the mouse cursor.

Requirements:

- Aim using mouse world position
- Beam starts around the character's eye/head position
- Visible bright beam
- Short firing cooldown
- Enemies hit by the laser take damage
- Add a brief hit flash or particle effect
- Beam should disappear quickly rather than stay permanently
- Add a tiny amount of visual recoil/screenshake if it improves the feel

Laser should work both while walking and flying.

The laser should feel powerful.

## Enemies

Create several enemies around the map.

At minimum include:

### Ground enemy

- Walks/patrols on platforms
- Turns around at obstacles or platform edges
- Damages the player when touching them
- Has health
- Can be killed by lasers

### Flying enemy

- Floats/flys around part of the map
- Detects the player within a certain range
- Moves toward or attacks the player
- Can be killed by lasers

Enemies should:

- Have visible health indication when damaged
- Flash when hit
- Have a death animation/effect
- Award score

Do not make enemy AI overly complicated, but make it functional and enjoyable.

## Player health

Add a health system.

Example:

- 100 maximum HP
- Enemy contact removes health
- Player briefly becomes invulnerable after taking damage
- Character flashes during invulnerability
- Knockback when damaged
- Death when HP reaches zero

HUD should display health clearly.

When dead:

Show:

`YOU DIED`

and:

`Press R to Restart`

Restart the level completely.

## Map

Create a **small but interesting handcrafted map** rather than an infinite procedural level.

Suggested structure:

- Ground/street area
- Several raised buildings/platforms
- Rooftops
- Floating or elevated platforms
- Tall structure that encourages flying
- Lower dangerous section/pit
- Multiple enemy placements
- Enough horizontal and vertical space to make flying useful

The map should take roughly a few minutes to fully explore.

The player should be able to reach most places without flight, but flight should make traversal dramatically easier and should unlock some elevated areas.

## Camera

Implement a smooth camera that follows the player.

Requirements:

- Camera tracks horizontal movement
- Camera tracks vertical movement, especially while flying
- Smooth interpolation rather than snapping
- Keep player relatively close to center
- Camera must respect world/map boundaries where appropriate

The player should be able to fly considerably above ground while still seeing useful parts of the world.

## Art style

Do not use downloaded images.

Create visuals using:

- Canvas drawing
- Geometric shapes
- Gradients
- Procedural effects

Use an attractive comic-book/sci-fi superhero style.

Player design:

- Original superhero
- Human-shaped silhouette
- Cape or trailing cloth effect if practical
- Distinctive glowing eyes when firing
- Clearly different appearance between walking and flying
- Slight tilt while accelerating during flight

Environment:

- City skyline
- Buildings
- Windows
- Rooftops
- Platforms
- Background skyline/parallax layers
- Sky gradient

Use original visuals only.

## Animation

Even with simple shapes, make characters feel alive.

Player should have:

- Idle animation
- Running animation
- Jump pose
- Flying pose
- Laser firing effect
- Damage flash
- Death state

Enemies should have basic movement/death animations.

You can create procedural animation using changing limb positions, rotations, bobbing, squash/stretch, etc.

## Visual effects

Add polish such as:

- Laser glow
- Laser impact particles
- Enemy death particles
- Dust when landing
- Small trail while flying fast
- Eye glow
- Subtle screenshake when appropriate
- Damage flashes
- Energy bar animation
- Background parallax

Do not overdo screen shake.

## HUD

Display a clean HUD containing:

**Health**
`████████`

**Flight Energy**
`████████`

**Score**
`000000`

Also show flight state:

`FLIGHT: ON`

or:

`FLIGHT: OFF`

When flight energy gets low, make the energy indicator visually urgent.

## Gameplay balance

The player should feel strong, but enemies should still provide some danger.

Target feeling:

- Running = normal superhero movement
- Flying = powerful and fast
- Laser = powerful but not infinitely spammable
- Several enemies require 2–4 laser hits
- Player can survive multiple enemy contacts
- Falling into a deep pit should hurt or kill the player

## Performance

Target smooth gameplay at approximately 60 FPS.

Use:

`requestAnimationFrame`

Use delta time properly so gameplay isn't dependent on monitor refresh rate.

Avoid excessive object creation every frame.

Clean up particles/projectiles/effects that are no longer needed.

## Canvas

Use an HTML5 `<canvas>`.

Canvas should:

- Automatically resize with the browser window
- Maintain gameplay correctly across common desktop resolutions
- Handle device pixel ratio reasonably
- Prevent the page from scrolling during gameplay

## Mouse aiming

Because the camera moves, correctly convert:

screen mouse coordinates

into:

world coordinates

before aiming the laser.

This is important.

Laser direction should accurately follow the cursor even while the camera is moving.

## Collision system

Implement reliable AABB or equivalent collisions for:

- Player vs platforms
- Enemy vs platforms
- Player vs enemies
- Laser vs enemies
- Player vs dangerous areas

Make sure the player does not frequently fall through platforms at high speeds.

If necessary, use substeps or robust axis-separated collision resolution.

## Code architecture

Even though everything can be inside one HTML file, organize JavaScript cleanly.

Use classes or clear modules such as:

- `Game`
- `Player`
- `Enemy`
- `FlyingEnemy`
- `Platform`
- `Particle`
- `Camera`
- `Input`

Keep constants/configuration near the top.

Avoid an enormous unstructured block of spaghetti code.

Comment important systems.

## Important requirement: actually finish the implementation

Do not give me:

- pseudocode
- partial examples
- TODO comments
- placeholders
- "you can implement this later"
- incomplete snippets

I want the **entire working game**.

Before giving me the result, mentally inspect the code for:

- JavaScript syntax errors
- Undefined variables
- Incorrect event listeners
- Camera coordinate mistakes
- Broken collision detection
- Mouse/world coordinate bugs
- Restart bugs
- Delta-time issues
- Flight toggle bugs
- Energy regeneration bugs
- Lasers not detecting enemies
- Enemies falling through platforms

Fix any obvious issues before returning the code.

## Desired game loop

The experience should roughly be:

1. Player spawns on a city rooftop/street.
2. Player learns walking/jumping.
3. Ground enemies appear nearby.
4. Player uses laser vision to defeat them.
5. Player presses `F`.
6. Hero begins flying.
7. Flight energy drains.
8. Player flies across rooftops and upward sections.
9. Flying enemies attack.
10. Player fights them in the air.
11. Player explores the whole mini-map and tries to achieve a high score.

## Add a simple objective

Include a small objective such as:

`Defeat all hostiles`

Show:

`Enemies Remaining: X`

When every enemy is dead, display a victory message:

`CITY SECURED`

and optionally:

`Press R to play again`

## Nice-to-have additions

If they can be implemented without destabilizing the core game, add:

- Cape physics/trailing cape
- Breakable crates
- Explosive barrel
- Destructible environmental objects
- Collectible energy pickups
- Health pickups
- Enemy projectiles
- Mini boss
- Combo multiplier
- Speed lines during fast flight
- Better procedural city skyline
- Persistent high score using `localStorage`
- Fullscreen button
- Sound effects generated using Web Audio API

These are secondary. **Prioritize a solid playable game first.**

## Audio

Do not require external sound files.

If adding sound, generate simple sound effects procedurally using the Web Audio API for:

- Laser
- Enemy hit
- Enemy death
- Jump
- Flight activation
- Player damage
- Victory

Include a mute button.

## Final output format

Return:

1. A very short explanation of what was created.
2. The complete contents of `index.html` in **one code block**.
3. Brief instructions:

`Save this as index.html and double-click it to play.`

Do not split the game across multiple files unless absolutely necessary.

Most importantly: **spend your effort actually building, testing mentally, and polishing the game rather than explaining how to build it.**
```
