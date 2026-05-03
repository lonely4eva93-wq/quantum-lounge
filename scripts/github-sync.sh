#!/bin/bash
# Pushes the current HEAD to the main branch on GitHub.
# Called by both scripts/post-merge.sh (after every task merge) and
# .git/hooks/post-commit (after direct git commits), so GitHub always reflects
# the current Replit state.
#
# Replit is the single source of truth for this repository. We fetch the
# remote tracking ref first so --force-with-lease has a meaningful baseline;
# this lets us overwrite diverged GitHub commits while still guarding against
# a race where two pushers conflict.

set -e

REMOTE_URL="https://github.com/lonely4eva93-wq/quantum-lounge.git"
REMOTE_NAME="github"

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "WARNING: GITHUB_PERSONAL_ACCESS_TOKEN is not set — GitHub sync skipped." >&2
  echo "Set this secret in Replit to enable automatic GitHub sync." >&2
  exit 0
fi

# Ensure the remote is configured without embedding credentials in the URL
if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
else
  # Keep the remote URL clean (no embedded token) in case it was set manually
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
fi

# Write a short-lived credential helper so the PAT is never placed in argv
# or the remote URL (avoids exposure via `ps`, shell history, or git log).
CRED_HELPER=$(mktemp /tmp/git-cred-helper.XXXXXX)
chmod 700 "$CRED_HELPER"
cat > "$CRED_HELPER" <<'HELPER_EOF'
#!/bin/sh
case "$1" in
  get)
    echo "username=token"
    printf "password=%s\n" "$GITHUB_PERSONAL_ACCESS_TOKEN"
    ;;
esac
HELPER_EOF

cleanup() { rm -f "$CRED_HELPER"; }
trap cleanup EXIT

GIT_SYNC="git -c credential.helper=${CRED_HELPER}"

# Fetch to update the remote-tracking ref before --force-with-lease checks it
GIT_TERMINAL_PROMPT=0 $GIT_SYNC fetch "$REMOTE_NAME" main

# Push: --force-with-lease rejects if the remote moved since our fetch,
# protecting against accidental overwrites in concurrent-push scenarios.
GIT_TERMINAL_PROMPT=0 $GIT_SYNC push --force-with-lease "$REMOTE_NAME" HEAD:main

echo "GitHub sync complete: HEAD pushed to ${REMOTE_NAME}/main"
