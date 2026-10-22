#!/usr/bin/env bash
# Is this deploy still the newest? Writes current=true|false to $GITHUB_OUTPUT. It's false when this workflow
# already has a run on this branch (queued, running or successful) for a newer commit, one that contains this
# commit: GitHub delays push events during incidents, so a run can start after a newer one, and deploying then
# would put old code over new. A later commit this workflow ignores (paths filters) starts no run, so this run
# still deploys. Needs GH_TOKEN, and permissions actions: read and contents: read.
set -euo pipefail
wf=${GITHUB_WORKFLOW_REF%@*}; wf=${wf##*/}
current=true
for sha in $(gh api "repos/$GITHUB_REPOSITORY/actions/workflows/$wf/runs?branch=$GITHUB_REF_NAME&per_page=30" \
    --jq '.workflow_runs[] | select(.conclusion == null or .conclusion == "success") | .head_sha' | sort -u); do
  [ "$sha" = "$GITHUB_SHA" ] && continue
  if [ "$(gh api "repos/$GITHUB_REPOSITORY/compare/$GITHUB_SHA...$sha" --jq .status)" = ahead ]; then
    echo "::notice::Skipped: $wf already ran for ${sha::12}, newer than ${GITHUB_SHA::12} on $GITHUB_REF_NAME"
    current=false
    break
  fi
done
echo "current=$current" >> "$GITHUB_OUTPUT"
