#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INSTALLER="${REPO_ROOT}/install.sh"
BUILDER="${REPO_ROOT}/scripts/build-release-asset.sh"
WINDOWS_SMOKE="${REPO_ROOT}/scripts/verify-windows-install-smoke.sh"
VERSION="0.0.6-pre"
SUPPORTED_PLATFORMS=(
  darwin-arm64
  darwin-x86_64
  linux-arm64
  linux-x86_64
  windows-x86_64
)

fail() {
  echo "release asset matrix verification failed: $*" >&2
  exit 1
}

expect_success_output() {
  local expected="$1"
  shift
  local output

  if ! output="$("$@" 2>&1)"; then
    echo "$output" >&2
    fail "expected success from: $*"
  fi

  if [ "$output" != "$expected" ]; then
    echo "expected: ${expected}" >&2
    echo "actual: ${output}" >&2
    fail "unexpected output from: $*"
  fi
}

expect_failure_contains() {
  local expected_text="$1"
  shift
  local output

  if output="$("$@" 2>&1)"; then
    echo "$output" >&2
    fail "expected failure from: $*"
  fi

  if [[ "$output" != *"$expected_text"* ]]; then
    echo "expected text: ${expected_text}" >&2
    echo "actual: ${output}" >&2
    fail "unexpected failure text from: $*"
  fi
}

for platform in "${SUPPORTED_PLATFORMS[@]}"; do
  asset="ccc-${VERSION}-${platform}.tar.gz"
  expect_success_output \
    "$asset" \
    env CCC_PRINT_ASSET=1 CCC_VERSION="v${VERSION}" CCC_PLATFORM="$platform" "$INSTALLER"
  expect_success_output \
    "$asset" \
    env CCC_PRINT_ASSET=1 "$BUILDER" "$VERSION" "$platform"
done

expect_failure_contains \
  "Supported platforms: darwin-arm64 darwin-x86_64 linux-arm64 linux-x86_64 windows-x86_64" \
  env CCC_PRINT_ASSET=1 CCC_VERSION="v${VERSION}" CCC_PLATFORM="unsupported-platform" "$INSTALLER"

expect_failure_contains \
  "Supported platforms: darwin-arm64 darwin-x86_64 linux-arm64 linux-x86_64 windows-x86_64" \
  env CCC_PRINT_ASSET=1 "$BUILDER" "$VERSION" "unsupported-platform"

expect_failure_contains \
  "Windows release assets can be named with CCC_PRINT_ASSET=1, but this Bash installer does not perform native Windows installs." \
  env CCC_VERSION="v${VERSION}" CCC_PLATFORM="windows-x86_64" "$INSTALLER"

"${WINDOWS_SMOKE}"

echo "Release asset matrix verification passed."
