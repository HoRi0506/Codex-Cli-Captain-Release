#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INSTALLER="${REPO_ROOT}/install.ps1"
BUILDER="${REPO_ROOT}/scripts/build-release-asset.sh"
VERSION="0.0.7-pre"

fail() {
  echo "windows install smoke failed: $*" >&2
  exit 1
}

expect_contains() {
  local needle="$1"
  local path="$2"
  if ! grep -Fq "$needle" "$path"; then
    fail "expected ${path} to contain: ${needle}"
  fi
}

if [ ! -s "$INSTALLER" ]; then
  fail "missing install.ps1"
fi

expect_contains "Resolve-CccPlatform" "$INSTALLER"
expect_contains "windows-x86_64" "$INSTALLER"
expect_contains "Windows on ARM is not published for this pre-release yet" "$INSTALLER"
expect_contains "Invoke-WebRequest" "$INSTALLER"
expect_contains "tar -xzf" "$INSTALLER"
expect_contains "ccc.cmd" "$INSTALLER"
expect_contains "codex mcp add ccc" "$INSTALLER"
expect_contains "check-install" "$INSTALLER"

for platform in windows-x86_64; do
  expected="ccc-${VERSION}-${platform}.tar.gz"
  actual="$(env CCC_PRINT_ASSET=1 "$BUILDER" "$VERSION" "$platform")"
  if [ "$actual" != "$expected" ]; then
    fail "builder asset mismatch for ${platform}: expected ${expected}, got ${actual}"
  fi
done

echo "Windows install smoke passed."
