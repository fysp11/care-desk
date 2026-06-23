#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

bash .agents/scripts/check-architecture-policy.sh

if [[ ! -f package.json ]]; then
  printf '\nSKIP: package.json is not present; no Bun tests, type checks, lint, or build commands are available.\n'
  exit 0
fi

if ! command -v bun >/dev/null 2>&1; then
  printf 'FAIL: package.json exists but Bun is not installed or not on PATH.\n' >&2
  exit 1
fi

has_script() {
  local script_name="$1"
  SCRIPT_NAME="$script_name" bun -e '
    const manifest = await Bun.file("package.json").json();
    process.exit(manifest.scripts?.[process.env.SCRIPT_NAME] ? 0 : 1);
  ' >/dev/null 2>&1
}

run_script() {
  local script_name="$1"
  printf '\nRUN: bun run %s\n' "$script_name"
  bun run "$script_name"
}

if has_script test; then
  run_script test
elif find . -path './node_modules' -prune -o -path './.git' -prune -o -type f \
  \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.test.js' \
     -o -name '*.spec.ts' -o -name '*.spec.tsx' -o -name '*.spec.js' \) \
  -print -quit | grep -q .; then
  printf '\nRUN: bun test\n'
  bun test
else
  printf '\nSKIP: no test script or test files were discovered.\n'
fi

for script_name in typecheck lint check:cycles check:boundaries check:dead-code build; do
  if has_script "$script_name"; then
    run_script "$script_name"
  else
    printf '\nSKIP: package script %s is not available.\n' "$script_name"
  fi
done

if has_script format:check; then
  run_script format:check
elif has_script check:format; then
  run_script check:format
else
  printf '\nSKIP: no formatting-validation package script is available.\n'
fi
