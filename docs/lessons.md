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

### Unsplash 사진 찾기와 받기
- **상황:** 검색용 JSON(`unsplash.com/napi/search/photos`)은 401, 검색 페이지 HTML을 curl로 받으면 봇 차단(401·307)이 났다.
- **대응:**
  - 검색 페이지(`/s/photos/<검색어>?license=free`)는 WebFetch로 읽어 사진 id·작가·Unsplash+ 여부를 얻는다.
  - 받을 때는 `https://unsplash.com/photos/<id>/download?force=true&w=960`이 이미지 주소로 넘어가는 것(302)을 쓴다. 그 주소의 `q=85`를 `q=80`으로 바꿔 받는다.
- **후보 비교:** 이 컴퓨터에는 ImageMagick·PIL이 없다. 후보를 작게 받아 HTML 한 장에 16:9로 잘라 놓고, 설치된 Playwright로 찍어 Read로 한 번에 본다([세 번째 행 계획](plans/2026-10-02-home-third-row.md) T3).

## Next.js 16

### `create-next-app`과 `next dev`가 `AGENTS.md`를 관리한다
- **상황:** `create-next-app`이 `AGENTS.md`와 `CLAUDE.md`(`@AGENTS.md` 한 줄)를 만들고, `next dev`는 `AGENTS.md`의 규칙 블록이 없으면 다시 써 넣는다.
- **대응:** 우리 `CLAUDE.md`는 그대로 두고 첫 줄에서 `@AGENTS.md`를 불러온다. `AGENTS.md`가 있으면 `next dev`는 `CLAUDE.md`를 건드리지 않는다(`node_modules/next/dist/server/lib/generate-agent-files.js`로 확인).

### 학습 데이터와 다른 API
- 이미지 `priority`는 deprecated다. 첫 화면 이미지는 `loading="eager"`와 `fetchPriority="high"`(또는 `preload`)를 쓴다.
- 레이아웃 props 타입은 전역 `LayoutProps<"/">`를 쓴다.
- 새 동적 경로의 `PageProps<"/churches/[id]">`는 빌드 전 `npx tsc --noEmit`에서 `does not satisfy the constraint 'AppRoutes'`로 실패한다. 경로 타입은 Next가 빌드(또는 개발 서버) 때 다시 만든다. `npm run build`는 그 뒤 타입 검사를 하므로 통과하고, 빌드 뒤에는 `tsc`도 통과한다.
- 이런 차이는 추측하지 말고 `node_modules/next/dist/docs/`에서 먼저 확인한다.

### `<form action>`은 처리 뒤 입력을 비운다(React 19)
- **상황:** 1단계 신청 폼은 입력을 검사해 오류를 보여 주고 저장하지 않는다. Next 문서의 꼴(`useActionState` + `<form action>`)을 그대로 쓰면, 검사에 걸렸을 때 사용자가 쓴 내용이 지워진다.
- **원인:** `<form action={fn}>`으로 내면 React가 transition 안에서 `requestFormReset`을 불러 비제어 입력을 비운다(`react-dom-client.development.js`의 `startHostTransition`, React 19.2.8).
- **대응:** 1단계는 `onSubmit`에서 `preventDefault()` 뒤 `FormData`를 읽는다. 2단계에서 Server Action으로 바꿀 때는 오류 상태에 입력값을 함께 돌려주고 `defaultValue`로 다시 채우거나, 제어 입력을 쓴다.

### 검색어에 따라 바뀌는 탭 제목은 기본 미리 불러오기에서 어긋난다
- **상황:** 행사 페이지에서 고른 태그를 `generateMetadata`로 탭 제목에 넣었다("연합 태그 행사"). 주소로 바로 들어오면 맞았다. 그런데 칩을 눌러 이동하면 다른 태그("찬양 태그 행사")나 "행사"의 제목이 남았다.
- **원인:** `Link`의 기본(static) 미리 불러오기는 page 칸과 metadata 칸을 검색어 없이 한 칸(`Fallback`)으로 담는다. 검색어별로 나누는 것은 `prefetch={true}`(Full) 같은 runtime 미리 불러오기뿐이다(`next/dist/client/components/segment-cache/vary-path.js`의 `getSegmentVaryPathForRequest`).
  - 그래서 `/events?tag=연합`, `다음세대`, `찬양`을 미리 불러오면 마지막에 받은 head가 이동한 화면의 제목이 되었다.
  - 칩에 `prefetch={false}`를 줘도, 위쪽 메뉴의 `/events` 링크가 같은 칸을 채웠다.
- **대응:** 탭 제목은 경로마다 고정하고, 바뀐 결과는 페이지 안의 `role="status"` 문구로 알린다. 그 요소가 이동 뒤에도 같은 DOM 노드인지 확인했다(새로 끼워지는 알림 영역은 읽히지 않을 수 있다).
- **다른 길:** 칩마다 `prefetch={true}`를 주면 검색어별로 담긴다. 다만 화면의 칩마다(16개) 요청 시점 렌더링을 미리 하게 되므로 쓰지 않았고, 시험하지도 않았다. 검색어에 따른 제목이 꼭 필요한 페이지라면 이 비용과 함께 검토한다.
- **함정:** 개발 서버는 미리 불러오지 않으므로 재현되지 않는다. 프로덕션 빌드(`next start`)에서 요청과 `document.title`을 함께 기록해 확인한다([행사 페이지 계획](plans/2026-10-03-events-page.md) T4).

### 검색어만 바뀌는 이동도 페이지를 새로 그린다
- **상황:** 검색 페이지(`/search?q=`)의 입력칸은 비제어(`defaultValue`)다. `/search?q=서연`에서 헤더 검색 링크로 `/search`에 오면 옛 검색어가 남을 것 같아 입력칸에 `key={q}`를 줬다.
- **확인:** `key`를 빼고 "다시 오면 입력칸이 비어 있다" e2e를 돌려도 통과했다. App Router는 검색어가 다른 주소를 다른 페이지 칸으로 보고 새로 그리므로, `defaultValue`가 다시 들어간다. 그래서 `key`를 지웠다.
- **자동 포커스도 된다:** 클라이언트 이동 뒤 `autoFocus` 입력칸에 실제로 포커스가 갔다(e2e `toBeFocused`). `layout-router.js`에 이동 뒤 `domNode.focus()`를 부르는 옛 코드가 남아 있어 의심했지만, Next 16.2에서는 포커스를 빼앗지 않았다([헤더 버튼 계획](plans/2026-10-06-header-actions.md) T4).

### 개발 서버와 빌드·테스트를 동시에 돌릴 수 있다
- `next dev`는 `.next/dev`, `next build`는 `.next`에 출력해서 함께 돌아도 된다. 다만 e2e가 100개를 넘은 뒤로는 개발 서버를 켠 채 `npm run test`를 돌리면 부하로 클릭이 흔들린다(아래 "부하가 크면" 항목). 화면 확인과 테스트는 번갈아 한다.
- 단, 같은 프로젝트에 `next dev`를 두 번 띄우면 두 번째는 실행되지 않는다(`.next/dev/lock`). 그래서 테스트는 개발 서버를 띄우지 않고 빌드 결과를 3100 포트로 띄운다.
- **`next start`는 빌드와 함께 돌 수 없다:** `next start`는 `.next`를 읽는다. 그동안 `npm run build`나 `npm run test`(안에서 빌드함)가 `.next`를 다시 만들면, 떠 있던 서버가 내려준 HTML의 chunk 이름이 사라져 `/_next/static/chunks/*`가 404·500이 된다. 3000에 다른 세션이 띄운 `npm run start`가 있어 이렇게 깨졌다. 그래서 화면 확인은 다른 포트의 `next dev`(`npx next dev -p 3001`)로 했다([공지 페이지 계획](plans/2026-10-03-notices-page.md) T4).
  - 화면이 이상하면 먼저 그 포트에 무엇이 떠 있는지 본다(`lsof -iTCP:3000 -sTCP:LISTEN`, `ps -o command -p <PID>`). `next-server`라고만 나와도 부모 프로세스가 `npm run start`이면 프로덕션 서버다.

### 개발 서버의 CSS에 새 클래스가 빠질 때가 있다
- **상황:** 오래 떠 있던 `next dev`에서, 새로 만든 파일의 `sm:grid-cols-3`만 CSS에 없어 카드가 한 열로 보였다. 같은 시점의 `npm run build` CSS에는 그 규칙이 있었다. `globals.css`를 `touch`해도 생기지 않았고, 개발 서버를 새로 띄우자 생겼다.
- **대응:** 화면이 코드와 다르면 먼저 브라우저 CSS에 그 규칙이 있는지 보고, 빌드 CSS(`.next/static/chunks/*.css`)와 비교한다. 빌드에만 있으면 코드 문제가 아니므로 개발 서버를 다시 띄운다.
- **항상 생기는 일은 아니다:** 다시 띄운 서버에서는 그 뒤에 만든 새 파일의 클래스가 바로 들어왔다([두 번째 행 계획](plans/2026-10-02-home-church-row.md)).
- **"같다"는 결과를 믿기 전에:** 리팩터링 전후 스크린샷이 바이트까지 같게 나와도, 개발 서버가 옛 코드를 내보내고 있었다면 증거가 되지 못한다. 새 컴포넌트에 `data-probe` 같은 속성을 잠깐 넣어 `curl`로 HTML에 나오는지 보고 되돌린다([세 번째 행 계획](plans/2026-10-02-home-third-row.md) T5).

## Tailwind CSS v4 · shadcn/ui

- **그라데이션:** `bg-gradient-*`는 `bg-linear-*`로 이름이 바뀌었다. 정지점 위치는 `from-25%`처럼 쓴다.
- **한국어 줄바꿈:** 좁은 화면에서 "연결되/는"처럼 단어 중간이 끊긴다. 본문 블록에 `break-keep`(word-break: keep-all)을 준다.
- **나란히 놓인 카드는 위쪽 정렬:** 설명 길이가 카드마다 달라 한 카드만 두 줄로 꺾이면, 카드 내용을 세로 가운데 정렬(`items-center`)했을 때 이름·숫자 높이가 카드마다 어긋난다. `items-start`로 위쪽을 맞춘다(통계 카드).
- **포커스 테두리는 `outline-hidden`:** v4의 `outline-none`은 outline을 아예 없앤다. 강제 색 모드(Windows 고대비)에서는 포커스 ring(box-shadow)도 그려지지 않아 포커스가 보이지 않는다. 직접 만든 포커스 스타일에는 `outline-hidden`을 쓴다(통계 카드 리뷰에서 발견).
- **썸네일 비율은 `items-start`와 함께:** 가로 flex 줄의 기본 `align-items: stretch`가 썸네일을 줄 높이만큼 늘려 `aspect-4/3`이 무시됐다(375px에서 세로로 긴 사진). 글이 여러 줄로 늘어나는 줄에서는 `items-start`(또는 `items-center`)를 준다(공지 페이지 `NoticeItem`).
- **띄어쓰기 없는 긴 글은 `wrap-anywhere`:** `break-keep`인 칸에 띄어쓰기 없는 긴 제목(주소, 긴 영단어)이 오면 flex 칸의 최소 폭이 그 글자 전체가 되어 375px에서 가로 스크롤이 생겼다. 글 칸에 `wrap-anywhere`(overflow-wrap: anywhere)를 주면 띄어쓰기에서 꺾는 한글은 그대로 두고, 꺾을 곳이 없을 때만 글자 사이에서 꺾는다. 목데이터 제목이 짧아 e2e가 못 잡으므로, 화면에서 제목을 바꿔 넣어 보는 테스트를 둔다(공지 페이지 리뷰 #3).
- **한글 본문 폭에 `max-w-prose`를 쓰지 않는다:** `65ch`이고 `ch`는 숫자 0의 폭이라 한글로는 30자 남짓에서 꺾인다. 1440px에서 짧은 요약도 두 줄로 꺾여 줄 오른쪽이 비었다. `max-w-4xl`처럼 px 단위로 묶었다.
- **목록 스타일을 지운 `ul`에는 `role="list"`:** preflight가 `list-style: none`을 주면 Safari VoiceOver가 목록으로 읽지 않는다.
- **연한 accent 색은 대비를 잰다:** `orange-500` 글자는 흰 배경에서 2.89:1로 큰 글자 기준(3:1)에도 못 미쳤다. -600(3.58:1)을 썼다. 색 토큰을 정할 때 흰 카드 위 대비를 함께 확인한다.
- **폰트 변수 이름:** shadcn이 만든 `globals.css`의 `--font-sans: var(--font-sans)`는 자기 참조다. `next/font`의 변수는 `--font-pretendard`처럼 다른 이름으로 만들고 `--font-sans`에서 가져다 쓴다.
- **shadcn 4.21:**
  - `clsx`와 `tailwind-merge` 대신 shadcn이 배포하는 `cn` 패키지를 설치한다(이상한 패키지가 아니다).
  - `init`은 프리셋을 대화형으로 묻는다. 비대화형으로 돌리려면 `-t next -b radix -p nova`처럼 지정한다.
  - **`FieldError`는 칸마다 `role="alert"`다:** 빈 폼을 내면 오류 7개가 한꺼번에 읽힌다. 칸 메시지에는 `role={undefined}`를 넘기고 `aria-describedby`로 칸의 설명이 되게 했다. 알림은 폼 위 요약("입력을 확인해 주세요 (N개)") 한 곳에서만 한다. `add field`는 label과 separator를 함께 만든다([대표자 관리 계획](plans/2026-10-06-admin-page.md) T5).
  - **체크박스와 문구는 `FieldContent`로 묶는다:** `Field orientation="horizontal"`에 체크박스, 라벨, 오류를 나란히 두고 `flex-wrap`을 주면 375px에서 체크박스만 한 줄에 남았다. 라벨과 오류를 `FieldContent`로 감싸 체크박스 옆 한 칸에 둔다.

## 카카오맵

### SDK 오류가 브라우저에는 `ERR_BLOCKED_BY_ORB`로만 보인다
- **상황:** 등록한 주소(3000)에서도 지도 대신 대체 화면이 나왔다. 브라우저에는 `sdk.js` 요청이 `net::ERR_BLOCKED_BY_ORB`로 실패했다는 것뿐이었다.
- **원인:** 카카오가 스크립트 대신 JSON 오류(`403 {"errorType":"NotAuthorizedError","message":"App(…) disabled OPEN_MAP_AND_LOCAL service."}`)를 돌려줬고, Chrome이 스크립트 자리의 JSON을 막아(Opaque Response Blocking) 본문이 보이지 않았다. 카카오 앱에서 **카카오맵 사용 설정**이 꺼져 있었다. 등록하지 않은 주소(3001)에서도 같은 모양으로 실패한다.
- **대응:** Playwright에서 `page.route`로 그 요청을 가로채 `route.fetch()`로 상태와 본문을 찍는다. 키는 출력에서 가린다(`appkey=***`). 콘솔에서 카카오맵 사용을 켜자 200이 왔다([지도 페이지 계획](plans/2026-10-03-map-page.md) T3).
- **막힌 요청은 `response`에 잡히지 않는다:** ORB로 막힌 요청은 Playwright의 `response` 이벤트가 아니라 `requestfailed`(`net::ERR_BLOCKED_BY_ORB`)로만 오고, 콘솔 오류도 남지 않는다. `response`만 세다가 "SDK 요청이 없다(키가 빠졌다)"고 잘못 읽었다. `request`·`requestfailed`까지 함께 기록한다([배포 계획](plans/2026-10-07-vercel-deploy.md) T2).

### 지도를 만든 직후 `setBounds`로 맞추면 `idle`이 오지 않는다
- **상황:** 교회 15곳에 맞춘 멀리 보는 수준(10)인데 이름표 15개가 다 보여 겹쳤다. 축소·확대로 `idle`이 오면 이름표가 맞게 숨었다.
- **원인:** 실제 SDK는 처음 맞출 때 `idle`을 보내지 않아, 확대 수준 상태가 처음 값(8)에 머물렀다. 가짜 SDK는 `setBounds` 뒤 `idle`을 보내도록 만들어 이 차이를 숨겼다.
- **대응:** 맞춘 뒤 `kakao.maps.event.trigger(map, "idle")`로 같은 경로를 직접 일으킨다. effect 안에서 바로 `setState`하면 `react-hooks/set-state-in-effect` lint 오류다. 가짜 SDK도 실제처럼 `setBounds`가 `idle`을 보내지 않게 바꿔, `trigger`를 빼면 e2e가 잡게 했다.
- **교훈:** 가짜는 실제에서 본 동작에 맞춘다. 가짜를 처음 만들 때 짐작한 동작이 실제와 다르면, 가짜가 버그를 숨긴다.
- **반대로 창 크기를 바꾸면 `idle`이 온다:** 리뷰가 "크기만 바뀌면 `idle`이 오지 않는다"(문서: 중심·수준이 바뀔 때)고 지적했지만, 창 크기를 바꾸자 고친 줄 없이도 개수가 맞게 바뀌었다(브라우저가 받은 JS에 고친 줄이 없음을 확인). 창은 그대로이고 칸만 바뀌는 경우를 위해 `ResizeObserver`에서 `relayout` 뒤 `idle`을 일으켜 둔다.

### 지도 칸과 그 위의 요소
- SDK가 지도 칸에 `position: relative`를 직접 넣는다. 칸을 `absolute inset-0`으로 채우면 높이가 0이 되므로 `size-full`로 채우고 부모에 높이를 준다.
- SDK가 안에서 쓰는 z-index가 바깥 요소(교회 수 알약)와 섞이지 않게 지도 칸에 `isolate`를 준다.
- 왼쪽 아래에 카카오 로고와 축척 막대가 있다. 그 자리에 요소를 두면 로고를 가린다(`bottom-9`로 올림).
- 오버레이 내용에 DOM 요소를 주고 React `createPortal`로 그리면 핀을 버튼(접근 이름, 포커스)으로 만들 수 있다. `clickable: true`면 핀을 눌러도 지도가 끌리지 않는다.
- 오버레이를 다시 만들면(`setMap(null)` 뒤 새로 만듦) 그 안의 버튼이 DOM에서 빠졌다 들어가 **포커스를 잃는다**. 고르기처럼 자주 바뀌는 값은 오버레이를 그대로 두고 `setZIndex` 같은 메서드로 바꾼다(리뷰 지적 #1).
- 지도 effect를 `churches` 배열에 걸면 같은 데이터를 다시 받을 때(같은 주소로 이동)도 다시 맞춰 사용자가 옮긴 지도를 잃는다. 교회 id를 이은 값으로 정한다.

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

### 404 응답은 브라우저 콘솔 오류로 남는다
- **상황:** 없는 교회(`/churches/church-99`)가 404인지 보는 테스트가, 상태 코드와 404 제목은 맞는데 "브라우저 콘솔 에러"로 실패했다.
- **원인:** 브라우저는 404 응답을 `Failed to load resource: the server responded with a status of 404 (Not Found)`로 콘솔에 남긴다. 공통 fixture(`e2e/fixtures.ts`의 `consoleErrors`)는 콘솔 오류가 하나라도 있으면 실패시킨다.
- **대응:** fixture는 그대로 두고, 404를 기대하는 테스트에서만 `consoleErrors`를 받아 그 한 줄이 정확히 1개인지 확인하고 뺀다. 다른 콘솔 오류는 여전히 잡힌다([교회 상세 계획](plans/2026-10-06-church-detail-page.md) T2).

### 카드 전체로 넓힌 링크는 안쪽 요소의 클릭을 가로챈다
- **상황:** 추천 카드의 교회 이름 링크를 `after:absolute after:inset-0`으로 카드 전체로 넓힌 뒤, "사진을 눌러도 상세로 간다" 테스트가 사진 요소를 누르려다 5초를 넘겼다. 기록에는 `<a …>한강교회</a> … intercepts pointer events`가 있었다.
- **원인:** Playwright는 누를 요소가 그 자리의 맨 위에 있을 때까지 기다린다. 넓힌 링크가 사진을 덮고 있으니 사진은 결코 맨 위가 되지 않는다. 그리고 그것이 바로 원하던 동작이다.
- **대응:** 안쪽 요소 대신 카드의 그 자리를 누른다(`card.click({ position: { x: 24, y: 24 } })`). 위에 따로 올린 버튼(하트, `relative z-10`)은 그대로 버튼을 눌러 이동하지 않는지 본다.

### 테스트 기대값을 앱 코드에서 가져오지 않는다
- 메뉴 목록을 `src/lib/navigation.ts`에서 가져오면, 메뉴 이름을 실수로 바꿔도 테스트가 함께 바뀌어 잡지 못한다. 기대값은 테스트에 직접 적는다. 실제로 "행사"를 "행사안내"로 바꾸자 테스트가 바로 잡아냈다.

### 대비를 잴 때 브라우저가 돌려주는 색은 oklch다
- **상황:** 태그 대비를 재는 스크립트가 1.04:1을 냈다. 화면은 멀쩡했다.
- **원인:** 색 토큰이 `oklch()`라서 Chrome의 `getComputedStyle().color`도 `oklch(...)`를 돌려준다. 스크립트가 그 숫자(L, C, H)를 RGB로 읽었다.
- **대응:** 1×1 canvas에 `fillStyle`로 칠하고 `getImageData`로 RGB를 읽은 뒤 대비를 잰다.

### 테스트 빌드의 환경변수는 `webServer.env`로 정한다
- `NEXT_PUBLIC_*`는 빌드 때 번들에 박힌다. `@next/env`는 시작할 때 `process.env`에 이미 있는 키(빈 문자열 포함)를 `.env.local`로 덮지 않고, Playwright `webServer.env`는 `process.env`에 합쳐진다. 그래서 `webServer.env`에 가짜 키를 주면 `.env.local`과 상관없이 테스트 빌드가 정해진다.
- 그 대신 테스트 뒤 `.next`에는 가짜 키가 남는다. `npm run start`로 데모하려면 `npm run build`를 다시 한다.
- 키 없는 빌드도 `NEXT_PUBLIC_KAKAO_MAP_KEY= npm run build`로 만들 수 있다(빈 값이 앞섬).

### 외부 SDK 요청은 막지 말고 대신 돌려준다
- 콘솔 에러 fixture가 있어서 `route.abort()`로 막으면 `Failed to load resource`로 테스트가 실패한다. 빈 스크립트를 200으로 돌려주면 SDK가 없는 상황(대체 화면)을 콘솔 에러 없이 만든다.
- fixture 함수의 두 번째 인자를 Playwright 문서처럼 `use`라고 부르면, 이름이 있는 fixture(`page: async (…, use) =>`)에서 `react-hooks/rules-of-hooks`가 훅 호출로 오인한다. `provide` 같은 다른 이름을 쓴다.
- 테스트에서 `window`의 가짜 SDK 손잡이를 쓸 때 `declare global`로 `Window`를 넓히면 앱 타입에도 새어 든다(e2e도 tsconfig에 들어감). `window as unknown as { … }`로 그 자리에서만 바꾼다. 바로 바꾸면 TS2352로 빌드 타입 검사가 실패한다.

### 가짜 SDK 손잡이는 지도가 준비된 뒤에 쓴다
- `page.goto` 직후 `window.__fakeKakao.moveTo`를 부르면 SDK 스크립트가 아직 돌지 않아 `Cannot read properties of undefined`가 난다. "현재 지도 범위 내 교회" 문구 같은 준비 신호를 먼저 기다린다.

### 잠깐 끼었다 사라지는 값은 DOM 변화를 기록해 잡는다
- 지역을 바꾸는 순간 앞 지역의 범위로 거른 "0개"가 한 번 렌더된 뒤 "9개"로 바뀌었다. 최종 값만 보는 단언으로는 잡히지 않아, 개수 문구에 `MutationObserver`를 붙여 바뀐 값을 모두 기록하고 그 안에 잘못된 값이 없는지 본다(`role="status"`는 DOM 변화가 화면 읽기 프로그램에 전해질 수 있다).

### 장식 이미지는 `img` 역할이 없다
- `alt=""`인 이미지는 역할이 presentation이라 `getByRole("img")`로 찾지 못한다. 요소(`locator("img")`)로 찾는다.

### 프로젝트 밖 스크립트는 Playwright를 절대 경로로 가져온다
- 화면 확인용 스크립트를 scratchpad에 두고 `import { chromium } from "@playwright/test"`로 돌리면 `ERR_MODULE_NOT_FOUND`가 난다. 스크립트 위치에서 `node_modules`를 찾기 때문이다. `<프로젝트>/node_modules/@playwright/test/index.mjs`처럼 절대 경로로 가져오고, 브라우저는 설정과 같은 `channel: "chrome"`을 쓴다.

### 전체 페이지 스크린샷은 화면 크기를 바꾼다
- `fullPage: true`로 찍으면 촬영하는 동안 화면이 커져, 지도가 타일을 다시 받는 중인 회색 자리가 찍혔다. 지도처럼 크기에 반응하는 화면은 화면 크기 그대로 찍는다.

### 부하가 크면 "안정" 대기가 5초를 넘는다(workers 3으로 줄임)
- 테스트가 82개로 는 뒤 전체 실행에서 지도와 무관한 클릭 하나가 가끔 `waiting for element to be visible, enabled and stable`에서 `actionTimeout`(5초)을 넘겼다. 따로 돌리면 통과하고, 같은 시간대 master는 통과했다. 기록은 [지도 페이지 계획](plans/2026-10-03-map-page.md) 변경 이력에 있다.
- **개발 서버가 켜져 있으면 거의 늘 난다(116~118개일 때):** 대표자 관리 작업에서 개발 서버(3000)를 켠 채 전체 e2e를 3번 돌리자 3번 모두 매번 다른 테스트 1~2개가 실패했다. 끈 뒤에는 3번 모두 통과했다. 테스트 중 부하 평균은 12에서 64까지 올랐다. 개발 서버 없이도 5번 중 1번 났다. 실패한 클릭은 모두 `transition-colors`가 붙은 탭·칩 링크였다. 다만 그런 링크를 누르는 테스트가 원래 많아서, 이것이 원인인지는 확인하지 않았다([대표자 관리 계획](plans/2026-10-06-admin-page.md) 변경 이력).
  - 헤더 버튼 작업(149개, workers 3)에서도 개발 서버를 켠 채 돌리자 교회 상세 테스트 1개가 실패했다. 그 테스트만 3번 돌리면 통과했고, 개발 서버를 끈 뒤 전체가 통과했다([헤더 버튼 계획](plans/2026-10-06-header-actions.md) T7).
  - 같은 작업의 커밋 때는 `page.route: Test timeout of 30000ms exceeded`로 한 번 거부됐다. 브라우저 창을 만드는 단계에서 멈춘 것이다. 그때 테스트와 상관없는 Chrome 탭 두 개가 CPU를 165%·107% 쓰고 있었다. 커밋이 거부되면 `uptime`과 `ps -Ao pcpu,comm | sort -rn | head`로 다른 부하부터 본다.
  - **대응:** 전체 테스트는 개발 서버를 끈 뒤 돌린다. 그래도 계속 나면 worker 수나 `actionTimeout`을 바꿀지 정한다. 테스트 설정을 바꾸는 일이라 사용자가 정한다.
  - `browser.newContext: Test ended`(30초)는 화면 코드가 돌기 전에 브라우저 창을 만들지 못한 것이다. 그때 `mds`(Spotlight 색인)가 CPU 40%를 쓰고 있었다. 빌드가 파일을 많이 만든 직후라 색인이 붙은 것으로 보인다.
- **동시 실행 수를 5에서 3으로 줄였다(`playwright.config.ts`의 `workers: 3`):** 기본값은 CPU의 절반(이 컴퓨터는 5)이다. 줄인 뒤 교회 상세 작업 동안 개발 서버를 끄고 돌린 전체 e2e 8번(118~132개)이 모두 통과했다. 시간은 40~49초로 5 workers 때와 비슷했고, 테스트 중 부하 평균은 17 안팎이었다(5 workers 때 26~64). 그래도 다시 나면 `actionTimeout`을 볼 차례다([교회 상세 계획](plans/2026-10-06-church-detail-page.md) T1).

## 배포 (Vercel)

### Vercel은 `.nvmrc`가 아니라 `engines`를 본다
- 기본 Node는 24.x이고, `package.json`의 `engines.node`가 프로젝트 설정보다 앞선다(공식 문서 Supported Node.js versions). `.nvmrc`는 문서에 나오지 않는다. 그래서 `"engines": { "node": "22.x" }`를 둔다.
- 빌드 로그에는 Node 버전 줄이 나오지 않는다. 확인하려면 빌드 명령에서 `node -v`를 찍어야 한다.
- `npm install --package-lock-only`로 lock에 `engines`를 넣으면 관계없는 선택 의존성 항목(`@tailwindcss/oxide-wasm32-wasi` 아래 `@emnapi/*`)까지 붙었다. 차이를 좁히려고 lock의 루트 항목에 `engines`만 넣고 `npm ci --dry-run`으로 확인했다.

### 정적 페이지는 상대 날짜 목데이터를 배포한 날에 굳힌다
- **상황:** 빌드 결과에서 홈만 `○`(정적)였다. 목데이터는 "그린 시각부터 며칠 뒤"라, 배포하고 며칠 지나면 홈 "다가오는 행사"에 지난 날짜가 남는다. 로컬에서는 빌드를 자주 하니 보이지 않는다.
- **대응:** 홈에서 `await connection()`(`next/server`)을 불러 요청마다 그린다. 주기적 재생성(`revalidate`)은 기한이 지난 뒤 첫 방문자에게 옛 페이지를 먼저 보여 줘, 가끔 들르는 데모에 맞지 않다. e2e는 `/`의 `cache-control`에 `no-store`가 있는지 본다(정적이면 `s-maxage=31536000`).

### 운영 주소는 프로젝트 이름과 다를 수 있다
- 프로젝트 `church-community`의 운영 주소는 `church-community-eight.vercel.app`이었다. `church-community.vercel.app`은 남의 사이트("ELIM CHURCH")였다. 이름만 보고 주소를 짐작하지 말고 대시보드의 Domains에서 확인한다.
- GitHub deployments API(`gh api repos/<저장소>/deployments/<id>/statuses`)는 배포마다 생기는 주소만 준다. 이 주소와 `<프로젝트>-<계정>.vercel.app`은 Vercel 로그인을 요구한다(302 → sso-api).
- `x-vercel-id: icn1::icn1::…`에서 앞은 요청을 받은 CDN 지역, 뒤는 함수가 실행된 지역이다. 함수 지역은 `vercel.json`의 `regions`로 정한다(Hobby는 한 곳).

### 카카오 도메인 등록은 다시 배포하지 않아도 된다
- 키는 빌드 때 번들에 박히지만, 도메인 허용은 카카오가 요청 때마다 판단한다. 운영 주소를 JavaScript SDK 도메인에 더하자 같은 배포에서 바로 지도가 떴다. 등록 전에는 SDK 요청이 ORB로 막혀 대체 화면이었다.

## 날짜와 시간

### 목데이터 날짜를 고정하면 시간이 지나 테스트가 깨진다
- "다가오는 행사"를 고정 날짜로 적으면 한 달 뒤에 모두 지난 행사가 되어 홈 칸이 비고 e2e가 실패한다.
- **대응:** 목데이터는 "서울 날짜로 오늘부터 며칠 뒤 몇 시"로 적고, 지금 시각을 받아 만든다(`createMockEvents(now)`). e2e는 날짜 값 대신 제목·순서와 날짜 꼴(정규식)을 보고, 날짜 계산은 단위 테스트가 맡는다.

### 시간대를 빼먹은 코드는 KST 컴퓨터에서 보이지 않는다
- 이 컴퓨터는 `Asia/Seoul`이고 Vercel 서버는 UTC다. `timeZone` 없이 날짜를 적으면 로컬에서는 맞고 배포에서만 9시간 어긋난다.
- **대응:** `vitest.config.mts` 맨 위에서 `process.env.TZ = "UTC"`를 정해 단위 테스트를 서버와 같은 조건에서 돌린다. 설정의 `test.env`에 넣는 `TZ`는 threads pool에 적용되지 않는다(ctx7 Vitest common-errors).
- **증거:** `timeZone`을 빼면 UTC에서는 테스트 6개가 실패했다. 같은 상태에서 TZ 설정까지 빼고 KST에서 돌리면 6개가 모두 통과했다. 설정이 빠진 것은 "단위 테스트는 UTC에서 돈다" 테스트가 잡는다.

### `Intl`의 한국어 날짜는 목업 표기와 다르다
- `Intl.DateTimeFormat("ko-KR", …)`은 `"2026. 10. 4. (일) 오후 7:00"`처럼 일 뒤에 점을 붙인다. 목업 표기("2026. 10. 4 (일)")에 맞추려면 `formatToParts`로 조각을 받아 조립한다.
- `Intl.RelativeTimeFormat("ko", { numeric: "auto" })`는 하루 전을 "어제"로 적는다. "1일 전"이 필요하면 직접 계산한다.

### 상대 시간은 단위 경계에서 내려간다
- **상황:** 정확히 "2시간 전"으로 만든 글이, 표기할 때의 `now`가 몇 ms만 일러도 "1시간 전"으로 나왔다(내림).
- **대응:** 목데이터 시각을 단위가 바뀌는 경계에서 비켜 둔다(2시간 10분 전). 화면의 `now`는 데이터를 받은 뒤 서버 컴포넌트에서 한 번 만든다. 클라이언트에서 다시 계산하면 hydration이 어긋난다.

### 좁은 칸에서 일시가 "오후 / 7:00"처럼 끊긴다
- `break-keep`은 띄어쓰기에서 줄을 바꾸므로 "오후"와 "7:00" 사이에서도 끊긴다. 날짜와 시간을 `whitespace-nowrap` 묶음 둘로 나눠, 끊겨도 "2026. 10. 4 (일) / 오후 7:00"이 되게 한다.

## Hook과 하네스

### 권한 규칙은 의도한 것까지 막는다
- `Bash(rm -rf *)` 차단 규칙이 세션 임시 폴더 정리도 막았다. 규칙이 동작한다는 증거이기도 하다. 임시 작업은 지우는 대신 새 폴더 이름을 쓴다.
- **확인이 필요 없는 일까지 묻지 않는다:**
  - **상황:** 대표자 관리 작업에서 확인 창이 9번 떴고, 그중 6번은 필요 없었다.
    - 화면 확인용 임시 스크립트를 지우는 `rm` 5번(ask `Bash(rm *)`)
    - staging에서 빼기만 하는 `git reset -- 파일` 1번(ask `Bash(git reset *)`)
  - **원인:** 판정 순서가 deny → ask → allow이고, 먼저 맞는 규칙이 이긴다(code.claude.com/docs/en/permissions). 더 구체적인 allow도 ask를 이기지 못하므로, allow에 예외를 더하는 방식으로는 확인 창이 사라지지 않는다. `*`는 공백을 포함해 아무 글자나 맞아서, `Bash(git reset *)`가 unstage까지 잡았다.
  - **대응:** ask 규칙 자체를 좁혔다([계획](plans/2026-10-06-permission-prompts.md)).
    - rm: 재귀 삭제(`rm *-r*`, `rm *-R*`, `rm *-fr*`, `rm *-fR*`)만 묻는다. `-rf`·`-fr`은 deny가 먼저 막는다.
    - git reset: 작업 내용을 버리는 `--hard`, `--merge`만 묻는다.
    - push, clean, `checkout --`, restore, `--amend`, `--no-verify`, 배포는 그대로 묻는다.
  - **임시 스크립트는 프로젝트 밖에 둔다:** Playwright 스크립트를 scratchpad에 두고 그대로 실행하면 `@playwright/test`를 찾지 못한다(`ERR_MODULE_NOT_FOUND`). Node가 파일이 있는 폴더 기준으로 `node_modules`를 찾기 때문이다. 프로젝트 폴더에서 `node --input-type=module < <scratchpad>/shot.mjs`처럼 표준 입력으로 넘기면 프로젝트 기준으로 찾는다. 그래서 프로젝트 폴더에 파일을 만들 일도, 지울 일도 없다.

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
- **`git rm`은 삭제를 바로 staging한다:** 파일을 옮기는 리팩터에서 `git rm`만 index에 올라가 있으면, 그대로 `git commit`했을 때 지운 파일을 import하는 커밋이 생긴다. pre-commit은 staging이 아니라 작업 폴더를 검사하므로 통과해 버린다. 커밋 전까지는 그냥 지우거나(`rm`) `git restore --staged`로 내려 두고, 커밋할 때 바꾼 파일과 함께 올린다([공지 페이지 계획](plans/2026-10-03-notices-page.md) 리뷰 #2).

### 계획하기 전에 같은 주제의 계획서를 찾는다
- **상황:** 지도 페이지를 계획할 때 홈 지도 칸을 맡은 카카오맵 계획(T2~T4 미완)을 놓쳤다. 상위 계획서와 코드만 보고 `docs/plans/`를 주제로 검색하지 않았다. 실행 중에 하네스 지도의 "카카오맵 T2" 문장을 보고 찾았다.
- **대응:** 남은 task를 새 계획이 넘겨받고, 두 계획서의 변경 이력에 관계를 적었다. 그 계획의 시작 조건("카카오맵 사용 설정 켜기")이 실제로 막힌 원인이었다.
- **다음:** 계획 전에 `grep -ril "<주제어>" docs/plans`로 미완 task(`- [ ]`)가 남은 계획을 찾는다. plan-work 조사 목록에 넣을지는 하네스 지도의 할 일로 올려 두었다.

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

### 워크트리로 나눠 일할 때
같은 폴더에서 두 세션이 일하면 한쪽이 branch를 바꿀 때 다른 쪽 작업 폴더도 함께 바뀐다. 그래서 커뮤니티 페이지는 워크트리에서 만들었다([커뮤니티 계획](plans/2026-10-03-community-page.md)). 그때 만난 함정은 다음과 같다.
- **기본 워크트리는 push된 곳에서 갈라진다:** `EnterWorktree`(이름으로 만들기)는 기본으로 `origin/<기본 branch>`에서 갈라진다. push하지 않은 커밋(그때 11개)이 빠진다. `git worktree add -b <branch> ../church-<이름> master`처럼 로컬 master에서 직접 만들고, `EnterWorktree`에는 `path`로 들어간다.
- **워크트리를 저장소 안에 두지 않는다:** `.claude/worktrees/`는 `.gitignore`에 없다. 저장소 안에 두면 원래 폴더의 lint, `tsconfig`의 `**/*.ts`, Tailwind 소스 탐색이 워크트리 파일까지 훑는다. 저장소 옆 폴더(`../church-community`)에 둔다.
- **hook은 워크트리가 아니라 원래 폴더를 본다:** Stop hook과 PreToolUse hook은 `$CLAUDE_PROJECT_DIR`(원래 폴더)에서 돈다.
  - 실제로 워크트리에서 일하는 동안 Stop hook이 원래 폴더의 단위 테스트와 lint를 돌렸다. 다른 세션이 작업 중인 `e2e/fixtures.ts`의 lint 오류로 응답을 막았다.
  - 그래서 워크트리에서는 task 경계마다 `npm run test:unit && npm run lint && npm run build`를 직접 돌린다. 원래 폴더의 실패는 그 세션의 일이라 고치지 않는다.
  - pre-commit은 `core.hooksPath=.husky/_`(상대 경로)라 워크트리의 `.husky/pre-commit`이 돈다.
- **e2e 포트 3100은 모든 폴더가 같이 쓴다:** `reuseExistingServer: false`라서, 다른 폴더의 `npm run test`가 도는 동안에는 `http://localhost:3100 is already used`로 실패한다.
  - 돌리기 전에 `lsof -iTCP:3100 -sTCP:LISTEN`으로 확인한다. 차 있으면 `lsof -a -p <PID> -d cwd`로 어느 폴더의 서버인지 보고, 빌 때까지 기다린다.
  - `until ! lsof …; do sleep 5; done`을 백그라운드로 돌리면 빈 순간에 알림을 받는다.
- **워크트리에 묶인 세션에서는 `source ~/.nvm/nvm.sh`가 막힌다:** 셸이 무엇을 실행할지 확인할 수 없다는 이유다. Node 22는 `env PATH=/Users/anderson/.nvm/versions/node/v22.14.0/bin:/usr/bin:/bin npm …`처럼 경로를 글자 그대로 적어 쓴다(`$PATH`처럼 실행 때 정해지는 값도 막힌다).
- 워크트리에는 `.env.local`이 없어 지도는 대체 화면이다. 키가 필요한 확인은 원래 폴더에서 한다.

## 콘텐츠

- **목업 문구를 그대로 믿지 않는다:** 참고 이미지(ChatGPT 목업)의 히브리서 10:24 인용("다른 지체를 돌아보아")은 실제 본문과 달랐다. 성경 구절 같은 사실 정보는 원문(개역개정 "서로 돌아보아 사랑과 선행을 격려하며")으로 확인한다.
- **목업 속 이름도 확인한다:** 목업의 "이재훈 목사"는 실제로 잘 알려진 대형 교회 담임목사와 이름이 같아서, 목데이터에서는 가상 이름(이준혁)으로 바꿨다. 사람·교회 이름은 실존 인물이나 유명 교회와 겹치지 않는지 보고, 겹치면 바꾸거나 위치를 다르게 둔다.
- **배너 사진은 구도부터 본다:** 교회 건물 사진 후보 네 장은 피사체가 가운데에 있거나 세로로 길어서, 왼쪽에 글자를 올리는 넓은 배너에 맞지 않아 뺐다. 피사체가 오른쪽에 있거나 가로로 넓은 풍경(한강·도심)이 맞았다.
