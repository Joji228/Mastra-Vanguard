# Prism Guard sprite sheet

Generated with the built-in image-generation tool. Original generated alpha is preserved; no external runtime dependencies. Layout: 1536×1024, six 512×512 cells, row-major.

Frames: forming arcs, forming ring, stable shield, flowing shield, perfect block, dissolve. The shared Player renderer blends frames in all three stages and retains a procedural fallback. Critical stage loading includes this sheet.

## Generation prompt

Use case: stylized-concept. Asset type: production game VFX sprite sheet for Mastra Vanguard's Prism Guard. Generate a genuinely transparent RGBA PNG, 1536x1024, exactly 3 columns by 2 rows of 512x512 cells. Six centered aligned frames of ONE hollow circular cyan crystalline energy shield, no character: frame 0 forming thin arcs, frame 1 almost formed faceted ring, frame 2 complete stable cyan shield, frame 3 same shield subtle energy flowing along rim, frame 4 golden perfect-block impact rim with a few restrained outward sparks, frame 5 cyan rim dissolving into a few shards. Each centered at exact cell center with same outer diameter about 380 pixels, leaving transparent margins. Interior of every ring must be fully transparent and empty so the hero remains visible. Style: polished hand-painted 2D sci-fi pixel-inspired game effects, crisp prismatic facets, cyan turquoise white highlights and subtle violet accents; only perfect block gold. No dark disk, no background, no checkerboard drawn into image, no labels, no text, no borders, no bloom outside cell margins. The alpha transparency must be real. Keep effects restrained, clean and readable at 130 pixels in game.
