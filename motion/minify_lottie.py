#!/usr/bin/env python3
"""Shrinks exported Lottie files in place: numbers rounded to 3 decimals, no whitespace.

EffectCraft writes coordinates with ~16 significant digits; at screen scale 3 decimals are plenty
and the files get 20-30% smaller (gzipped). Run by build_motion.sh after every export.
    python3 motion/minify_lottie.py static/animations/services/web-design-wide.json ...
"""
import json
import sys


def rounded(o):
    if isinstance(o, float):
        v = round(o, 3)
        return int(v) if v == int(v) else v
    if isinstance(o, list):
        return [rounded(x) for x in o]
    if isinstance(o, dict):
        return {k: rounded(v) for k, v in o.items()}
    return o


for path in sys.argv[1:]:
    with open(path) as f:
        data = json.load(f)
    with open(path, "w") as f:
        json.dump(rounded(data), f, separators=(",", ":"))
