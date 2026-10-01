# 하네스 지도 자동 반영: Stop hook으로 갱신 요청

## Context
- 하네스 지도 아티팩트(https://claude.ai/artifact/925V77bde8aKNrdrCgXHke)는 지금 **사람이 요청할 때만** 갱신됩니다. 실제로 방금 커밋한 Stop hook 작업(7970b5a)이 아직 지도에 없습니다. 지도는 "커밋 5개", VF-04 "해당 없음"이고 hook 파일도 목록에 없습니다.
- 사용자 요청: 변화가 있을 때마다 지도에 자동으로 반영할 것.
- 사용자가 고른 범위: **하네스 파일이 바뀌거나 새 커밋이 생기면** 반영합니다. `src/` 앱 코드는 커밋할 때만 반영합니다.
- 아티팩트 게시는 Claude만 할 수 있어서, hook이 직접 게시할 수는 없습니다. 대신 Stop hook이 변화를 감지하면 응답 종료를 막고 갱신을 요청합니다. DoD hook과 같은 방식으로, "기억하면 갱신"하던 일을 "빼먹을 수 없는 갱신"으로 바꿉니다.

## 확인한 사실
- 기존 Stop hook `.claude/hooks/verify-on-stop.sh`는 `git diff HEAD`와 추적 안 되는 새 파일로 지문을 만들고, 통과한 지문을 `node_modules/.cache/claude-verify/`에 저장합니다. 같은 패턴을 재사용합니다.
- 같은 이벤트의 hook들은 병렬로 실행됩니다. 둘 다 막으면 Claude는 두 이유를 함께 받습니다.
- `stop_hook_active`는 어느 Stop hook이 막았든 true가 됩니다. DoD hook이 먼저 막은 뒤에는 이 hook이 갱신 요청을 못 하게 되므로, 이 값 대신 "이 지문으로 이미 요청했는지"를 상태 파일로 판단합니다.
- 작업 트리는 깨끗하고(7970b5a까지 커밋), 커밋은 6개입니다.
- 감시 경로 중 `.harness/llm-cache.json`, `.harness/runs/`, `.claude/settings.local.json`은 gitignore 대상이라 자동으로 빠집니다.
- 이 작업의 설정 변경은 auto mode 분류기가 "자기 수정"으로 한 번 막았습니다. 이 계획을 승인하면 아래 파일을 고치는 데 동의한 것으로 보고 진행하고, 그래도 막히면 멈추고 알리겠습니다.

## 만들 것

### 1. `.claude/hooks/sync-harness-map.sh` (새 파일, 실행 권한)
- **감시 대상:** `CLAUDE.md AGENTS.md .claude docs .harness .gitignore .nvmrc package.json components.json eslint.config.mjs tsconfig.json`
- **지문:** `git rev-parse HEAD` + 감시 경로의 `git diff HEAD` + 추적 안 되는 새 파일의 shasum. 커밋하면 HEAD가 바뀌므로 `src/` 커밋도 여기서 잡힙니다.
- **상태 파일:** `node_modules/.cache/claude-harness-map/`
  - `synced`: 마지막으로 반영한 지문과 HEAD
  - `requested`: 마지막으로 갱신을 요청한 지문
- **동작:**
  - `--mark-synced` 인자: 현재 지문과 HEAD를 `synced`에 저장하고 끝납니다. Claude가 갱신을 마친 뒤 실행합니다.
  - 현재 지문 = `synced` → 바로 `exit 0`. 질문만 하는 턴은 1초 안에 끝납니다.
  - 현재 지문 = `requested` → 이미 한 번 요청한 상태입니다. 다시 막지 않고 `systemMessage`로 "하네스 지도가 아직 반영되지 않았습니다" 경고만 띄웁니다(무한 반복 방지).
  - 그 밖의 경우 → `requested`에 지문을 저장하고 `exit 2`. stderr로 아래 내용을 Claude에게 넘깁니다.
    - 바뀐 것: 마지막 반영 이후 새 커밋(`git log --oneline <synced HEAD>..HEAD`), 커밋 안 된 하네스 파일 목록
    - 갱신 순서:
      1. Artifact `read`로 지도 최신본을 받고, 저장된 파일을 고칩니다.
      2. 바뀐 내용에 맞게 데이터(`AXES`의 지금·요약, `FILES`, `STEPS`, `TODO`, 상단 기준 시각·커밋 수)를 고친 뒤 같은 `url`로 publish합니다.
      3. 점수와 체크 상태는 진단 결과(`.harness/history.jsonl`)가 바뀔 때만 고칩니다. 임의로 점수를 매기지 않습니다.
      4. `.claude/hooks/sync-harness-map.sh --mark-synced`를 실행합니다.
    - 지도에 드러날 변화가 아니면(오타 수정 등) 게시는 건너뛰고, 이유를 한 줄로 말한 뒤 4번만 합니다.
- **지도 URL**은 스크립트 상단 변수 한 곳에만 둡니다.

### 2. `.claude/settings.json`
기존 `hooks.Stop[0].hooks` 배열에 두 번째 항목을 추가합니다. permissions와 DoD hook은 그대로 둡니다.
```json
{
  "type": "command",
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/sync-harness-map.sh",
  "timeout": 30,
  "statusMessage": "하네스 지도 변경 확인 중"
}
```

### 3. `CLAUDE.md`
Rules에 한 줄을 추가합니다. "하네스 지도(아티팩트 URL)는 하네스 파일이나 커밋이 바뀌면 Stop hook(`.claude/hooks/sync-harness-map.sh`)이 갱신을 요청한다. 점수는 진단 결과가 바뀔 때만 고친다." 갱신 절차는 hook 메시지에만 둬서 중복을 피합니다.

### 4. 기록과 첫 반영
- 이 계획을 `docs/plans/2026-10-01-harness-map-sync.md`로 저장합니다.
- **첫 반영:** 지금까지 지도에 빠진 변화를 반영합니다.
  - 커밋 수 6개, 기준 시각
  - `FILES`에 `.claude/hooks/verify-on-stop.sh`(실행·검증 축)와 `sync-harness-map.sh`(개선 축), 새 계획서 2개 추가
  - EX-01과 VF-04의 "지금"을 "Stop hook이 lint·build 자동 실행 (seed 단계라 VF-04는 채점 제외)"로 수정
  - 검증 축 gaps에서 "검증 hook" 항목 정리
  - 사이클 단계에 Stop hook 커밋 반영
  - 점수는 진단을 다시 돌리지 않았으므로 그대로 둡니다.

## 검증
1. **임시 git 저장소에서 스크립트 시험** (scratchpad에 `git init`, `CLAUDE_PROJECT_DIR`를 그곳으로 지정)
   - 상태 파일 없음 → `exit 2`, stderr에 "처음 반영"과 갱신 순서
   - `--mark-synced` 후 다시 실행 → 출력 없이 즉시 `exit 0`
   - `CLAUDE.md` 수정 → `exit 2`, 바뀐 파일 목록에 `CLAUDE.md`
   - 같은 상태로 한 번 더 → `exit 0` + `systemMessage` 경고 JSON
   - `src/a.ts`만 수정(커밋 안 함) → 막지 않음
   - `src/a.ts` 커밋 → `exit 2`, 새 커밋 목록에 그 커밋
2. **설정 확인:** `jq -e '.hooks.Stop[0].hooks[1].command' .claude/settings.json`
3. **첫 반영:** 아티팩트를 갱신해 게시하고, 다시 read해서 커밋 수와 hook 파일이 보이는지 확인한 뒤 `--mark-synced`를 실행합니다.
4. **실제 동작:** 계획서에 검증 결과를 적는 것은 mark 이후라서, 응답을 끝낼 때 hook이 실제로 갱신을 요청해야 합니다. 요청이 오면 연결이 확인된 것입니다. 이 변경은 지도에 드러날 변화가 아니므로 이유를 말하고 mark만 합니다. 요청이 오지 않으면 `/hooks`를 한 번 열어 설정을 다시 불러오도록 안내합니다.
5. 앱 코드를 바꾸지 않으므로 DoD hook은 건너뜁니다. 커밋은 요청을 받으면 합니다.

## 범위 밖
- 진단(`/harness-doctor:check`)을 자동으로 다시 돌려 점수까지 갱신하는 것: 진단은 시간이 걸리고 LLM 평가가 들어가서 매 응답마다 돌리기에 무겁습니다. 지금처럼 진단은 직접 실행하고, 이력이 바뀌면 이 hook이 점수 반영을 요청합니다.
- 지도 HTML을 저장소에 두는 것: 아티팩트가 원본이고, 매번 최신본을 read해서 고칩니다.

## 검증 결과 (2026-10-01)
- **임시 저장소 시험 8개 통과:** 처음 반영 요청(exit 2), 반영 기록 후 통과(exit 0), CLAUDE.md 수정 시 요청, 같은 상태 재실행 시 경고만, `src/`만 수정하면 통과, `src/` 커밋 시 새 커밋 목록과 함께 요청, 추적 안 되는 `docs/` 새 파일 감지, 변경 없을 때 0.1초.
- **설정:** `jq`로 `hooks.Stop[0].hooks[0]`(DoD)과 `[1]`(지도 반영) 확인.
- **첫 반영:** 지도 Version 4로 게시. 다시 read해서 커밋 6개, `7970b5a` 단계 연결, hook 파일과 새 계획서가 보이는 것을 확인한 뒤 `--mark-synced` 실행.

## 변경 이력
- 2026-10-01: 첫 반영 범위를 줄임. 지도의 live 버전이 16:45에 이미 Stop hook 내용(verify-on-stop.sh, EX-01·VF-04, 4단계 진행 중)을 반영해 두어서, 그 위에 커밋 수·줄 수·새 hook·새 계획서·4단계 커밋만 더함.
