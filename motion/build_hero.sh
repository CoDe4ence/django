#!/bin/sh
# Build the full-screen hero (motion/khume_hero.jsx) and export static/animations/hero/*.json.
#   motion/build_hero.sh               headless, into motion/Khume-Site.ecproj
#   BRIDGE=9877 motion/build_hero.sh   live, in a running `effectcraft --control 9877`
exec "$(dirname "$0")/build_motion.sh" motion/khume_hero.jsx motion/Khume-Site.ecproj static/animations/hero \
  "Khume Hero Wide=khume-hero-wide" "Khume Hero Tall=khume-hero-tall"
