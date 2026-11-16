#!/bin/sh
# Build the full-bleed hero (motion/khume_hero.jsx) and export its Lottie files.
#   motion/build_hero.sh              headless: rebuilds motion/Khume-Hero.ecproj
#   BRIDGE=9877 motion/build_hero.sh  live: builds in a running `effectcraft --control 9877`
#                                     (the comps appear in the app; save from there if you like)
# The script API can't set gradient stops, so the script prints them ("GRAD|comp|layer|group|stops")
# and they are applied here through the engine.
# EFFECTCRAFT_CLI defaults to a source build in ~/Projects/craft/effectcraft.
set -e
cd "$(dirname "$0")/.."
EC="${EFFECTCRAFT_CLI:-$HOME/Projects/craft/effectcraft/target/release/effectcraft-cli}"
PROJ=motion/Khume-Hero.ecproj
OUT=static/animations/hero
LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

if [ -n "$BRIDGE" ]; then
  TARGET="--bridge $BRIDGE"
  "$EC" script "$PWD/motion/khume_hero.jsx" $TARGET > "$LOG"
else
  TARGET="--project $PROJ"
  "$EC" script "$PWD/motion/khume_hero.jsx" --empty --save-as "$PROJ" > "$LOG"
fi
grep -v '^GRAD|' "$LOG" || true

grep '^GRAD|' "$LOG" | while IFS='|' read -r _ comp layer _ stops; do
  "$EC" set "$comp" "$layer" contents/group/contents/gfill/colors "$stops" $TARGET $( [ -z "$BRIDGE" ] && echo --save ) > /dev/null
  echo "gradient: $comp / $layer"
done

mkdir -p "$OUT"
for c in Wide Tall; do
  slug=$(echo "$c" | tr 'A-Z' 'a-z')
  "$EC" exec file.exportLottie --params "{\"comp\":\"Khume Hero $c\",\"path\":\"$PWD/$OUT/khume-hero-$slug.json\",\"textAsShapes\":true}" $TARGET --json
  echo
done

# live: save the app's project too, so the .ecproj matches what was exported
if [ -n "$BRIDGE" ]; then "$EC" exec file.save $TARGET --json; echo; fi
