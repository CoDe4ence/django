#!/bin/sh
# Build the full-screen service scenes and export static/animations/services/<slug>-{wide,tall}.json.
#   motion/build_services.sh web-design            one service (headless, into motion/Khume-Site.ecproj)
#   BRIDGE=9877 motion/build_services.sh web-design    live, in a running `effectcraft --control 9877`
# Each service is motion/khume_service_<slug with _>.jsx building "<Title> Wide" and "<Title> Tall".
set -e
cd "$(dirname "$0")/.."
title() {
  case "$1" in
    web-design) echo "Web Design" ;;
    *) echo "unknown service: $1" >&2; exit 1 ;;
  esac
}
for slug in "$@"; do
  t=$(title "$slug")
  motion/build_motion.sh "motion/khume_service_$(echo "$slug" | tr - _).jsx" motion/Khume-Site.ecproj static/animations/services \
    "$t Wide=$slug-wide" "$t Tall=$slug-tall"
done
