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
round() {
  python3 -c "
import re, sys
for line in sys.stdin:
    sys.stdout.write(re.sub(r'-?\d+\.\d+(e-?\d+)?', lambda m: ('%.3f' % float(m.group())).replace('-0.000', '0.000'), line))"
}
while read -r id; do
  "$EC" props "$COMP" "$id" --flat --time "$T0" --project "$PROJ" 2>/dev/null > "$TMP/a"
  "$EC" props "$COMP" "$id" --flat --time "$T1" --project "$PROJ" 2>/dev/null > "$TMP/b"
  # numbers rounded to 3 decimals, so float noise (99.99999999999999 vs 100) doesn't count
  if ! diff <(tail -n +2 "$TMP/a" | round) <(tail -n +2 "$TMP/b" | round) > "$TMP/d" 2>/dev/null; then
    echo "== $(head -1 "$TMP/a" | sed 's/ at .*//')"
    grep '^[<>]' "$TMP/d" | sed 's/  */ /g'
    n=$((n + 1))
  fi
done < "$TMP/ids"
echo "$n layer(s) differ between ${T0}s and ${T1}s"
