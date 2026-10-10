#!/usr/bin/env bash
#
# Build a DeepVibe classic snap without snapcraft/LXD.
#
# A snap is a SquashFS image with a `meta/snap.yaml` at its root, so for a
# classic-confinement "dump" snap we can assemble it directly from the
# released Linux tarball. This avoids snapcraft's LXD/multipass requirement
# and works on hosts without a full snapcraft toolchain.
#
# Usage:
#   packaging/snap/build-snap.sh [version] [path/to/DeepVibe-<v>-linux-x64.tar.gz]
#
# The result (deepvibe_<version>_amd64.snap) is written next to this script
# (in packaging/snap/). Install it locally with:
#   sudo snap install --dangerous packaging/snap/deepvibe_<version>_amd64.snap
#
# To publish, install snapcraft (`sudo snap install snapcraft --classic`) and
# use snapcraft.yaml instead; a raw .snap can only be side-loaded (--dangerous).

set -euo pipefail

VERSION="${1:-1.0.2}"
TARBALL="${2:-$(cd "$(dirname "$0")/../../packages/desktop/dist" && pwd)/DeepVibe-${VERSION}-linux-x64.tar.gz}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="${HERE}/deepvibe_${VERSION}_amd64.snap"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [[ ! -f "$TARBALL" ]]; then
  echo "error: tarball not found: $TARBALL" >&2
  exit 1
fi

echo "==> Extracting $TARBALL"
tar -xzf "$TARBALL" -C "$WORK"
[[ -d "$WORK/DeepVibe" ]] || { echo "error: expected top-level DeepVibe/ in tarball" >&2; exit 1; }

PRIME="$WORK/prime"
mkdir -p \
  "$PRIME/opt/deepvibe" \
  "$PRIME/bin" \
  "$PRIME/usr/share/applications" \
  "$PRIME/usr/share/icons/hicolor/512x512/apps" \
  "$PRIME/meta/gui"

echo "==> Staging /opt/deepvibe"
cp -a "$WORK/DeepVibe/." "$PRIME/opt/deepvibe/"
chmod +x "$PRIME/opt/deepvibe/deepvibe"

# Reference the app inside the snap via $SNAP, not the host /opt path:
# inside the snap the payload lives at $SNAP/opt/deepvibe, and a host-absolute
# /opt path only exists on the machine that built the snap.
printf '#!/bin/sh\nexec "$SNAP/opt/deepvibe/deepvibe" "$@"\n' > "$PRIME/bin/deepvibe"
chmod +x "$PRIME/bin/deepvibe"

cp "$HERE/gui/deepvibe.desktop" "$PRIME/usr/share/applications/deepvibe.desktop"
cp "$HERE/gui/deepvibe.png" "$PRIME/usr/share/icons/hicolor/512x512/apps/deepvibe.png"
cp "$HERE/gui/deepvibe.desktop" "$PRIME/meta/gui/deepvibe.desktop"
cp "$HERE/gui/deepvibe.png" "$PRIME/meta/gui/deepvibe.png"

cat > "$PRIME/meta/snap.yaml" <<EOF
name: deepvibe
version: "${VERSION}"
summary: The (unofficial) DeepSeek coding partner IDE
description: |
  DeepVibe is an unofficial coding partner IDE for DeepSeek, based on ZCode
  (Apache-2.0). One provider per app, as a partner rather than an agent.

  Note: this is a classic-confinement snap. Like other IDEs (e.g. VSCode) it
  needs access to the host toolchain (git, node, shells) — the classic
  confinement is what makes that possible without the Flatpak sandbox problem.
base: core24
grade: stable
confinement: classic
architectures:
  - amd64
apps:
  deepvibe:
    command: bin/deepvibe
EOF

# Desktop integration comes from meta/gui/deepvibe.desktop (+ .png); the
# store rejects a `desktop:` key in the final snap.yaml.
echo "==> Building $OUT"
# -no-fragments is what the Snap Store's squashfs check expects.
mksquashfs "$PRIME" "$OUT" -noappend -comp xz -no-fragments -all-root -no-xattrs >/dev/null
ls -lh "$OUT"
