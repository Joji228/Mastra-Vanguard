"""Pack generated attack effects without repainting their RGBA pixels.

Usage: python tools/pack-attack-vfx.py blasts|zones|core generated.png
Source rectangles and anchors are measured for the saved generation prompts.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
kind, filename = sys.argv[1:3]
source = Image.open(filename).convert("RGBA")
if kind == "blasts":
    columns, rows, size, offset = 3, 2, 640, 50
    cuts = [0, 518, 1028, 1536]
    rects = [(cuts[c], top, cuts[c + 1], bottom)
             for top, bottom in [(0, 490), (490, 1024)] for c in range(3)]
    name = "boss-slam-energy-frames-v1.png"
elif kind == "zones":
    columns, rows, size, offset = 2, 2, 704, 38
    rects = [(c * 627, r * 627, (c + 1) * 627, (r + 1) * 627)
             for r in range(2) for c in range(2)]
    name = "heliarch-foundry-zone-frames-v1.png"
elif kind == "core":
    columns, rows, size, offset = 2, 2, 768, 32
    # The beam extends beyond the nominal source column. Preserve it whole.
    rects = [(160, 210, 515, 570), (680, 140, 1180, 615),
             (65, 810, 750, 1080), (785, 710, 1215, 1160)]
    name = "heliarch-core-energy-frames-v1.png"
else:
    raise ValueError("Unknown effect type")
atlas = Image.new("RGBA", (columns * size, rows * size))
for frame, box in enumerate(rects):
    cell = source.crop(box)
    if max(cell.size) + offset * 2 > size:
        raise ValueError("Frame exceeds its packing budget")
    atlas.paste(cell, (frame % columns * size + offset, frame // columns * size + offset))
output = ROOT / "assets" / "sprites" / name
atlas.save(output, optimize=True)
print(output)
