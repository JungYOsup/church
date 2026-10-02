# 배운 점 (Lessons)

작업 중에 실제로 걸려 넘어진 함정과 해결법을 모은다. 같은 실수를 다음 세션에서 반복하지 않기 위한 기록이다.

- **언제 추가하나:** 예상과 다르게 동작해서 시간을 쓴 일, 문서를 찾아보고서야 알게 된 버전 차이, 규칙이 실제로 막은 일
- **형식:** 한 항목에 상황, 원인, 대응을 적는다. 근거가 된 커밋이나 계획서가 있으면 함께 적는다.
- 같은 함정이 세 번 넘게 반복되면 여기서 끝내지 말고 규칙(CLAUDE.md)이나 hook으로 옮긴다.

## 환경과 도구

### 시스템 기본 Node(18)로는 Next.js 16이 돌지 않는다
- **원인:** Next.js 16은 Node 20.9 이상이 필요하다.
- **대응:** `.nvmrc`에 `22`를 두고 셸마다 `nvm use`를 한다. hook 스크립트(`.claude/hooks/*.sh`, `.husky/pre-commit`)는 별도 셸에서 돌기 때문에 스크립트 안에서 nvm을 직접 불러온다.

### `create-next-app`은 이미 파일이 있는 폴더에서 실행되지 않는다
- **원인:** 허용 목록(`.git`, `.claude`, `docs` 등) 밖의 파일(`CLAUDE.md`, `README.md`, `.harness/`, `.nvmrc`)이 있으면 충돌로 보고 멈춘다.
- **대응:** 임시 폴더에 만든 뒤 필요한 파일만 복사했다 ([세팅 계획](plans/2026-10-01-setup-header-hero.md)).

### TS 데이터 함수는 jiti로 바로 실행해 볼 수 있다
- **상황:** 데이터 계층 task(`getStats()`)는 화면이 없어 lint·build 말고는 동작을 확인할 거리가 없어 보였다.
- **대응:** eslint·tailwind가 설치해 둔 jiti(`node_modules/.bin/jiti`)로 임시 스크립트를 실행해 반환값을 출력했다. 새 의존성은 필요 없다.
- **함정:** `@/` 경로 별칭은 `JITI_ALIAS='{"@":"<프로젝트>/src"}'`처럼 접두어 꼴로 준다. tsconfig처럼 `{"@/*":"…/src/*"}`로 주면 `Cannot find module '@/lib/data/stats'`가 난다([통계 카드 계획](plans/2026-10-02-stat-cards.md)).

### 참고 이미지는 Read 도구로 읽는다
- `~/Downloads`의 참고 이미지는 Bash에서는 sandbox 때문에 `Operation not permitted`가 나지만, Read 도구로는 열린다. 디자인을 비교할 때는 Read로 이미지를 직접 본다.

### macOS 셸에서 생기는 사소한 차이
- zsh에서 `echo =====`는 `=` 확장 때문에 오류가 난다. 구분선은 따옴표로 감싼다.
- macOS에는 `timeout` 명령이 없다. 시간 제한이 필요하면 도구 쪽 타임아웃을 쓴다.

## Next.js 16

### `create-next-app`과 `next dev`가 `AGENTS.md`를 관리한다
- **상황:** `create-next-app`이 `AGENTS.md`와 `CLAUDE.md`(`@AGENTS.md` 한 줄)를 만들고, `next dev`는 `AGENTS.md`의 규칙 블록이 없으면 다시 써 넣는다.
- **대응:** 우리 `CLAUDE.md`는 그대로 두고 첫 줄에서 `@AGENTS.md`를 불러온다. `AGENTS.md`가 있으면 `next dev`는 `CLAUDE.md`를 건드리지 않는다(`node_modules/next/dist/server/lib/generate-agent-files.js`로 확인).

### 학습 데이터와 다른 API
- 이미지 `priority`는 deprecated다. 첫 화면 이미지는 `loading="eager"`와 `fetchPriority="high"`(또는 `preload`)를 쓴다.
- 레이아웃 props 타입은 전역 `LayoutProps<"/">`를 쓴다.
- 이런 차이는 추측하지 말고 `node_modules/next/dist/docs/`에서 먼저 확인한다.

### 개발 서버와 빌드·테스트를 동시에 돌릴 수 있다
- `next dev`는 `.next/dev`, `next build`는 `.next`에 출력해서 함께 돌아도 된다.
- 단, 같은 프로젝트에 `next dev`를 두 번 띄우면 두 번째는 실행되지 않는다(`.next/dev/lock`). 그래서 테스트는 개발 서버를 띄우지 않고 빌드 결과를 3100 포트로 띄운다.

### 개발 서버의 CSS에 새 클래스가 빠질 때가 있다
- **상황:** 오래 떠 있던 `next dev`에서, 새로 만든 파일의 `sm:grid-cols-3`만 CSS에 없어 카드가 한 열로 보였다. 같은 시점의 `npm run build` CSS에는 그 규칙이 있었다. `globals.css`를 `touch`해도 생기지 않았고, 개발 서버를 새로 띄우자 생겼다.
- **대응:** 화면이 코드와 다르면 먼저 브라우저 CSS에 그 규칙이 있는지 보고, 빌드 CSS(`.next/static/chunks/*.css`)와 비교한다. 빌드에만 있으면 코드 문제가 아니므로 개발 서버를 다시 띄운다.
- **항상 생기는 일은 아니다:** 다시 띄운 서버에서는 그 뒤에 만든 새 파일의 클래스가 바로 들어왔다([두 번째 행 계획](plans/2026-10-02-home-church-row.md)).

## Tailwind CSS v4 · shadcn/ui

- **그라데이션:** `bg-gradient-*`는 `bg-linear-*`로 이름이 바뀌었다. 정지점 위치는 `from-25%`처럼 쓴다.
- **한국어 줄바꿈:** 좁은 화면에서 "연결되/는"처럼 단어 중간이 끊긴다. 본문 블록에 `break-keep`(word-break: keep-all)을 준다.
- **나란히 놓인 카드는 위쪽 정렬:** 설명 길이가 카드마다 달라 한 카드만 두 줄로 꺾이면, 카드 내용을 세로 가운데 정렬(`items-center`)했을 때 이름·숫자 높이가 카드마다 어긋난다. `items-start`로 위쪽을 맞춘다(통계 카드).
- **포커스 테두리는 `outline-hidden`:** v4의 `outline-none`은 outline을 아예 없앤다. 강제 색 모드(Windows 고대비)에서는 포커스 ring(box-shadow)도 그려지지 않아 포커스가 보이지 않는다. 직접 만든 포커스 스타일에는 `outline-hidden`을 쓴다(통계 카드 리뷰에서 발견).
- **목록 스타일을 지운 `ul`에는 `role="list"`:** preflight가 `list-style: none`을 주면 Safari VoiceOver가 목록으로 읽지 않는다.
- **연한 accent 색은 대비를 잰다:** `orange-500` 글자는 흰 배경에서 2.89:1로 큰 글자 기준(3:1)에도 못 미쳤다. -600(3.58:1)을 썼다. 색 토큰을 정할 때 흰 카드 위 대비를 함께 확인한다.
- **폰트 변수 이름:** shadcn이 만든 `globals.css`의 `--font-sans: var(--font-sans)`는 자기 참조다. `next/font`의 변수는 `--font-pretendard`처럼 다른 이름으로 만들고 `--font-sans`에서 가져다 쓴다.
- **shadcn 4.21:**
  - `clsx`와 `tailwind-merge` 대신 shadcn이 배포하는 `cn` 패키지를 설치한다(이상한 패키지가 아니다).
  - `init`은 프리셋을 대화형으로 묻는다. 비대화형으로 돌리려면 `-t next -b radix -p nova`처럼 지정한다.

## 테스트 (Playwright)

### 설치된 브라우저와 Playwright 버전이 맞지 않는다
- **원인:** Playwright 1.63은 크롬 rev 1243을 쓰는데, 캐시에는 rev 1228만 있었다.
- **대응:** `channel: "chrome"`으로 설치된 Google Chrome을 써서 약 150MB 다운로드를 피했다. CI를 붙이면 `npx playwright install chrome`이 필요하다.

### 실패를 알기까지 30초가 걸린다
- **원인:** 기본 대기 시간이 30초라, 없는 요소를 찾을 때 30초를 다 기다린다.
- **대응:** 로컬 페이지에 맞게 `actionTimeout: 5_000`으로 줄였다([테스트 계획](plans/2026-10-01-e2e-tests.md)).

### 역할 이름은 기본이 부분 일치다
- **상황:** 아래 행에 "우리 교회 등록**하기**" 버튼을 더하자, 히어로 테스트의 `getByRole("link", { name: "우리 교회 등록" })`가 두 링크를 함께 잡아 `strict mode violation … resolved to 2 elements`로 실패했다.
- **원인:** `name`은 `exact: true`를 주지 않으면 대소문자를 무시한 부분 일치다(`playwright-core/types/types.d.ts`).
- **대응:** 페이지 전체에서 링크·버튼을 찾을 때는 `exact: true`를 주거나, `getByRole("region", …)`으로 범위를 좁힌 뒤 찾는다. 새 문구를 더할 때는 기존 테스트의 이름을 포함하는지 검색한다.

### 테스트 기대값을 앱 코드에서 가져오지 않는다
- 메뉴 목록을 `src/lib/navigation.ts`에서 가져오면, 메뉴 이름을 실수로 바꿔도 테스트가 함께 바뀌어 잡지 못한다. 기대값은 테스트에 직접 적는다. 실제로 "행사"를 "행사안내"로 바꾸자 테스트가 바로 잡아냈다.

## Hook과 하네스

### 권한 규칙은 의도한 것까지 막는다
- `Bash(rm -rf *)` 차단 규칙이 세션 임시 폴더 정리도 막았다. 규칙이 동작한다는 증거이기도 하다. 임시 작업은 지우는 대신 새 폴더 이름을 쓴다.

### Stop hook을 만들 때
- 다시 막을 때는 입력의 `stop_hook_active`가 `true`가 된다. 연속 8번 막히면 Claude Code가 강제로 멈춘다. 재시도에서도 실패하면 막지 말고 경고만 띄운다.
- 같은 이벤트의 hook들은 함께 실행되고, `stop_hook_active`는 어느 hook이 막았든 `true`가 된다. hook마다 "이 상태로 이미 요청했는지"를 상태 파일로 따로 판단한다.
- 질문만 하는 턴까지 느려지지 않도록, 변경 내용의 지문(`git diff HEAD` + 새 파일 해시)을 저장해 두고 바뀌었을 때만 실행한다.

### PreToolUse hook을 만들 때
- `Edit|Write` matcher는 Bash로 쓴 파일(`echo >`, `sed -i`)을 보지 못한다. 테스트 먼저 hook(`require-test-first.sh`)은 그래서 같은 대상 규칙을 `--check` 모드로 열어 두고, Stop hook이 응답 끝에 바뀐 파일을 한 번 더 확인한다. 대상 규칙을 스크립트 하나에 두어야 두 hook이 어긋나지 않는다.
- `.claude/settings.json`에 PreToolUse를 더하자 세션을 다시 시작하지 않아도 바로 반영됐다. 다음 Edit가 실제로 막혔다.
- 시험은 hook에 PreToolUse JSON(`tool_input.file_path`)을 stdin으로 넣고 종료 코드를 비교하는 스크립트로 한다. 진짜 차단 여부는 Edit 도구로 한 번 시도해 본다.

### 셸 문자열에서 변수 뒤에 한글이 붙을 때
- **상황:** `echo "… $DOD가 통과하지 않았습니다"`가 `DOD�: unbound variable`로 실패했다(`set -u`).
- **원인:** bash가 변수 이름 뒤에 붙은 한글의 바이트 일부까지 이름으로 읽었다.
- **대응:** 변수 뒤에 글자가 바로 붙으면 `${DOD}가`처럼 중괄호로 감싼다.

### husky hook 시험
- husky는 hook을 `sh -e`로 실행하므로 같은 방식(`.husky/_/pre-commit`)으로 시험한다.
- 임시 index 파일(`GIT_INDEX_FILE`)을 쓰면 진짜 staging 영역을 건드리지 않고 "이 파일만 커밋하면" 상황을 흉내 낼 수 있다.

## 스킬 만들기와 시험

- **시험 요청은 스킬 예시와 다르게 만든다:** 같으면 스킬이 예시를 베낀 것인지 판단한 것인지 구분할 수 없다.
- **기대 답안을 시험 대상이 못 보게 한다:** `evals/evals.json`이 스킬 폴더 안에 있으면 스킬을 읽는 쪽이 답안까지 볼 수 있다. 시험 지시에 "evals/는 읽지 말라"고 적거나 시험 동안 다른 곳에 둔다.
- **두 조건이 모두 통과하는 기준은 판별력이 없다:** spec-check 첫 시험에서 기준 16개가 스킬 있음·없음 모두 100%였다. 이미 있는 하네스가 잘하는 것을 재고 있었다. 차이가 나는 것(보고 형식, 질문 수, 작은 일에 덧붙인 절차)을 기준으로 삼는다.
- **skill-creator 집계 스크립트 구조:** `eval-<번호>-<이름>/<조건>/run-1/`에 `grading.json`과 `timing.json`을 둔다. 토큰 수는 `grading.json`에 시간 정보가 없을 때만 `timing.json`에서 읽는다.

## 여러 세션이 함께 일할 때

### 다른 세션의 변경은 실제 결과와 맞는지 확인하고 커밋한다
- **상황:** 다른 세션이 남긴 변경(계획서, hook 안내 문구)이 "지도에 작업 흐름 섹션을 추가했다"는 전제로 쓰여 있었다. 그 전제를 믿고 커밋 메시지(`e091fa8`)를 썼는데, 실제 지도에는 섹션이 없었다. 이후 섹션을 만들어 맞췄다.
- **대응:** 다른 세션의 변경을 커밋하기 전에, 그 변경이 말하는 결과(아티팩트, 파일)가 실제로 있는지 확인한다.

### 아티팩트는 게시 전에 최신본을 받는다
- 같은 지도를 여러 세션이 고친다. 로컬 사본은 오래됐을 수 있으므로, 게시 전에 항상 최신본을 read해서 그 위에 고친다.

## 콘텐츠

- **목업 문구를 그대로 믿지 않는다:** 참고 이미지(ChatGPT 목업)의 히브리서 10:24 인용("다른 지체를 돌아보아")은 실제 본문과 달랐다. 성경 구절 같은 사실 정보는 원문(개역개정 "서로 돌아보아 사랑과 선행을 격려하며")으로 확인한다.
- **목업 속 이름도 확인한다:** 목업의 "이재훈 목사"는 실제로 잘 알려진 대형 교회 담임목사와 이름이 같아서, 목데이터에서는 가상 이름(이준혁)으로 바꿨다. 사람·교회 이름은 실존 인물이나 유명 교회와 겹치지 않는지 보고, 겹치면 바꾸거나 위치를 다르게 둔다.
- **배너 사진은 구도부터 본다:** 교회 건물 사진 후보 네 장은 피사체가 가운데에 있거나 세로로 길어서, 왼쪽에 글자를 올리는 넓은 배너에 맞지 않아 뺐다. 피사체가 오른쪽에 있거나 가로로 넓은 풍경(한강·도심)이 맞았다.
