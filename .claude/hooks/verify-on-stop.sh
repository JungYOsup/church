#!/usr/bin/env bash
# Stop hook: 앱 코드가 바뀐 응답이 끝날 때 CLAUDE.md의 DoD(npm run lint && npm run build)를 실행한다.
# - 커밋 이후 앱 코드 변경이 없거나, 마지막으로 통과한 상태와 같으면 바로 끝낸다.
# - 실패하면 exit 2로 응답 종료를 막고 에러를 Claude에게 넘긴다.
# - 재시도(stop_hook_active=true)에서도 실패하면 반복을 멈추고 사용자에게 경고만 띄운다.
set -uo pipefail

input=$(cat)
stop_active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null || echo false)

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

APP_PATHS=(src public package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs postcss.config.mjs components.json)
STATE_FILE="node_modules/.cache/claude-verify/last-passed"

changes=$(
  git diff HEAD -- "${APP_PATHS[@]}" 2>/dev/null
  git ls-files --others --exclude-standard -z -- "${APP_PATHS[@]}" 2>/dev/null |
    while IFS= read -r -d '' file; do shasum "$file"; done
)
[ -z "$changes" ] && exit 0

fingerprint=$(printf '%s' "$changes" | shasum | cut -d' ' -f1)
if [ -f "$STATE_FILE" ] && [ "$(cat "$STATE_FILE")" = "$fingerprint" ]; then
  exit 0
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 && nvm use --silent >/dev/null 2>&1

output=$( { npm run lint && npm run build; } 2>&1 )
status=$?

if [ "$status" -eq 0 ]; then
  mkdir -p "$(dirname "$STATE_FILE")"
  printf '%s\n' "$fingerprint" > "$STATE_FILE"
  exit 0
fi

error_tail=$(printf '%s\n' "$output" | tail -n 40)

if [ "$stop_active" = "true" ]; then
  jq -n --arg msg "DoD 확인 실패: npm run lint && npm run build가 아직 통과하지 않습니다. 고쳐 달라고 요청하거나 직접 실행해 확인하세요." \
    '{systemMessage: $msg}'
  exit 0
fi

{
  echo "DoD 확인 실패: npm run lint && npm run build가 통과하지 않았습니다. 아래 에러를 고친 뒤 응답을 마치세요."
  echo "--- 마지막 40줄 ---"
  printf '%s\n' "$error_tail"
} >&2
exit 2
