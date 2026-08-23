from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPECS = {
    "prism-warden-idle-v1.png": (2, 2),
    "prism-warden-move-v1.png": (2, 2),
    "prism-warden-ranged-v1.png": (3, 2),
    "prism-warden-slam-v1.png": (3, 2),
    "prism-warden-hit-death-v1.png": (3, 3),
}


def is_background(pixel):
    red, green, blue, alpha = pixel
    # Generated sheets can carry a nearly invisible black matte (usually alpha 90)
    # across the full cell. It becomes a bright rectangle once Canvas applies the
    # boss shadow, so treat only edge-connected, low-alpha near-black pixels as matte.
    dark_translucent_matte = alpha <= 110 and max(red, green, blue) <= 18
    return alpha < 8 or dark_translucent_matte or (min(red, green, blue) > 205 and max(red, green, blue) - min(red, green, blue) < 24)


def remove_edge_background(image):
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue = deque()
    visited = bytearray(width * height)

    def seed(x, y):
        index = y * width + x
        if not visited[index] and is_background(pixels[x, y]):
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        red, green, blue, original_alpha = pixels[x, y]
        if original_alpha < 96:
            pixels[x, y] = (red, green, blue, 0)
            feather = 0
        else:
            neutral = max(red, green, blue) - min(red, green, blue)
            brightness = min(red, green, blue)
            feather = 0 if brightness >= 238 and neutral < 16 else max(0, min(90, (238 - brightness) * 3))
            pixels[x, y] = (red, green, blue, feather)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not visited[index] and is_background(pixels[nx, ny]):
                    visited[index] = 1
                    queue.append((nx, ny))
    return rgba


def validate_grid(image, columns, rows, name):
    width, height = image.size
    if width % columns or height % rows:
        raise ValueError(f"{name}: {width}x{height} is not divisible by {columns}x{rows}")
    alpha = image.getchannel("A")
    if alpha.getextrema()[0] != 0:
        raise ValueError(f"{name}: transparency cleanup failed")


def main():
    sprite_dir = ROOT / "assets" / "sprites"
    for name, (columns, rows) in SPECS.items():
        path = sprite_dir / name
        image = remove_edge_background(Image.open(path))
        validate_grid(image, columns, rows, name)
        image.save(path, optimize=True)
        cell_width = image.width // columns
        cell_height = image.height // rows
        print(f"{name}: {columns}x{rows} cells at {cell_width}x{cell_height}, RGBA normalized")


if __name__ == "__main__":
    main()
