#!/bin/sh
# Build one of the full-screen motion scripts and export its comps to Lottie.
#   motion/build_motion.sh SCRIPT.jsx PROJECT.ecproj OUT_DIR "Comp Name=file-slug" ...
#   BRIDGE=9877 motion/build_motion.sh ...   builds in a running `effectcraft --control 9877` instead
#                                            (and saves the app's open project)
# Headless, the script runs on PROJECT (created if missing). The script API can't set gradient
# stops, so scripts print them ("GRAD|comp|layer|group|stops") and they are applied here.
# EFFECTCRAFT_CLI defaults to a source build in ~/Projects/craft/effectcraft.
set -e
cd "$(dirname "$0")/.."
EC="${EFFECTCRAFT_CLI:-$HOME/Projects/craft/effectcraft/target/release/effectcraft-cli}"
SCRIPT=$1; PROJ=$2; OUT=$3; shift 3
LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

if [ -n "$BRIDGE" ]; then
  TARGET="--bridge $BRIDGE"; SAVE=""
  "$EC" script "$PWD/$SCRIPT" $TARGET > "$LOG"
else
  TARGET="--project $PROJ"; SAVE="--save"
  if [ -f "$PROJ" ]; then "$EC" script "$PWD/$SCRIPT" $TARGET --save > "$LOG"
  else "$EC" script "$PWD/$SCRIPT" --empty --save-as "$PROJ" > "$LOG"; fi
fi
grep -v '^GRAD|' "$LOG" || true

grep '^GRAD|' "$LOG" | while IFS='|' read -r _ comp layer _ stops; do
  "$EC" set "$comp" "$layer" contents/group/contents/gfill/colors "$stops" $TARGET $SAVE > /dev/null
done
echo "gradients: $(grep -c '^GRAD|' "$LOG")"

mkdir -p "$OUT"
for pair in "$@"; do
  comp=${pair%%=*}; slug=${pair#*=}
  "$EC" exec file.exportLottie --params "{\"comp\":\"$comp\",\"path\":\"$PWD/$OUT/$slug.json\",\"textAsShapes\":true}" $TARGET --json
  echo
done

if [ -n "$BRIDGE" ]; then "$EC" exec file.save $TARGET --json; echo; fi
