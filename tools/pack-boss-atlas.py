"""Pack generated boss poses into padded, equal runtime cells.

This is atlas registration only: preserve every source RGBA pixel, no repainting.
Usage: python tools/pack-boss-atlas.py path/to/generated.png [heliarch|devourer|warden]
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(sys.argv[1]).convert("RGBA")
devourer = len(sys.argv) > 2 and sys.argv[2] == "devourer"
warden = len(sys.argv) > 2 and sys.argv[2] == "warden"
columns, size, offset = (2, 704, 38) if warden else (3, 640, 32) if devourer else (4, 512, 34)
# Devourer art does not follow a uniform source grid. The separator is above
# the raised hands, and the dash snout starts left of the nominal third column.
rects = [(0, 0, 490, 490), (490, 0, 980, 490), (980, 0, 1536, 490),
         (0, 490, 490, 1024), (490, 490, 1000, 1024), (1000, 490, 1536, 1024)]
atlas = Image.new("RGBA", (columns * size, size * 2))
for frame in range(columns * 2):
    col, row = frame % columns, frame // columns
    box = rects[frame] if devourer else (
        round(col * source.width / columns), round(row * source.height / 2),
        round((col + 1) * source.width / columns), round((row + 1) * source.height / 2))
    cell = source.crop(box)
    if cell.width + offset * 2 > size or cell.height + offset * 2 > size:
        raise ValueError("Source cells exceed the packing budget")
    # Preserve source pixels and add transparent gutters around each runtime cell.
    atlas.paste(cell, (col * size + offset, row * size + offset))
output = ROOT / "assets/sprites" / (
    "prism-warden-move-v2.png" if warden else
    "stage2-astral-devourer-frames-v3.png" if devourer else "stage3-heliarch-zero-frames-v3.png")
atlas.save(output, optimize=True)
print(output)
