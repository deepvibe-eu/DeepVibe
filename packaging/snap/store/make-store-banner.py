#!/usr/bin/env python3
"""Generate the Snap Store "featured banner" for DeepVibe (3:1 aspect).

Snap Store banner rules: JPEG/PNG, 3:1, min 720x240, max 4320x1440, <=2 MB.

Layout (designed in a 1920x640 viewBox, scaled to WIDTHxHEIGHT):
dark app-toned gradient; left = logo + wordmark + tagline with the website
amber accent; right = the app screenshot as a soft-shadowed window bleeding
off the right/bottom edge.

Usage:
    make-store-banner.py [WIDTH] [HEIGHT] [OUT.png]
Defaults: 1920 640  store-banner.png   (any 3:1 size works)
"""
import base64
import subprocess
import sys
from pathlib import Path

W = int(sys.argv[1]) if len(sys.argv) > 1 else 1920
H = int(sys.argv[2]) if len(sys.argv) > 2 else 640
OUT = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("store-banner.png")

ROOT = Path(__file__).resolve().parents[3]  # ZCode/
ICON = ROOT / "packages/desktop/build/icons/512x512.png"
SHOT = ROOT / "packages/desktop/build/README-images/DeepVibe_de.png"


def data_uri(p: Path) -> str:
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()


icon_uri = data_uri(ICON)
shot_uri = data_uri(SHOT)

AMBER = "#967244"
TEXT = "#f4f4f2"
MUTED = "#b6b5b2"

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="{W}" height="{H}" viewBox="0 0 1920 640">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1d1e"/>
      <stop offset="0.55" stop-color="#141516"/>
      <stop offset="1" stop-color="#0b0c0d"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.45" r="0.6">
      <stop offset="0" stop-color="{AMBER}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="{AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{AMBER}"/>
      <stop offset="1" stop-color="{AMBER}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="shotClip"><rect x="1010" y="70" width="1010" height="620" rx="16"/></clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <filter id="iconShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="1920" height="640" fill="url(#bg)"/>
  <rect width="1920" height="640" fill="url(#glow)"/>

  <!-- Left: brand -->
  <image x="120" y="150" width="104" height="104" xlink:href="{icon_uri}" filter="url(#iconShadow)"/>
  <text x="250" y="232" font-family="Fira Sans" font-size="88" font-weight="600"
        fill="{TEXT}" letter-spacing="-1">DeepVibe</text>

  <rect x="122" y="318" width="120" height="4" rx="2" fill="url(#bar)"/>

  <text x="122" y="392" font-family="Fira Sans" font-size="31" fill="{MUTED}">
    One model. One workspace. A partner, not an agent.</text>

  <text x="122" y="470" font-family="Fira Sans" font-size="21" font-weight="600"
        fill="{AMBER}" letter-spacing="3">THE DEEPSEEK CODING PARTNER IDE</text>
  <text x="122" y="512" font-family="Fira Sans" font-size="21" fill="{MUTED}">
    Open source · Linux · macOS · Windows</text>

  <!-- Right: floating screenshot -->
  <g filter="url(#shadow)">
    <rect x="1010" y="70" width="1010" height="620" rx="16" fill="#101112"
          stroke="#ffffff" stroke-opacity="0.10"/>
    <image x="1010" y="70" width="1010" height="620" preserveAspectRatio="xMidYMid slice"
           clip-path="url(#shotClip)" xlink:href="{shot_uri}"/>
  </g>
</svg>
"""

svg_path = OUT.with_suffix(".svg")
svg_path.write_text(svg)

res = subprocess.run(["rsvg-convert", str(svg_path), "-o", str(OUT)])
if res.returncode != 0:
    raise SystemExit(f"rsvg-convert failed ({res.returncode})")
print(f"wrote {OUT} ({W}x{H}) and {svg_path}")
