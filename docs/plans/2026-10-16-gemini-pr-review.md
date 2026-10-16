# PR마다 Gemini 자동 리뷰 + PR로 합치는 흐름

## Context
- **왜 하는가:** PR을 열면 AI가 자동으로 리뷰해 코멘트를 달게 하고 싶다. GPT 쪽은 API가 따로 과금되고(Plus와 별개), GitHub Models는 2026-07-30에 종료됐다. 그래서 GitHub Actions에서 무료로 돌릴 수 있는 Gemini(`google-github-actions/run-gemini-cli`, AI Studio 무료 티어)를 쓴다. 지금은 PR 없이 로컬에서 `--no-ff` merge를 하므로 리뷰가 돌 자리가 없다. 그래서 작업을 PR로 합치는 흐름으로 바꾼다.
- **spec:**
  - 무엇을: PR을 열면 Gemini가 `CLAUDE.md` 규칙을 기준으로 한국어 요약과 줄별 코멘트를 단다. 다시 받고 싶으면 `@gemini-cli /review` 댓글을 단다. 모든 작업은 PR로 합친다
  - 어디서: GitHub Actions, 개발 규칙(`CLAUDE.md`, 권한)
  - 완료 조건:
    - 시험 PR에 한국어 리뷰(요약 + 줄별)가 달린다
    - 프로젝트 규칙 위반을 지적한다
    - merge 뒤 댓글로 다시 요청하면 리뷰가 다시 돈다
    - 기존 CI는 초록이다
- **6축 위치:**
  - 검증: VF-05 평가자 분리(PR마다 독립 리뷰), VF-06 격리(PR 흐름)
  - 실행: merge 절차

## 확인한 사실
- **공식 예시** (`run-gemini-cli` main의 `examples/workflows/`):
  - 워크플로가 두 개예요. `gemini-dispatch.yml`이 트리거를 받아 명령을 나누고, `gemini-review.yml`(`workflow_call`)이 리뷰를 해요.
  - dispatch에는 issue triage, invoke, plan-execute 경로도 들어 있어요. 리뷰만 쓰려면 이 경로들을 지워야 해요(README의 Note).
  - fork에서 온 PR은 돌리지 않아요. 댓글 명령은 OWNER/MEMBER/COLLABORATOR만 쓸 수 있어요.
  - PR이 열리면 "요청 받음" 코멘트를 먼저 달고, 실패하면 fallthrough가 실패 코멘트를 달아요.
- **인증:** `GEMINI_API_KEY` secret만 있으면 돼요. GitHub App(`vars.APP_ID`)은 선택이고, 없으면 `GITHUB_TOKEN`을 써요. 리뷰는 docker로 띄운 github-mcp-server(`v0.27.0`) 도구로 올려요.
- **리뷰 확장** (`gemini-cli-extensions/code-review`의 `pr-code-review.toml`, `code-review-commons` 스킬):
  - 줄별 코멘트를 `[SEVERITY]`로 달고, 요약은 "📋 Review Summary / 🔍 General Feedback" 형식이에요.
  - 리뷰는 반드시 "COMMENT"로 제출해요. 승인하거나 변경 요청을 하지 않아서 merge를 막지 않아요.
  - 언어를 정하는 설정은 없어요.
- **Gemini는 저장소 파일을 직접 읽지 못해요.** 예시 설정이 `"tools": {"core": []}`예요. 그래서 판단 근거는 MCP로 받은 diff와 PR 정보, 그리고 시작할 때 읽는 `GEMINI.md`가 전부예요.
- **`GEMINI.md` 불러오기** (gemini-cli 문서 `gemini-md.md`, `memport.md`):
  - `@./파일.md`로 다른 파일을 불러올 수 있고, 불러온 파일 안의 불러오기도 따라가요.
  - `CLAUDE.md`의 `@`는 첫 줄 `@AGENTS.md` 하나뿐이라 충돌이 없어요.
  - 예시가 `GEMINI_CLI_TRUST_WORKSPACE: true`를 둬서, 체크아웃한 폴더를 믿고 읽어요.
- **모델** (ai.google.dev 모델·가격 문서):
  - 무료 티어가 있는 안정 모델은 `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite` 등이에요.
  - 2.5 모델은 "예전에 써 본 사용자에게만" 열려 있어, 새 키로는 쓸 수 없어요.
  - 무료 티어는 입력을 제품 개선에 써요. 공개 저장소라 괜찮아요.
  - 한도는 문서 표에 없고 AI Studio의 Rate Limit 화면에서만 보여요. 한도는 프로젝트 단위로 적용돼요.
- **이벤트별 워크플로 출처** (GitHub 동작):
  - `pull_request`는 PR의 merge ref에 있는 워크플로로 돌아요. 그래서 워크플로를 더하는 PR 자체가 첫 시험이 돼요.
  - `issue_comment`는 기본 branch(master)의 워크플로로 돌아요. 그래서 댓글 재요청은 merge한 뒤에 시험해요.
- **저장소 설정** (`gh repo view`, `gh api …/actions/permissions/workflow`):
  - merge commit이 켜져 있어요.
  - `default_workflow_permissions: read`예요. job에 적은 권한은 그대로 받아요.
  - push는 SSH(`git@github.com`)라서 워크플로 파일 push에 토큰 scope가 필요 없어요.
- **권한 규칙** (`.claude/settings.json`): `git push *`는 ask예요. `gh pr merge`는 규칙이 없어서 묻지 않고 실행돼요. PR 흐름에서는 merge가 곧 master 운영 배포예요.
- **워크트리** (`docs/lessons.md` "워크트리로 나눠 일할 때"):
  - 다른 세션이 같은 폴더에서 `pre-commit-code-review`를 진행 중이에요(`.husky/code-review.sh`가 생겼어요). 같은 폴더에서 branch를 바꾸면 그 세션도 함께 바뀌어요.
  - 그래서 `git worktree add -b <branch> ../church-<이름> master`로 저장소 옆에 만들어요.
  - hook은 원래 폴더를 봐요.
  - e2e 포트 3100은 모든 폴더가 같이 써요.
  - Node는 경로를 글자 그대로 적어요(`env PATH=/Users/anderson/.nvm/versions/node/v22.14.0/bin:/usr/bin:/bin npm …`).
- **pre-commit:** `APP_FILES`(`src/`, `e2e/`, 설정 파일)가 바뀐 커밋만 lint와 테스트를 돌려요. `.github/`, `GEMINI.md`, `CLAUDE.md`, `.claude/`, `docs/`만 바뀐 커밋은 건너뛰어요.
- **조사로 바뀐 점:**
  - 모델을 2.5에서 3.8 Flash로 바꿨어요.
  - `GEMINI.md`에 규칙을 옮겨 적지 않고 `CLAUDE.md`를 불러오기로 했어요.
  - `.gitignore`의 `.gemini/` 추가는 뺐어요. CI는 커밋하지 않고, 로컬에서 Gemini CLI를 쓰지 않아요.

## 결정
- **질문과 답:**
  - 방식: Gemini(`run-gemini-cli`, 무료)
  - 실행 시점: PR을 열 때. 다시 받을 때는 `@gemini-cli /review` 댓글
  - 코멘트: 공식 기본(요약 + 줄별)
  - 흐름: 모든 작업을 PR로 합침
  - 10/08 `CLAUDE.md` 변경은 먼저 따로 커밋해 master에 합치고 push함(`4a3d530`)
- **정한 것:**
  - **공식 예시를 최소한만 고쳐요.** upstream과 비교하기 쉽게 하기 위해서예요.
    - dispatch: `issues` 트리거, triage·invoke·plan-execute job, 명령 추출의 triage·approve·invoke 분기를 지워요. 나머지 `@gemini-cli` 댓글은 fallthrough로 보내요.
    - review: `gemini_model`에 기본값 `${{ vars.GEMINI_MODEL || 'gemini-3.8-flash' }}`만 더해요. 모델 선택이 저장소에 보이게 하고, 변수로 바꿀 수 있게 남겨요.
    - "요청 받음" 코멘트, GitHub App 분기, 버전 고정 방식(`@v0`, SHA)은 예시 그대로 둬요.
  - **`GEMINI.md`:** 리뷰 지침 몇 줄과 `@./CLAUDE.md` 불러오기만 둬요.
    - 리뷰는 한국어로 써요.
    - `CLAUDE.md`의 Rules와 Architecture(데이터 계층, 짝 테스트, 범위)를 위반 판단 기준으로 써요.
    - `CLAUDE.md`에 적힌 Claude용 작업 절차(스킬·hook 사용법)는 리뷰 대상이 아니라고 적어요.
    - lint와 테스트는 CI가 하니 그쪽 지적은 하지 않게 해요.
  - **merge 방식:** merge commit을 유지해요(squash·rebase는 쓰지 않아요). 메시지는 `gh pr merge <번호> --merge --subject "Merge branch '<branch>' (#<번호>): <요약>"`로, 지금 형식에 PR 번호만 더해요.
  - **`gh pr merge *`를 ask에 추가해요.** `git push`처럼 운영 배포가 되는 동작이라서예요.
  - **merge 전에 확인할 것:** PR의 CI가 초록인지, Gemini 지적을 반영했는지 또는 이유를 답글로 남겼는지를 `CLAUDE.md`에 한 구절로 적어요.
  - **`ci.yml`은 그대로 둬요.** PR branch에서 push와 PR 이벤트로 두 번 돌지만, 공개 저장소라 비용이 없어요.
  - **README도 그대로 둬요.** 기존 문장이 틀려지지 않아요.
  - **작업은 워크트리 `../church-gemini-review`에서 해요.** branch는 `chore/gemini-pr-review`예요.
  - **커밋·push·PR·merge가 계획에 들어 있어요.** T4~T6은 동작을 확인하려고 커밋, push, PR, merge를 해요. 이 계획의 승인을 그 요청으로 봐요. push와 merge는 ask 규칙으로 실행 직전에 한 번 더 승인받아요.

## Tasks
- [x] **T1. 워크트리와 Gemini 워크플로, GEMINI.md**
  - 파일: `.github/workflows/gemini-dispatch.yml`, `.github/workflows/gemini-review.yml`, `GEMINI.md`, `docs/plans/2026-10-16-gemini-pr-review.md`
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음. GitHub 이벤트로만 도는 설정이라 로컬에서 돌릴 테스트가 없어요. 동작은 T4의 실제 PR에서 확인해요.
  - 확인(동작 증거):
    - 워크트리를 만들고 계획서를 저장해요.
    - 예시 원본을 받아 위의 최소 수정만 해요.
    - `ruby -ryaml -e 'YAML.load_file(ARGV[0])'`로 두 파일 모두 읽혀요.
    - upstream 원본과 `diff`를 떠서, 지운 job·트리거·분기와 모델 기본값 말고는 차이가 없어요.
    - `grep -E '^  [a-z-]+:$'`로 dispatch의 job이 `debugger`, `dispatch`, `review`, `fallthrough`뿐이에요.
    - `GEMINI.md`의 `@./CLAUDE.md`가 가리키는 파일이 있어요.
  - 결과 (10/16):
    - 워크트리 `../church-gemini-review`(`chore/gemini-pr-review`, `4a3d530`에서 갈라짐)를 만들었어요. 원본은 upstream main `387c8dd`(2026-08-21)예요.
    - YAML: 두 파일 모두 `YAML ok`였어요.
    - dispatch 구성:
      - `jobs: debugger, dispatch, review, fallthrough`
      - `triggers: pull_request_review_comment, pull_request_review, pull_request, issue_comment`
      - `fallthrough needs: dispatch, review`
    - review의 모델 값은 `${{ vars.GEMINI_MODEL || 'gemini-3.8-flash' }}`예요.
    - upstream과 `diff`:
      - dispatch는 머리 주석 4줄 추가와 `issues` 트리거, issue 조건, triage·approve·invoke 분기, job 3개 삭제뿐이에요.
      - review는 머리 주석 4줄과 `gemini_model` 1줄뿐이에요.
    - `GEMINI.md` 12행 `@./CLAUDE.md`가 가리키는 파일이 있고, `CLAUDE.md` 첫 줄 `@AGENTS.md`도 있어요.
    - lint와 build는 해당 없음이에요. 앱 코드가 바뀌지 않았고, PR의 CI가 돌려요.
- [x] **T2. 규칙과 권한: PR로 합치는 흐름**
  - 파일: `CLAUDE.md`, `.claude/settings.json`
  - 의존: T1
  - 테스트 먼저(red): 해당 없음. 문서와 권한 설정이에요. ask가 실제로 걸리는지는 T6 merge에서 봐요.
  - 확인(동작 증거):
    - `jq '.permissions.ask | index("Bash(gh pr merge *)")' .claude/settings.json`이 숫자를 내요. 파일이 JSON으로 읽힌다는 뜻이에요.
    - `CLAUDE.md` 커밋 규칙에 다음이 들어 있어요: branch → PR → `gh pr merge --merge --subject` 형식, merge 전 CI 초록과 Gemini 지적 확인, merge는 곧 운영 배포.
    - Architecture에 `gemini-*.yml`과 `GEMINI.md` 줄이 있어요.
    - `grep -n "no-ff" CLAUDE.md`가 아무것도 찾지 않아요.
  - 결과 (10/16):
    - `jq … index("Bash(gh pr merge *)")`가 `1`을 냈어요(`git push *` 바로 다음).
    - `grep -n "no-ff" CLAUDE.md`는 결과가 없어요.
    - `CLAUDE.md` 54~56행 Architecture에 `gemini-*.yml` 줄이 들어갔어요.
    - 85~88행 커밋 규칙이 PR 흐름으로 바뀌었어요: `gh pr create`, Gemini 리뷰, merge 전 CI와 지적 확인, `gh pr merge … --merge --subject`, merge는 곧 운영 배포.
    - 97줄이에요.
- [x] **T3. Gemini API 키 등록 (사용자)**
  - 파일: 없음
  - 의존: T1
  - 테스트 먼저(red): 해당 없음. 외부 설정이에요.
  - 확인(동작 증거):
    - 사용자가 Google AI Studio에서 키를 발급해요. 결제를 켜지 않은 프로젝트로 받아요.
    - 사용자가 `! gh secret set GEMINI_API_KEY`로 넣어요.
    - `gh secret list`에 `GEMINI_API_KEY`가 보여요.
    - 사용자가 AI Studio Rate Limit 화면에서 `gemini-3.8-flash`의 무료 한도가 0이 아닌지 봐요.
  - 결과 (10/16):
    - 등록 전 `gh secret list`는 비어 있었어요. 사용자가 별도 터미널에서 넣은 뒤 `GEMINI_API_KEY	2026-10-16T02:43:26Z`가 보여요.
    - 한도 화면을 확인했다는 말은 따로 없어서, T4 첫 실행 결과로 확인해요.
- [ ] **T4. 첫 PR: 이 작업 자체를 Gemini가 리뷰하고, 새 흐름으로 merge**
  - 파일: 없음 (T1·T2 커밋)
  - 의존: T2, T3
  - 테스트 먼저(red): 해당 없음. 이 PR이 워크플로를 처음 들여오는 PR이라, 들여오기 전 상태는 "PR 0개, Gemini 실행 기록 없음"(`gh run list --workflow gemini-dispatch.yml`이 빔)으로 기록해 둬요.
  - 확인(동작 증거):
    - `chore: …`로 커밋해요. push는 ask로 승인받아요.
    - `gh pr create`로 PR을 열어요.
    - `gh run list --workflow gemini-dispatch.yml`이 success예요.
    - PR에 github-actions가 쓴 리뷰가 있고, 요약이 `📋 Review Summary` 형식의 한국어예요(`gh pr view <번호> --comments`, `gh api …/pulls/<번호>/reviews`).
    - 같은 PR의 CI가 success예요.
    - 지적이 있으면 반영하거나 이유를 답글로 남겨요.
    - `gh pr merge <번호> --merge --subject "Merge branch 'chore/gemini-pr-review' (#<번호>): …"`로 합쳐요. `git log origin/master --oneline -1`이 그 제목이고, parent가 2개예요.
    - 원래 폴더 master를 `--ff-only`로 받아요(아래 리스크 참고).
- [ ] **T5. 시험 PR: 규칙 위반을 잡는지, 댓글 재요청이 되는지**
  - 파일: `src/components/home/MapPreview.tsx` (시험 branch에서만 바꾸고 merge하지 않음)
  - 의존: T4
  - 테스트 먼저(red): 해당 없음. 이 task 자체가 일부러 깨뜨리는 시험이에요.
  - 확인(동작 증거):
    - **준비:** 워크트리에서 `origin/master`로부터 `chore/gemini-review-trial`을 만들고 `npm ci`를 해요(Node 경로는 글자 그대로).
    - **심을 위반:** `getChurches()`(`@/lib/data/churches`) 대신 `mockChurches`(`@/lib/mock/churches`)를 직접 import해 써요. 지역 없이 부른 `getChurches()`는 `filterByRegion(mockChurches, null)`이라 동작은 같아서 lint와 테스트는 통과하지만 `CLAUDE.md` 규칙 위반이에요.
    - **커밋:** pre-commit의 lint와 테스트를 통과해요. 3100 포트가 비었는지 먼저 확인해요.
    - **첫 리뷰:** PR을 열면 그 import 줄에 데이터 계층 규칙을 짚는 한국어 줄별 코멘트가 달려요. `GEMINI.md`와 `CLAUDE.md`가 실제로 읽혔다는 증거예요.
    - **댓글 재요청:** `@gemini-cli /review 보안 위주로` 댓글을 달면 `issue_comment` 실행이 success이고 리뷰가 하나 더 달려요.
    - **정리:** PR을 merge 없이 닫고(`gh pr close <번호> --delete-branch`) 로컬 branch도 지워요.
- [ ] **T6. 배운 점과 계획 결과 기록 (새 흐름의 두 번째 PR)**
  - 파일: `docs/lessons.md`, `docs/plans/2026-10-16-gemini-pr-review.md`
  - 의존: T5
  - 테스트 먼저(red): 해당 없음. 문서예요.
  - 확인(동작 증거):
    - `docs/lessons.md`에 이번 함정을 적어요: 2.5 모델 접근 제한, `tools.core: []`라 diff와 `GEMINI.md`만 근거, 이벤트별 워크플로 출처, 그 밖에 실행 중 만난 것.
    - 계획서에 변경 이력과 검증 결과를 적어요.
    - `docs/` branch로 PR을 열면 Gemini 리뷰가 달려요.
    - `gh pr merge`가 ask 확인 창을 띄워요. T2의 권한이 원래 폴더에 들어간 뒤의 증거예요.
    - merge한 뒤 워크트리와 branch를 정리하고, 원래 폴더 master를 받아요.
    - Stop hook이 하네스 지도 갱신을 요청하면 따라요.

## 리스크와 멈출 조건
- **무료 한도나 모델 접근 실패 (429, 404):** 실행 로그로 원인을 확인해요. 그다음 `gemini-3.6-flash`, 이어서 `gemini-3.5-flash-lite`로 바꿔 다시 돌리고 변경 이력에 적어요. 무료로 쓸 수 있는 모델이 없으면 멈추고 보고해요.
- **리뷰를 올리지 못함:** 확장 프롬프트의 도구 이름(`create_pending_pull_request_review`)과 MCP `includeTools`(`pull_request_review_write`)가 다르게 적혀 있어요. 실패하면 fallthrough 코멘트와 로그로 원인을 보고, 예시를 크게 고쳐야 하면 멈추고 물어요.
- **한국어로 안 나오거나 규칙 위반을 못 잡음:** `GEMINI.md` 지침을 한 번 다듬어 다시 시험해요. 그래도 안 되면 결과를 보고하고 물어요. 막는 관문이 아니라 조언용이라 실패해도 merge에는 영향이 없어요.
- **원래 폴더를 받을 수 없음:** 다른 세션이 `CLAUDE.md`를 커밋 안 한 채 고쳤거나 다른 branch에 있으면, `git merge --ff-only`가 거부되거나 settings가 적용되지 않아요. 그 세션의 변경은 건드리지 않고 상황을 보고해요(stash·reset 하지 않음).
- **e2e 포트 3100 충돌 (T5 커밋):** `lsof -iTCP:3100 -sTCP:LISTEN`으로 확인하고 빌 때까지 기다려요.
- 계획 밖 결정(범위·데이터 구조 변경, 새 의존성, 되돌리기 어려운 작업)이 필요해지면 다음 task로 넘어가지 않고 사용자에게 물어요.

## 검증
- **전체 완료 조건:**
  - 앱 코드가 바뀌지 않아요. 각 PR의 CI(lint → 단위 → e2e)가 초록이고, T5 커밋의 pre-commit이 통과해요.
  - Gemini 실행 기록 세 번(PR 열기 2번, 댓글 1번)이 모두 success예요.
  - master CI가 초록이에요(`gh run list`).
- **화면 확인:** 해당 없음. 화면 변경이 없어요.
- **일부러 깨뜨려 보기:** T5의 데이터 계층 규칙 위반이 그 역할이에요. 시험 PR은 merge하지 않고 닫아서 원래 상태에 남는 것이 없어요.

## 범위 밖
- 이슈 분류(triage), 일반 호출(invoke), plan-execute 같은 Gemini의 다른 기능
- push할 때마다 다시 리뷰하기(`synchronize`), fork PR 지원
- 브랜치 보호(CI나 리뷰를 merge 조건으로 걸기), GitHub App 인증
- `ci.yml`의 중복 실행 정리, README 수정
- 다른 세션의 `pre-commit-code-review` 작업과 `ai-readiness-*` 파일

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다. 리뷰에서 반영하지 않은 지적은 이유와 함께 적는다 -->
