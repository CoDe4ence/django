#!/bin/sh
# Rebuild the Khume motion project and export the web Lottie files (hero logo + service infographics) (and, with --video, the MP4).
# EFFECTCRAFT_CLI defaults to a source build in ~/Projects/craft/effectcraft.
set -e
cd "$(dirname "$0")/.."
EC="${EFFECTCRAFT_CLI:-$HOME/Projects/craft/effectcraft/target/release/effectcraft-cli}"
PROJ=motion/Khume-Logo-Shapes.ecproj
OUT=static/animations

"$EC" script motion/khume_logo_shapes.jsx --empty --save-as "$PROJ"
"$EC" script motion/khume_service_infographics.jsx --project "$PROJ" --save

export_lottie() { # comp, output path
  "$EC" exec file.exportLottie --params "{\"comp\":\"$1\",\"path\":\"$2\",\"textAsShapes\":true}" --project "$PROJ" --json
  echo
}

mkdir -p "$OUT/services"
export_lottie "Khume Logo Web Square" "$OUT/khume-logo-square.json"
export_lottie "Info Web Design" "$OUT/services/web-design.json"
export_lottie "Info Motion Graphics" "$OUT/services/motion-graphics.json"
export_lottie "Info E-commerce" "$OUT/services/e-commerce.json"
export_lottie "Info Web Applications" "$OUT/services/web-applications.json"
export_lottie "Info Brand Revamps" "$OUT/services/brand-revamps.json"
export_lottie "Info Membership & Portals" "$OUT/services/membership-portals.json"

if [ "$1" = "--video" ]; then
  "$EC" render --comp "Khume Logo Shapes" --project "$PROJ" --out motion/khume-logo-shapes.mp4 --format h264
fi
