#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

failure_count=0

pass() {
  printf 'PASS: %s\n' "$1"
}

skip() {
  printf 'SKIP: %s\n' "$1"
}

fail() {
  printf 'FAIL: %b\n' "$1" >&2
  failure_count=$((failure_count + 1))
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
  if [[ -s "$file" ]]; then
    pass "$file exists and is not empty"
  else
    fail "$file is missing or empty"
  fi
done

if [[ -f AGENTS.md ]]; then
  agents_lines="$(wc -l < AGENTS.md | tr -d '[:space:]')"
  if (( agents_lines <= 100 )); then
    pass "AGENTS.md stays within the 100-line persistent-context budget"
  else
    fail "AGENTS.md has ${agents_lines} lines; move procedural detail into rules or skills"
  fi
fi

if [[ -d .agents/skills ]]; then
  skill_directory_count="$(find .agents/skills -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d '[:space:]')"
  skill_file_count="$(find .agents/skills -type f -name SKILL.md | wc -l | tr -d '[:space:]')"

  if [[ "$skill_directory_count" == "1" && -d .agents/skills/architecture ]]; then
    pass "architecture is the single discoverable skill directory"
  else
    fail "expected exactly one discoverable skill directory named architecture; found ${skill_directory_count}"
  fi

  if [[ "$skill_file_count" == "1" ]]; then
    pass "exactly one SKILL.md router is discoverable"
  else
    fail "expected exactly one SKILL.md under .agents/skills; found ${skill_file_count}"
  fi
fi

skill_file=".agents/skills/architecture/SKILL.md"
if [[ -f "$skill_file" ]]; then
  frontmatter_markers="$(grep -c '^---$' "$skill_file" || true)"
  if [[ "$frontmatter_markers" -ge 2 ]] \
    && grep -q '^name: architecture$' "$skill_file" \
    && grep -q '^description:' "$skill_file"; then
    pass "architecture skill has valid identifying frontmatter"
  else
    fail "architecture skill frontmatter must declare name and description"
  fi

  for reference in audit plan refactor verify review; do
    if grep -Fq "references/${reference}.md" "$skill_file"; then
      pass "router references ${reference}.md"
    else
      fail "router does not reference references/${reference}.md"
    fi
  done

  for rule in architecture-boundaries decomposition refactoring-safety verification; do
    if grep -Fq ".agents/rules/${rule}.md" "$skill_file"; then
      pass "router loads ${rule}.md"
    else
      fail "router does not load .agents/rules/${rule}.md"
    fi
  done
fi

for file in "${required_files[@]}" README.md; do
  [[ -f "$file" ]] || continue
  fence_count="$(grep -c '^```' "$file" || true)"
  if (( fence_count % 2 == 0 )); then
    pass "$file has balanced fenced code blocks"
  else
    fail "$file has an unbalanced fenced code block"
  fi
done

source_include_args=(
  --include='*.ts'
  --include='*.tsx'
  --include='*.js'
  --include='*.jsx'
  --include='*.mts'
  --include='*.cts'
)

check_cross_layer_imports() {
  local source_layer="$1"
  shift

  local source_dir="src/${source_layer}"
  if [[ ! -d "$source_dir" ]]; then
    skip "${source_dir} does not exist; no ${source_layer} import edges to inspect"
    return
  fi

  local target_layer
  for target_layer in "$@"; do
    local pattern="(from[[:space:]]+|require[[:space:]]*\(|import[[:space:]]*\()[[:space:]]*(['\"]${target_layer}(/|['\"])|['\"][^'\"]*/${target_layer}(/|['\"]))"
    local matches
    matches="$(grep -RInE "${source_include_args[@]}" "$pattern" "$source_dir" || true)"

    if [[ -n "$matches" ]]; then
      fail "${source_layer} imports forbidden ${target_layer} code:\n${matches}"
    else
      pass "${source_layer} has no imports from ${target_layer}"
    fi
  done
}

check_package_imports() {
  local source_layer="$1"
  local package_pattern="$2"
  local description="$3"
  local source_dir="src/${source_layer}"

  if [[ ! -d "$source_dir" ]]; then
    skip "${source_dir} does not exist; no ${description} imports to inspect"
    return
  fi

  local pattern="(from[[:space:]]+|require[[:space:]]*\(|import[[:space:]]*\()[[:space:]]*['\"](${package_pattern})['\"]"
  local matches
  matches="$(grep -RInE "${source_include_args[@]}" "$pattern" "$source_dir" || true)"

  if [[ -n "$matches" ]]; then
    fail "${source_layer} imports forbidden ${description}:\n${matches}"
  else
    pass "${source_layer} has no direct ${description} imports"
  fi
}

check_cross_layer_imports domain application infrastructure presentation transport
check_cross_layer_imports application infrastructure presentation transport
check_cross_layer_imports transport infrastructure presentation
check_cross_layer_imports presentation infrastructure
check_cross_layer_imports infrastructure presentation transport

framework_and_infrastructure_packages="@angular/[^'\"]+|@aws-sdk/[^'\"]+|@nestjs/[^'\"]+|@prisma/client|react|react/[^'\"]+|react-dom|react-dom/[^'\"]+|next|next/[^'\"]+|vue|svelte|express|hono|fastify|koa|elysia|prisma|drizzle-orm|typeorm|sequelize|mongoose|pg|mysql2|better-sqlite3|sqlite3|redis|ioredis|stripe|openai|firebase|firebase/[^'\"]+"
persistence_packages='@prisma/client|prisma|drizzle-orm|typeorm|sequelize|mongoose|pg|mysql2|better-sqlite3|sqlite3|redis|ioredis'

check_package_imports domain "$framework_and_infrastructure_packages" "framework, persistence, or external-SDK packages"
check_package_imports application "$persistence_packages" "persistence packages"
check_package_imports transport "$persistence_packages" "persistence packages"
check_package_imports presentation "$persistence_packages" "persistence packages"

if (( failure_count > 0 )); then
  printf '\nArchitecture policy validation failed with %d issue(s).\n' "$failure_count" >&2
  exit 1
fi

printf '\nArchitecture policy validation passed.\n'
