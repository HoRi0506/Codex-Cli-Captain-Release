#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MANIFEST_PATH="${REPO_ROOT}/release-repo-manifest.json"
PRINT_ASSET="${CCC_PRINT_ASSET:-}"
SUPPORTED_PLATFORMS="darwin-arm64 darwin-x86_64 linux-arm64 linux-x86_64 windows-x86_64 windows-arm64"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

if [ ! -f "${MANIFEST_PATH}" ]; then
  echo "Missing manifest: ${MANIFEST_PATH}" >&2
  exit 1
fi

manifest_value() {
  local key="$1"
  sed -n "s/.*\"${key}\": \"\\([^\"]*\\)\".*/\\1/p" "${MANIFEST_PATH}" | head -n 1
}

is_supported_platform() {
  case "$1" in
    darwin-arm64|darwin-x86_64|linux-arm64|linux-x86_64|windows-x86_64|windows-arm64) return 0 ;;
    *) return 1 ;;
  esac
}

VERSION="${1:-$(manifest_value package_version)}"
PLATFORM="${2:-$(manifest_value platform)}"

if [ -z "${VERSION}" ] || [ -z "${PLATFORM}" ]; then
  echo "Unable to resolve package_version/platform from ${MANIFEST_PATH}." >&2
  exit 1
fi

if ! is_supported_platform "${PLATFORM}"; then
  echo "Unsupported platform: ${PLATFORM}" >&2
  echo "Supported platforms: ${SUPPORTED_PLATFORMS}" >&2
  exit 1
fi

ASSET_NAME="ccc-${VERSION#v}-${PLATFORM}.tar.gz"

if [ "${PRINT_ASSET}" = "1" ]; then
  echo "${ASSET_NAME}"
  exit 0
fi

need_cmd tar
need_cmd mktemp

BINARY_PATH="${REPO_ROOT}/bin/ccc"
OUTPUT_PATH="${REPO_ROOT}/${ASSET_NAME}"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ccc-release-asset.XXXXXX")"
STAGE_DIR="${TMP_DIR}/stage"
EXTRACT_DIR="${TMP_DIR}/extract"

cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

if [ ! -x "${BINARY_PATH}" ] || [ ! -s "${BINARY_PATH}" ]; then
  echo "Expected a non-empty executable at ${BINARY_PATH} before packaging." >&2
  exit 1
fi

mkdir -p "${STAGE_DIR}" "${EXTRACT_DIR}"

for entry in README.md README.ko.md README.ja.md install.sh install.ps1 release-repo-manifest.json bin share docs scripts; do
  if [ -e "${REPO_ROOT}/${entry}" ]; then
    cp -R "${REPO_ROOT}/${entry}" "${STAGE_DIR}/${entry}"
  fi
done

if command -v strip >/dev/null 2>&1; then
  if strip "${STAGE_DIR}/bin/ccc" >/dev/null 2>&1 || strip -x "${STAGE_DIR}/bin/ccc" >/dev/null 2>&1; then
    echo "Stripped debug symbols from staged bin/ccc."
  else
    echo "strip could not process staged bin/ccc; packaging unstripped binary." >&2
  fi
else
  echo "strip not found; packaging unstripped bin/ccc." >&2
fi

rm -f "${OUTPUT_PATH}"
COPYFILE_DISABLE=1 tar -czf "${OUTPUT_PATH}" -C "${STAGE_DIR}" .

tar -xzf "${OUTPUT_PATH}" -C "${EXTRACT_DIR}"

if [ ! -x "${EXTRACT_DIR}/bin/ccc" ] || [ ! -s "${EXTRACT_DIR}/bin/ccc" ]; then
  echo "Generated ${ASSET_NAME}, but the extracted bundle has an invalid bin/ccc." >&2
  exit 1
fi

echo "Built ${OUTPUT_PATH}"
ls -lh "${OUTPUT_PATH}" "${EXTRACT_DIR}/bin/ccc"
