# Airborne laser animation

Generated with the built-in image-generation tool. Final file: `astra-flight-shoot-frames-v1.png`, 1536×1024 RGBA, four 768×512 cells in a 2×2 cape loop.

The final sheet has verified transparent pixels; two earlier reference-based attempts produced opaque checkerboards and were not added to the project. No original sprite was replaced.

The runtime pins the four frames to their measured palm centers (735,240), (735,240), (735,228), (735,228), in authored cell coordinates. The sprite and laser share the same aim transform. Ground shooting remains unchanged; missing art uses the existing pose.

## Final generation prompt

Create a game-ready transparent-background RGBA PNG sprite sheet, exactly four equal square frames in a 2-by-2 layout. The empty background MUST have actual zero alpha, NOT a drawn checkerboard or solid color. No grid or labels. Four consecutive animation frames of the SAME original sci-fi superhero, all flying rightwards horizontally while aiming an outstretched right palm directly right. Young adult man with black swept hair, metallic royal-blue armored bodysuit, cyan glowing chest crystal, silver pauldrons, narrow gold trim and boots, flowing magenta-purple cosmic cape. Detailed crisp painted 2D arcade-game art. Legs straight together trailing left, head right, one palm forward right and other arm back. Full figure in every cell with clear margins. Identical locked body/head/hand position in all frames; ONLY cape cloth undulates as a gentle looping wave. Palm around 87% across each cell, chest around 60%, same height in every frame. No laser, no energy ball, no floor, no cast shadow. This is production character art to composite over a game scene, so true alpha transparency is essential.
