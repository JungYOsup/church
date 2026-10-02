#!/usr/bin/env bash
# PreToolUse hook (Write|Edit): src/lib의 순수 로직 파일은 짝 테스트(<이름>.test.ts)가 있어야 쓸 수 있다.
# - 대상은 src/lib/**/*.ts. 테스트, 타입 선언, types.ts, utils.ts(shadcn 생성), mock/, data/는 뺀다.
# - 짝 테스트가 없으면 exit 2로 쓰기를 막고, 테스트부터 쓰라는 안내를 Claude에게 넘긴다.
# - `--check <경로…>`: 짝 테스트가 없는 대상 경로(프로젝트 기준 상대 경로)를 출력하고 exit 1.
#   Write·Edit matcher가 보지 못하는 Bash로 쓴 파일을 Stop hook(verify-on-stop.sh)이 이 모드로 확인한다.
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

is_target() {
  case "$1" in
    *.test.ts | *.d.ts | src/lib/types.ts | src/lib/utils.ts | src/lib/mock/* | src/lib/data/*) return 1 ;;
    src/lib/*.ts) return 0 ;;
    *) return 1 ;;
  esac
}

pair_of() { printf '%s\n' "${1%.ts}.test.ts"; }

if [ "${1:-}" = "--check" ]; then
  shift
  missing=0
  for rel in "$@"; do
    if is_target "$rel" && [ ! -f "$ROOT/$(pair_of "$rel")" ]; then
      printf '%s\n' "$rel"
      missing=1
    fi
  done
  exit "$missing"
fi

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
case "$file" in
  "$ROOT"/*) rel="${file#"$ROOT"/}" ;;
  *) exit 0 ;;
esac
is_target "$rel" || exit 0

pair=$(pair_of "$rel")
[ -f "$ROOT/$pair" ] && exit 0

cat >&2 <<EOF
테스트 먼저: \`$rel\`의 짝 테스트 \`$pair\`가 없습니다.
1. \`$pair\`에 테스트를 먼저 쓰고 \`npm run test:unit\`으로 실패(red)를 확인합니다.
2. 그다음 \`$rel\` 파일을 구현해 통과(green)시킵니다.
대상은 src/lib의 순수 로직입니다(테스트, types.ts, utils.ts, mock/, data/ 제외).
EOF
exit 2
