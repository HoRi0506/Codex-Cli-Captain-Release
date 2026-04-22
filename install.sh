#!/usr/bin/env bash
set -euo pipefail

REPO="HoRi0506/Codex-Foreman-release"
VERSION="${CODEX_FOREMAN_VERSION:-v0.0.1}"
INSTALL_ROOT="${CODEX_FOREMAN_INSTALL_ROOT:-$HOME/.local/share/codex-foreman}"
BIN_DIR="${CODEX_FOREMAN_BIN_DIR:-$HOME/.local/bin}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need_cmd uname
need_cmd mktemp
need_cmd tar
need_cmd curl
need_cmd codex

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin) OS="darwin" ;;
  Linux) OS="linux" ;;
  *)
    echo "Unsupported OS: $OS" >&2
    exit 1
    ;;
esac

case "$ARCH" in
  arm64|aarch64) ARCH="arm64" ;;
  x86_64|amd64) ARCH="x86_64" ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

ASSET="codex-foreman-${VERSION#v}-${OS}-${ARCH}.tar.gz"
DOWNLOAD_URL="${CODEX_FOREMAN_DOWNLOAD_URL:-https://github.com/${REPO}/releases/download/${VERSION}/${ASSET}}"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-foreman-install.XXXXXX")"
EXTRACT_DIR="${TMP_DIR}/extract"
TARGET_DIR="${INSTALL_ROOT}/current"
TARGET_BIN="${BIN_DIR}/codex-foreman"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$EXTRACT_DIR" "$BIN_DIR" "$INSTALL_ROOT"

echo "Downloading ${ASSET}..."
curl -fsSL "$DOWNLOAD_URL" -o "${TMP_DIR}/${ASSET}" || {
  echo "Failed to download ${DOWNLOAD_URL}" >&2
  echo "This usually means the platform asset has not been published yet." >&2
  exit 1
}

echo "Unpacking ${ASSET}..."
tar -xzf "${TMP_DIR}/${ASSET}" -C "$EXTRACT_DIR"

if [ ! -x "${EXTRACT_DIR}/bin/codex-foreman" ]; then
  echo "The downloaded bundle does not contain bin/codex-foreman." >&2
  exit 1
fi

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "${EXTRACT_DIR}/." "$TARGET_DIR/"
ln -sfn "${TARGET_DIR}/bin/codex-foreman" "$TARGET_BIN"

echo "Refreshing Codex MCP registration..."
codex mcp remove codex-foreman >/dev/null 2>&1 || true
codex mcp add codex-foreman -- "${TARGET_DIR}/bin/codex-foreman" mcp

echo "Running setup..."
"${TARGET_DIR}/bin/codex-foreman" setup

echo
echo "Running check-install..."
"${TARGET_DIR}/bin/codex-foreman" check-install

echo
echo "Install complete."
echo "Installed root: ${TARGET_DIR}"
echo "Binary link: ${TARGET_BIN}"
echo "If ${BIN_DIR} is not on your PATH, add it before using codex-foreman directly."
echo "You must restart Codex CLI before using \$cap or relying on the new MCP registration."
echo "After restarting Codex CLI, run: codex-foreman check-install"
