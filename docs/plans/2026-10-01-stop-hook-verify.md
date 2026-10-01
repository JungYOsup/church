# DoD 자동 확인: Stop hook으로 lint·build 실행

## Context
- CLAUDE.md의 Definition of Done(`npm run lint && npm run build` 통과)은 지금 **AI가 읽고 지키는 약속**입니다. AI가 깜빡하면 깨진 코드로 "완료"라고 말할 수 있습니다.
- Claude가 응답을 끝내려는 순간 실행되는 **Stop hook**으로 이 명령을 자동 실행합니다. 실패하면 응답을 끝내지 못하고 에러를 받아 고치게 합니다. DoD를 약속에서 강제로 바꾸는 작업입니다.
- 6축으로 보면:
  - **검증 축(VF-04 자동 검증):** "CI 또는 hook이 검증 명령을 자동 실행"하는 항목입니다. seed 단계라 아직 채점은 안 되지만 미리 갖추는 셈입니다.
  - **실행 축(EX-01):** DoD가 실제로 집행됩니다.
  - **개선 축:** 3단계에서 "DoD는 강제가 아니다"라는 빈틈을 발견하고 하네스에 반영한 사례입니다.
  - 넓게 보면 AI가 일하는 환경(하네스)의 구조를 보강한 것이 맞습니다. 다만 하네스 진단의 "구조 축 가드레일 hook(ST-05)"은 위험 명령을 실행 전에 막는 PreToolUse hook이라 성격이 다릅니다.

## 확인한 사실
- **Stop hook 동작(공식 문서):** `{"decision":"block","reason":"..."}` 출력 또는 `exit 2`(stderr가 이유가 됨)로 Claude가 응답을 끝내지 못하게 합니다. 다시 실행될 때는 입력의 `stop_hook_active`가 `true`이고, 연속 8번 막히면 Claude Code가 강제로 멈춥니다.
- **경로:** hook 안에서 `$CLAUDE_PROJECT_DIR`로 프로젝트 경로를 씁니다.
- **동시 실행:** Next.js 16은 `next dev`(`.next/dev`)와 `next build`의 출력 폴더가 분리되어 있어, 개발 서버를 켠 채로 빌드해도 됩니다(`version-16.md`).
- **도구:** jq 1.8.1과 shasum이 설치되어 있습니다.
- **기존 hook:** 전역 설정과 설치된 플러그인에 기존 Stop hook이 없어 충돌하지 않습니다.

## 만들 것

### 1. `.claude/hooks/verify-on-stop.sh` (새 파일, 실행 권한)
1. 입력 JSON에서 `stop_hook_active`를 읽고 `$CLAUDE_PROJECT_DIR`로 이동합니다.
2. **변경 확인:** 앱 경로(`src`, `public`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`)의 커밋 안 된 변경을 모아 지문(hash)을 만듭니다.
   - 대상은 `git diff HEAD`와 추적 안 되는 새 파일의 내용입니다.
   - 변경이 없으면 바로 종료합니다. 질문·답변 턴은 1초 안에 끝납니다.
   - 지문이 마지막 통과 지문과 같으면 바로 종료합니다. 이미 확인한 상태라 다시 빌드하지 않습니다.
3. **실행:** nvm으로 Node 22(`.nvmrc`)를 불러와 `npm run lint && npm run build`를 실행합니다.
4. **결과 처리:**
   - **통과:** 지문을 `node_modules/.cache/claude-verify/last-passed`에 저장합니다. 이미 git에서 제외된 캐시 위치라 `.gitignore`를 바꾸지 않아도 됩니다.
   - **실패(첫 시도):** 에러 출력의 마지막 40줄을 stderr로 보내고 `exit 2`로 막습니다. Claude가 에러를 보고 고칩니다.
   - **실패(재시도, `stop_hook_active=true`):** 무한 반복을 막기 위해 응답은 끝내게 하고, `systemMessage`로 "lint·build가 아직 실패 중"이라는 경고를 사용자 화면에 띄웁니다.

### 2. `.claude/settings.json`
기존 permissions는 그대로 두고 `hooks.Stop` 항목만 추가합니다.
```json
"hooks": { "Stop": [ { "hooks": [ {
  "type": "command",
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/verify-on-stop.sh",
  "timeout": 300,
  "statusMessage": "DoD 확인 중 (lint·build)"
} ] } ] }
```

### 3. `CLAUDE.md`
DoD 첫 줄에 "앱 코드를 바꾼 응답이 끝날 때 Stop hook(`.claude/hooks/verify-on-stop.sh`)이 자동 실행"을 덧붙입니다. 무엇이 자동이고 무엇이 수동인지 AI와 사람이 모두 알게 하기 위함입니다.

### 4. 기록
- 이 계획을 `docs/plans/2026-10-01-stop-hook-verify.md`로 저장합니다.
- 하네스 지도(아티팩트)를 갱신합니다. 파일 목록에 hook을 추가(실행·검증 축)하고, EX-01 설명과 "다음에 할 일"을 고칩니다.

## 검증
1. **스크립트를 직접 실행해 시험** (hook 입력 JSON을 파이프로 넣음)
   - 변경 없음 → 즉시 `exit 0`, 빌드 안 함
   - `src/lib/navigation.ts`에 일부러 타입 오류 추가 → `{"stop_hook_active":false}` → `exit 2`이고 stderr에 에러 내용
   - 같은 상태로 `{"stop_hook_active":true}` → `exit 0`이고 경고 JSON 출력
   - 오류를 지우고 정상 주석 한 줄만 남김 → lint·build 통과 → 지문 저장 → 다시 실행하면 즉시 건너뜀
   - 시험용 변경을 원래대로 되돌림
2. **설정 확인:** `jq -e '.hooks.Stop[0].hooks[0].command' .claude/settings.json`로 JSON 구조를 확인합니다.
3. **DoD:** `npm run lint && npm run build` 통과를 확인합니다.
4. **실제 동작:** `.claude/`에는 세션 시작 때부터 설정 파일이 있었으므로 새 hook이 바로 반영될 것으로 봅니다. 다음 응답이 끝날 때 상태 줄에 "DoD 확인 중"이 보이는지, 이후 지문 파일 시각이 바뀌는지로 확인합니다. 반영되지 않으면 `/hooks`를 한 번 열어 다시 불러오도록 안내합니다.
5. 커밋은 요청을 받으면 합니다.

## 범위 밖
- PostToolUse 단위 테스트와 PreToolUse TDD 강제: vitest와 로직 코드가 생기는 지도 기능 때 다시 검토합니다.
- CI(GitHub Actions): 배포할 때 추가합니다.
