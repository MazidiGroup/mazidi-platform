#!/usr/bin/env bash
#
# Release guard for the privacy centre pages.
#
# The published privacy pages must never carry an unresolved pre-publication
# marker, a draft version label, or a claim about integrations the app does not
# have. This script fails (exit 1) while any of them is still present, so a
# release cannot ship them.
#
# Run manually or from CI:  pnpm check:privacy
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# The pages moved out of the (group) route group when the privacy centre was
# scoped to the MazidiPerformance subdomain; they now live under the internal
# /app-privacy segment and are served at /privacy* by apps/web/middleware.ts.
TARGET="$ROOT/apps/web/app/app-privacy/privacy"

if [ ! -d "$TARGET" ]; then
  echo "check-privacy-placeholders: target directory not found: $TARGET" >&2
  exit 1
fi

PATTERNS=(
  "EFFECTIVE DATE — SET ON PUBLICATION"
  "[APPROVAL DATE]"
  "TO BE CONFIRMED"
  "0.9"
  "Apple Health"
  "HealthKit"
)

found=0

for pattern in "${PATTERNS[@]}"; do
  matches="$(grep -rnF -- "$pattern" "$TARGET" 2>/dev/null)"
  if [ -n "$matches" ]; then
    found=1
    echo "FAIL: forbidden text \"$pattern\" found in the privacy pages:"
    echo "$matches"
    echo
  fi
done

if [ "$found" -ne 0 ]; then
  echo "-------------------------------------------------------------------------"
  echo "The privacy centre is NOT releasable while the text above is present."
  echo
  echo "  [EFFECTIVE DATE — SET ON PUBLICATION] must be replaced with the real"
  echo "  production publication date, formatted like: 29 July 2026"
  echo
  echo "  Draft labels (0.9), unresolved [APPROVAL DATE] / TO BE CONFIRMED markers"
  echo "  and Apple Health / HealthKit wording must not appear on the public pages."
  echo "-------------------------------------------------------------------------"
  exit 1
fi

echo "check-privacy-placeholders: OK — no pre-publication markers in $TARGET"
