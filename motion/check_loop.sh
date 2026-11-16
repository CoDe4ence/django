#!/bin/bash
# Lists every property whose value differs between the loop's start and end in a comp.
#   motion/check_loop.sh "Web Design Wide" [start=4] [end=12]
# A seamless loop shows only differences you meant: spins by a whole period of their symmetry,
# trim offsets by 360, or properties of layers that are invisible at both ends.
cd "$(dirname "$0")/.."
EC="${EFFECTCRAFT_CLI:-$HOME/Projects/craft/effectcraft/target/release/effectcraft-cli}"
COMP=$1; T0=${2:-4}; T1=${3:-12}; PROJ=${PROJ:-motion/Khume-Site.ecproj}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
"$EC" exec comp.info --params "{\"comp\":\"$COMP\"}" --project "$PROJ" --json |
  python3 -c "import json,sys;d=json.load(sys.stdin);d=d.get('result',d);print('\n'.join(str(l['id']) for l in d['layers']))" > "$TMP/ids"
n=0
while read -r id; do
  "$EC" props "$COMP" "$id" --flat --time "$T0" --project "$PROJ" 2>/dev/null > "$TMP/a"
  "$EC" props "$COMP" "$id" --flat --time "$T1" --project "$PROJ" 2>/dev/null > "$TMP/b"
  if ! diff <(tail -n +2 "$TMP/a") <(tail -n +2 "$TMP/b") > "$TMP/d" 2>/dev/null; then
    echo "== $(head -1 "$TMP/a" | sed 's/ at .*//')"
    grep '^[<>]' "$TMP/d" | sed 's/  */ /g'
    n=$((n + 1))
  fi
done < "$TMP/ids"
echo "$n layer(s) differ between ${T0}s and ${T1}s"
