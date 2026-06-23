#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'FAIL: run this command from inside a Git working tree.\n' >&2
  exit 1
}

cd "$repo_root"
chmod +x .githooks/pre-commit .githooks/pre-push
chmod +x .agents/scripts/check-architecture-policy.sh
chmod +x .agents/scripts/run-repository-checks.sh
chmod +x .agents/scripts/install-hooks.sh
git config --local core.hooksPath .githooks

printf 'Installed repository hooks from %s/.githooks\n' "$repo_root"
printf 'pre-commit: architecture policy validation\n'
printf 'pre-push: full available repository verification\n'
