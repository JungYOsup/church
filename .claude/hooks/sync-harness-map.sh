#!/usr/bin/env bash
# Stop hook: 하네스 파일이나 커밋이 바뀌면 하네스 지도 아티팩트를 갱신하라고 Claude에게 요청한다.
# - 지문은 HEAD 커밋 + 하네스 경로의 커밋 안 된 변경. 마지막으로 반영한 지문과 같으면 바로 끝낸다.
# - 다르면 exit 2로 응답 종료를 막고 갱신 순서를 넘긴다. 같은 지문으로는 한 번만 막고, 이후엔 경고만 띄운다.
# - Claude는 지도를 갱신한 뒤 `.claude/hooks/sync-harness-map.sh --mark-synced`로 지문을 기록한다.
set -uo pipefail

MAP_URL="https://claude.ai/artifact/925V77bde8aKNrdrCgXHke"
HARNESS_PATHS=(CLAUDE.md AGENTS.md .claude docs .harness .gitignore .nvmrc package.json components.json eslint.config.mjs tsconfig.json)
STATE_DIR="node_modules/.cache/claude-harness-map"

[ "${1:-}" = "--mark-synced" ] || cat >/dev/null

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

head=$(git rev-parse HEAD 2>/dev/null || echo none)
fingerprint=$(
  {
    echo "$head"
    git diff HEAD -- "${HARNESS_PATHS[@]}" 2>/dev/null
    git ls-files --others --exclude-standard -z -- "${HARNESS_PATHS[@]}" 2>/dev/null |
      while IFS= read -r -d '' file; do shasum "$file"; done
  } | shasum | cut -d' ' -f1
)

mkdir -p "$STATE_DIR"

if [ "${1:-}" = "--mark-synced" ]; then
  printf '%s\n%s\n' "$fingerprint" "$head" > "$STATE_DIR/synced"
  echo "하네스 지도 반영 기록: ${head:0:7}"
  exit 0
fi

synced_fp=$(sed -n 1p "$STATE_DIR/synced" 2>/dev/null)
synced_head=$(sed -n 2p "$STATE_DIR/synced" 2>/dev/null)
[ "$fingerprint" = "$synced_fp" ] && exit 0

if [ "$fingerprint" = "$(cat "$STATE_DIR/requested" 2>/dev/null)" ]; then
  jq -n --arg msg "하네스 지도가 아직 최신이 아닙니다. 갱신을 요청하거나, 반영할 내용이 없으면 .claude/hooks/sync-harness-map.sh --mark-synced를 실행하세요." \
    '{systemMessage: $msg}'
  exit 0
fi

printf '%s\n' "$fingerprint" > "$STATE_DIR/requested"

{
  echo "하네스가 바뀌었습니다. 하네스 지도 아티팩트를 갱신한 뒤 응답을 마치세요."
  echo "지도: $MAP_URL"
  echo
  if [ -z "$synced_head" ]; then
    echo "- 이전 반영 기록이 없습니다 (처음 반영). 지도의 기준 시각·커밋과 지금 저장소를 비교하세요."
  elif [ "$synced_head" != "$head" ]; then
    echo "- 새 커밋:"
    git log --oneline "$synced_head..$head" 2>/dev/null | sed 's/^/    /' ||
      echo "    (이전 HEAD $synced_head 를 찾을 수 없음)"
  fi
  files=$(
    git diff --name-only HEAD -- "${HARNESS_PATHS[@]}" 2>/dev/null
    git ls-files --others --exclude-standard -- "${HARNESS_PATHS[@]}" 2>/dev/null
  )
  if [ -n "$files" ]; then
    echo "- 커밋 안 된 하네스 파일:"
    printf '%s\n' "$files" | sed 's/^/    /'
  fi
  echo
  echo "갱신 순서:"
  echo "1. Artifact read로 지도 최신본을 받고, 저장된 파일을 고칩니다."
  echo "2. 바뀐 내용에 맞게 데이터(AXES의 지금·요약, FILES, STEPS, TODO, 상단 기준 시각·커밋 수)를 고친 뒤 같은 url로 publish합니다."
  echo "3. 점수와 체크 상태는 진단 결과(.harness/history.jsonl)가 바뀔 때만 고칩니다. 임의로 점수를 매기지 않습니다."
  echo "4. .claude/hooks/sync-harness-map.sh --mark-synced 를 실행합니다."
  echo "지도에 드러날 변화가 아니면(오타 수정 등) 게시는 건너뛰고, 이유를 한 줄로 말한 뒤 4번만 합니다."
} >&2
exit 2
