#!/usr/bin/env bash
# Stamps the checkout with a deploy version before deploy.yml syncs it to S3:
# - local .js/.css references in the top-level *.html pages get ?v=<version>, so their
#   files can be cached for a year (immutable) and a deploy still changes their URLs
# - var ootvversion in index.html, which oracle.js appends to runtime loads (templates,
#   pica) and compares with version.json to offer a reload when a newer deploy is live
# - version.json
# Unstamped (local testing), ootvversion stays 'dev' and the reload check is off.
set -euo pipefail
v="$1"
sed -i -E \
  -e "s#((src|href)=\")([^\"/:][^\":?]*\.(js|css))\"#\1\3?v=$v\"#gI" \
  -e "s#var ootvversion = 'dev';#var ootvversion = '$v';#" \
  *.html
grep -q "var ootvversion = '$v';" index.html || { echo "ootvversion not stamped in index.html" >&2; exit 1; }
printf '{"version":"%s"}\n' "$v" > version.json
