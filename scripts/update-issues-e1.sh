#!/usr/bin/env bash
# Update GitHub issue bodies for Epic E1, T1.1, and T1.3.
#
# Prerequisites:
#   - gh CLI installed (https://cli.github.com/)
#   - Authenticated: run `gh auth login` once before using this script
#
# Usage (from repo root):
#   bash scripts/update-issues-e1.sh
#
# If you prefer to invoke it directly, make it executable first:
#   chmod +x scripts/update-issues-e1.sh && ./scripts/update-issues-e1.sh

set -euo pipefail

REPO="Taleef7/CorvEd"
BODIES_DIR=".github/issue-bodies"

echo "Updating Epic E1 issue bodies..."
echo ""

echo "→ Updating Epic E1 (#5)..."
gh issue edit 5 --repo "$REPO" --body-file "$BODIES_DIR/issue-5-epic-e1.md"
echo "  ✅ Done"

echo "→ Updating T1.1 (#6)..."
gh issue edit 6 --repo "$REPO" --body-file "$BODIES_DIR/issue-6-t1-1.md"
echo "  ✅ Done"

echo "→ Updating T1.3 (#8)..."
gh issue edit 8 --repo "$REPO" --body-file "$BODIES_DIR/issue-8-t1-3.md"
echo "  ✅ Done"

echo ""
echo "✅ All E1 issue bodies updated successfully."
echo "   View them at: https://github.com/$REPO/issues"
