"""Optional lossless PNG maintenance; requires Pillow, never needed to play.

Re-filter/recompress runtime PNGs while retaining their original headers, metadata,
dimensions and exact RGBA pixels. Only replace a file when the result is smaller.
"""
import io
import json
import re
import struct
import zlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def chunks(data):
    offset = 8
    while offset < len(data):
        length = int.from_bytes(data[offset:offset + 4], "big")
        kind = data[offset + 4:offset + 8]
        yield kind, data[offset + 8:offset + 8 + length], data[offset:offset + 12 + length]
        offset += length + 12


def optimize(file):
    original = file.read_bytes()
    with Image.open(io.BytesIO(original)) as image:
        image.load()
        rgba = image.convert("RGBA").tobytes()
        encoded = io.BytesIO()
        image.save(encoded, format="PNG", optimize=True, compress_level=9)
    candidate = encoded.getvalue()
    old_header = next(payload for kind, payload, _ in chunks(original) if kind == b"IHDR")
    new_header = next(payload for kind, payload, _ in chunks(candidate) if kind == b"IHDR")
    if old_header != new_header:
        return {"file": str(file.relative_to(ROOT)), "before": len(original), "after": len(original)}
    packed = b"".join(payload for kind, payload, _ in chunks(candidate) if kind == b"IDAT")
    block = struct.pack(">I", len(packed)) + b"IDAT" + packed + struct.pack(">I", zlib.crc32(b"IDAT" + packed))
    output = [original[:8]]
    inserted = False
    for kind, _, raw in chunks(original):
        if kind == b"IDAT":
            if not inserted:
                output.append(block)
                inserted = True
        else:
            output.append(raw)
    optimized = b"".join(output)
    if len(optimized) < len(original):
        with Image.open(io.BytesIO(optimized)) as check:
            assert check.convert("RGBA").tobytes() == rgba, f"pixel change: {file}"
        file.write_bytes(optimized)
    else:
        optimized = original
    return {"file": str(file.relative_to(ROOT)), "before": len(original), "after": len(optimized)}


if __name__ == "__main__":
    refs = sorted(set(re.findall(r"loadSprite\('([^']+\.png)'", (ROOT / "index.html").read_text(encoding="utf-8"))))
    report = [optimize(ROOT / ref) for ref in refs]
    before = sum(item["before"] for item in report)
    after = sum(item["after"] for item in report)
    print(json.dumps({"files": len(report), "beforeBytes": before, "afterBytes": after, "savedPercent": round((before-after)*100/before, 2)}))
    output = ROOT / "artifacts" / "v0.10"
    output.mkdir(parents=True, exist_ok=True)
    (output / "asset-optimization.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
