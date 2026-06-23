#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

failure_count=0

pass() {
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  failure_count=$((failure_count + 1))
}

require_file() {
  local file="$1"

  if [[ -s "$file" ]]; then
    pass "$file exists and is not empty"
  else
    fail "$file is missing or empty"
  fi
}

require_text() {
  local file="$1"
  local text="$2"

  if grep -Fq "$text" "$file"; then
    pass "$file contains $text"
  else
    fail "$file does not contain $text"
  fi
}

required_files=(
  "AGENTS.md"
  ".agents/rules/architecture-boundaries.md"
  ".agents/rules/decomposition.md"
  ".agents/rules/refactoring-safety.md"
  ".agents/rules/verification.md"
  ".agents/skills/architecture/SKILL.md"
  ".agents/skills/architecture/references/audit.md"
  ".agents/skills/architecture/references/plan.md"
  ".agents/skills/architecture/references/refactor.md"
  ".agents/skills/architecture/references/verify.md"
  ".agents/skills/architecture/references/review.md"
)

for file in "${required_files[@]}"; do
  require_file "$file"
done

require_text "AGENTS.md" "## Architecture invariants"
require_text "AGENTS.md" "## Refactoring invariants"
require_text "AGENTS.md" "## Architecture routing"
require_text "AGENTS.md" "architecture"

skill_file=".agents/skills/architecture/SKILL.md"
require_text "$skill_file" "name: architecture"
require_text "$skill_file" "description:"
require_text "$skill_file" "# Architecture router"

frontmatter_markers="$(grep -c '^---$' "$skill_file" || true)"
if (( frontmatter_markers >= 2 )); then
  pass "$skill_file has YAML frontmatter boundaries"
else
  fail "$skill_file is missing YAML frontmatter boundaries"
fi

for rule in architecture-boundaries decomposition refactoring-safety verification; do
  require_text "$skill_file" ".agents/rules/${rule}.md"
done

for reference in audit plan refactor verify review; do
  require_text "$skill_file" "references/${reference}.md"
  require_file ".agents/skills/architecture/references/${reference}.md"
done

for file in "${required_files[@]}" README.md; do
  [[ -f "$file" ]] || continue
  fence_count="$(grep -c '^```' "$file" || true)"

  if (( fence_count % 2 == 0 )); then
    pass "$file has balanced fenced code blocks"
  else
    fail "$file has an unbalanced fenced code block"
  fi
done

if (( failure_count > 0 )); then
  printf '\nArchitecture policy validation failed with %d issue(s).\n' "$failure_count" >&2
  exit 1
fi

printf '\nArchitecture policy validation passed.\n'
