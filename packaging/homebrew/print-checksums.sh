#!/usr/bin/env bash
#
# Print the sha256 of every asset of a DeepVibe GitHub release, straight from
# the GitHub API digest. Use the output to refresh the hashes in
# deepvibe.rb (Homebrew) and packaging/aur/PKGBUILD.
#
# Usage:
#   packaging/homebrew/print-checksums.sh [tag]     # tag defaults to "latest"
#
# Requires an authenticated `gh` (GH_TOKEN or `gh auth login`).

set -euo pipefail

TAG="${1:-latest}"
REPO="${REPO:-deepvibe-eu/DeepVibe}"

gh release view "$TAG" --repo "$REPO" \
  --json tagName,assets \
  --jq '.tagName as $t | .assets[] | select(.name | test("blockmap$") | not) | "\(.digest | sub("^sha256:"; ""))  \(.name)"'
