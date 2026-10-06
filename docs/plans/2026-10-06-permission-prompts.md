# 권한 확인을 위험한 작업에만 남기기

## Context
- **왜 하는가:** 사용자가 확인할 필요가 없는 작업까지 확인 창이 뜹니다. 대표자 관리 작업에서는 확인 창이 9번 떴고, 그중 6번은 필요 없었습니다.
  - 필요 없던 것: 임시 스크립트를 지우는 `rm` 5번, staging에서 빼기만 하는 `git reset -- 파일` 1번
  - 의미 있던 것: `git push` 3번
- **기대 결과:** 되돌리기 어렵거나 밖으로 나가는 작업만 확인합니다. 지우면 끝인 재귀 삭제, 작업 내용을 버리는 reset·clean·restore, push, 배포가 그런 작업입니다. 파일 하나 지우기나 unstage 같은 일상 작업은 묻지 않습니다.
- **6축 위치:** 구조(ST-04 권한 경계), 개선(반복된 불편을 설정으로 고침)

## 확인한 사실 (공식 문서 code.claude.com/docs/en/permissions)
- 판정 순서는 deny → ask → allow이고, 먼저 맞는 규칙이 이깁니다. 더 구체적인 allow도 ask를 이기지 못합니다. 그래서 allow 예외를 더하는 방식은 안 되고, ask 규칙 자체를 좁혀야 합니다.
- `*`는 공백을 포함해 아무 글자나 맞습니다.
  - `Bash(git reset *)`는 `git reset -q -- 파일`도 잡습니다.
  - `Bash(rm *)`는 모든 `rm`을 잡습니다.
- `&&`, `;`, `|`로 이은 명령은 명령마다 따로 판정합니다(`cd x && rm y`에서는 `rm y`가 판정 대상).
- 지금 `.claude/settings.json`의 규칙:
  - deny: 강제 push 4개, `rm -rf *`, `rm -fr *`, `.env` 읽기 2개
  - ask: `git push *`, `git reset *`, `git clean *`, `git checkout -- *`, `git restore *`, `git commit *--amend*`, `git commit *--no-verify*`, `rm *`, `vercel *`, `npx vercel *`
- 하네스 진단 ST-04는 "push, rm, 배포, reset, 비밀값 5개 범주 중 3개 이상 보호"입니다. 아래처럼 바꿔도 5개 범주가 모두 보호돼 그대로 통과합니다.

## 바꿀 것 (`.claude/settings.json`의 ask만, deny는 그대로)
| 지금 | 바꾼 뒤 | 이유 |
|---|---|---|
| `Bash(rm *)` | `Bash(rm *-r*)`, `Bash(rm *-R*)`, `Bash(rm *-fr*)`, `Bash(rm *-fR*)` | 파일 하나 지우기는 묻지 않고, 폴더째 지우는 재귀 삭제만 묻습니다. `-rf`·`-fr`은 deny가 먼저 막습니다. 이름에 `-r`이 든 파일(예: `my-report.txt`)도 묻게 되지만, 더 묻는 쪽이라 안전합니다 |
| `Bash(git reset *)` | `Bash(git reset *--hard*)`, `Bash(git reset *--merge*)` | 작업 내용을 버리는 reset만 묻습니다. unstage(`git reset -- 파일`)와 soft·mixed reset은 묻지 않습니다 |
- **그대로 둠:**
  - `git push`: 밖으로 나가는 일
  - `git clean`, `git checkout --`: 작업 내용을 버림
  - `git restore`: `--staged`만 따로 풀 수 없어 둠. 거의 쓰지 않음
  - `--amend`, `--no-verify`: CLAUDE.md 규칙
  - 배포(`vercel`)
  - deny 전부. `rm -rf` 차단은 사용자가 유지하기로 함
- **작업 방식도 함께 바꿈:** 화면 확인용 임시 스크립트는 scratchpad에만 두고, 프로젝트 폴더에서 `node --input-type=module < 스크립트`로 실행합니다. 표준 입력으로 넘기면 프로젝트의 `node_modules`에서 모듈을 찾습니다(2026-10-06 확인). 프로젝트 폴더에 임시 파일을 만들지 않습니다.

## Tasks
- [x] **T1. ask 규칙 좁히기**
  - 파일: `.claude/settings.json`
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음. 권한 판정은 Claude Code가 하고, 저장소에서 돌릴 자동 테스트가 없습니다.
  - 확인(동작 증거):
    - `node -e 'JSON.parse(require("fs").readFileSync(".claude/settings.json"))'`가 오류 없이 끝납니다.
    - `git diff .claude/settings.json`에 위 표의 두 줄만 바뀌어 있습니다.
    - scratchpad의 임시 파일 하나를 `rm`으로 지울 때 확인 창이 뜨지 않습니다(사용자 화면으로 확인).
    - 재귀 삭제와 `git reset --hard`는 시험하지 않습니다. 시험하면 사용자에게 확인 창을 띄우게 되기 때문입니다. 대신 규칙 문자열을 문서의 맞추기 규칙과 대조합니다.
  - 증거:
    - `jq -e '.permissions.ask' .claude/settings.json` → 성공(JSON 정상)
    - `git diff .claude/settings.json`: ask에서 `git reset *`가 `git reset *--hard*`·`git reset *--merge*`로, `rm *`가 `rm *-r*`·`rm *-R*`·`rm *-fr*`·`rm *-fR*`로 바뀐 것만 있습니다. deny와 hooks는 그대로입니다.
    - scratchpad에 `perm-check.txt`를 만들고 `rm`으로 지웠습니다. 명령은 실행됐고 파일이 없어졌습니다(`No such file or directory`). 확인 창이 떴는지는 사용자 화면으로 확인합니다.
    - 규칙 대조: scratchpad 경로(`.../-Users-anderson-Documents-claudeProject-church/2b8bd21b-…`)에는 `-r`, `-R`, `-fr`, `-fR`이 없어, 그 안의 파일 하나를 지우는 `rm`은 새 ask 규칙에 맞지 않습니다.
- [x] **T2. 기록**
  - 파일: `docs/lessons.md`, `docs/plans/2026-10-06-permission-prompts.md`(이 계획서), 메모리(feedback 1개와 `MEMORY.md` 한 줄)
  - 의존: T1
  - 테스트 먼저(red): 해당 없음. 문서만 바꿉니다.
  - 확인(동작 증거):
    - 배운 점 "권한 규칙은 의도한 것까지 막는다"에 세 가지를 더했습니다.
      - 판정 순서(ask가 allow를 이김)
      - ask를 좁힌 내용
      - 임시 스크립트는 scratchpad에서 표준 입력으로 실행
    - 메모리에 다음을 남겼습니다. **Why:** 사용자가 불편을 말함. **How to apply:** 새 확인 규칙이나 질문을 더하기 전에 위험한 일인지 따짐.
      - "사용자가 확인할 필요 없는 것까지 확인받지 않는다"
      - "임시 파일은 프로젝트 밖에"
    - 하네스 지도의 할 일 "rm -rf 차단 규칙 유지 여부 결정"은 "유지, 대신 ask를 좁힘"으로 고칩니다. Stop hook이 갱신을 요청하면 반영합니다.
  - 증거:
    - `docs/lessons.md` "권한 규칙은 의도한 것까지 막는다"에 "확인이 필요 없는 일까지 묻지 않는다"를 더했습니다. 상황, 원인(판정 순서), 대응(좁힌 규칙), 임시 스크립트 실행법이 들어 있습니다.
    - 메모리 `no-unneeded-confirmations.md`와 `MEMORY.md` 한 줄

## 검증
- `npm run lint && npm run build`는 앱 코드를 바꾸지 않아 필요 없습니다. 바꾸는 것은 `.claude/settings.json`과 문서뿐입니다.
- 커밋은 사용자가 요청할 때 합니다. 문서와 설정만 바뀌므로 pre-commit은 테스트를 건너뜁니다.

## 변경 이력
<!-- 계획과 달라진 점을 날짜·내용·이유로 적는다 -->
- 없음

## 범위 밖
- deny 규칙 변경(`rm -rf` 차단 유지)
- PreToolUse hook으로 rm 플래그를 정밀하게 검사하는 일(규칙 4줄로 충분하다고 봄)
- e2e 흔들림 대응과 교회 상세 페이지(다음 작업)
