#!/bin/sh
set -eu
STATE_FILE='/Users/vinhnguyenxuan/Developer/learn-by-doing/vtchat/.opencode/codemod/periodic-update/last-check-epoch-secs'
INTERVAL=21600

NOW="$(date +%s 2>/dev/null || printf '0')"
if [ "$NOW" = "0" ]; then
  exit 0
fi

LAST=0
if [ -f "$STATE_FILE" ]; then
  LAST="$(cat "$STATE_FILE" 2>/dev/null || printf '0')"
  case "$LAST" in
    ''|*[!0-9]*) LAST=0 ;;
  esac
fi

if [ "$LAST" -gt 0 ] && [ $((NOW - LAST)) -lt "$INTERVAL" ]; then
  exit 0
fi

mkdir -p "$(dirname "$STATE_FILE")"
printf '%s\n' "$NOW" > "$STATE_FILE"

OUTPUT="$(
{
if [ -x '/private/var/folders/bw/b3wqv2xj57s853ypn022f87w0000gp/T/bunx-502-codemod@latest/node_modules/@codemod.com/cli-darwin-arm64/codemod' ]; then
  '/private/var/folders/bw/b3wqv2xj57s853ypn022f87w0000gp/T/bunx-502-codemod@latest/node_modules/@codemod.com/cli-darwin-arm64/codemod' 'ai' '--harness' 'opencode' '--project' '--update-policy' 'auto-safe' '--require-signed-manifest' '--format' 'json'
  exit $?
fi

if command -v 'codemod' >/dev/null 2>&1; then
  'codemod' 'ai' '--harness' 'opencode' '--project' '--update-policy' 'auto-safe' '--require-signed-manifest' '--format' 'json'
  exit $?
fi

if command -v 'npx' >/dev/null 2>&1; then
  'npx' 'codemod@latest' 'ai' '--harness' 'opencode' '--project' '--update-policy' 'auto-safe' '--require-signed-manifest' '--format' 'json'
  exit $?
fi
  exit 127
} 2>&1 || true
)"
if printf '%s' "$OUTPUT" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"update_available"|"rolled_back"[[:space:]]*:[[:space:]]*true|"failed"[[:space:]]*:[[:space:]]*[1-9]'; then
  printf '%s\n' "$OUTPUT"
fi
