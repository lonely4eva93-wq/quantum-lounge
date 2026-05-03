#!/bin/bash
# Installs git hooks that automatically sync to GitHub after every local commit.
# Run this script once after cloning, and it is re-run by scripts/post-merge.sh
# after each task merge so the hooks stay current.

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SYNC_SCRIPT="$REPO_ROOT/scripts/github-sync.sh"

mkdir -p "$HOOKS_DIR"

cat > "$HOOKS_DIR/post-commit" <<HOOK_EOF
#!/bin/bash
# Auto-installed by scripts/install-git-hooks.sh — do not edit directly.
# Pushes HEAD to GitHub after every local commit.
# Failures are logged but do not abort the commit (exit 0).
if ! "\${SYNC_SCRIPT}" 2>&1; then
  echo "WARNING: GitHub sync failed after commit — run scripts/github-sync.sh manually to retry." >&2
fi
HOOK_EOF

# Substitute the real path into the hook
sed -i "s|\${SYNC_SCRIPT}|${SYNC_SCRIPT}|g" "$HOOKS_DIR/post-commit"
chmod +x "$HOOKS_DIR/post-commit"
chmod +x "$SYNC_SCRIPT"

echo "Installed .git/hooks/post-commit → scripts/github-sync.sh"
