#!/usr/bin/env python3
"""Render the Teams app icons for config/teams from the OPDA brand mark.

Teams needs a 192x192 colour icon and a 32x32 transparent outline icon (white
silhouette). Both are drawn from the two polygons of public/ui/brand/opda-icon-yellow.svg
so the committed PNGs are reproducible: `python3 scripts/teams-app-icons.py`.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "config" / "teams"
YELLOW, INK, WHITE = (254, 201, 43, 255), (28, 43, 69, 255), (255, 255, 255, 255)
# viewBox 0 0 84 100; the mark's two shapes as straight-line polygons.
SQUARE = [(83.6387, 83.2273), (67.8689, 83.2273), (67.8689, 99.9746), (83.6387, 99.9746)]
HOUSE = [
    (78.4161, 76.7371), (78.4161, 36.1924), (78.3397, 36.1924), (50.4177, 10.2316), (39.4119, 0.0),
    (28.4061, 10.2316), (0.0, 36.6251), (0.0, 94.4006), (60.7356, 94.4006), (60.7356, 79.435),
    (15.0056, 79.435), (15.0056, 43.1408), (39.4119, 20.4632), (63.4106, 42.7844), (63.4106, 76.7371),
]


def render(size, background, fill, pad):
    scale = 8  # supersample, then downsample for smooth edges
    canvas = Image.new("RGBA", (size * scale, size * scale), background)
    draw = ImageDraw.Draw(canvas)
    box = size * scale * (1 - 2 * pad)
    unit = box / 100
    ox = (size * scale - 84 * unit) / 2
    oy = size * scale * pad
    for polygon in (HOUSE, SQUARE):
        draw.polygon([(ox + x * unit, oy + y * unit) for x, y in polygon], fill=fill)
    return canvas.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    render(192, INK, YELLOW, 0.18).save(OUT / "color.png", optimize=True)
    render(32, (0, 0, 0, 0), WHITE, 0.04).save(OUT / "outline.png", optimize=True)
    print("wrote", OUT / "color.png", OUT / "outline.png")
