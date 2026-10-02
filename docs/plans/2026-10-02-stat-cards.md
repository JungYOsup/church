# 홈 통계 카드 4개

## Context
- 왜 하는가: 상위 계획서의 홈 구성(히어로 → **통계 카드 4개** → 지도·추천 교회·대표자 안내 → 행사·공지·커뮤니티)의 두 번째 섹션입니다. 동시에 `spec-check` → `plan-work` → `run-plan` 흐름을 처음 실제로 써 보는 작업입니다.
- spec:
  - 무엇을: 통계 카드 4개(등록 교회 248 · 이번 주 행사 32 · 공유 공지 87 · 대표자 인증 146)
  - 어디서: 홈 히어로 바로 아래
  - 완료 조건: 카드마다 아이콘·이름·숫자·설명이 보이고, 누르면 해당 화면으로 이동합니다. 375·768·1440px에서 1·2·4열로 놓이고 가로 스크롤이 없습니다. e2e 테스트를 추가해 `npm run test`가 통과합니다.
- 6축 위치: 계획·실행(PL-02 계획 품질, 첫 task 단위 실행), 검증(VF, e2e 추가)

## 확인한 사실
- **참고 디자인:** 참고 이미지(`~/Downloads/ChatGPT 이미지 2026년 9월 30일 오후 03_36_59-1.png`)를 Read로 확인했습니다.
  - 흰 카드에 연한 테두리와 그림자가 있습니다.
  - 왼쪽에 연한 accent 배경의 둥근 사각 아이콘 타일이 있고, 오른쪽에 이름(작은 회색), 숫자(크고 굵은 accent 색), 설명(작은 회색)이 있습니다.
  - 오른쪽 위에 회색 `>`가 있고, 데스크톱에서는 한 줄에 4개가 놓입니다.
- **지금 코드:**
  - `src/app/page.tsx`는 `<HeroBanner />`만 그립니다.
  - `src/lib/types.ts`에는 `UserProfile`만 있습니다.
  - `src/lib/data`와 `src/lib/mock`에는 `user.ts`만 있고, `src/components/home/`에는 `HeroBanner`만 있습니다. 겹치는 파일은 없습니다.
- **관례:**
  - 데이터 함수는 `src/lib/data/user.ts`처럼 목데이터를 돌려주는 async 함수로 만듭니다.
  - 서버 컴포넌트가 데이터 함수를 직접 부릅니다. `Header`가 `getCurrentUser()`를 `await`하는 방식입니다.
  - 상위 계획서는 함수 이름을 `getStats()`, 타입 이름을 `Stats`로 정해 두었습니다(76·79행).
- **색:**
  - 상위 계획서 46행에 따라 accent는 파랑·초록·주황·보라입니다.
  - Tailwind는 소스를 글자 그대로 읽어 클래스를 찾습니다. 그래서 `bg-${color}-50`처럼 조립한 이름은 CSS가 만들어지지 않습니다. 완성된 클래스 문자열을 카드 설정에 그대로 적어야 합니다(ctx7: tailwindcss.com/docs/detecting-classes-in-source-files).
- **열 수:** 상위 계획서 94행에 "태블릿은 2열, 모바일은 1열"로 정해져 있습니다. 데스크톱 메뉴가 `lg`에서 나타나므로 4열도 `lg`에 맞춥니다.
- **아이콘:** 설치된 lucide-react에 `Church`, `CalendarDays`, `Bell`, `Users`, `ChevronRight`가 있습니다(`dist/lucide-react.d.ts`).
- **shadcn Card:**
  - 상위 계획서 39행의 설치 목록에는 Card가 있지만, 아직 설치하지 않았습니다(`src/components/ui/`에 avatar·button·dropdown-menu·sheet만 있음).
  - 이번 카드는 전체가 링크이고 아이콘과 글을 가로로 놓습니다. Card의 세로 슬롯 구조(Header·Content)와 맞지 않습니다.
- **기존 테스트와 충돌 없음:**
  - 카드 링크 이름("공유 공지 87 …")에 메뉴 이름("공지", "행사")이 들어갑니다.
  - 하지만 `e2e/navigation.spec.ts`는 메뉴 안에서 `exact: true`로 찾기 때문에 겹치지 않습니다.
  - 히어로 버튼 테스트("교회 찾기", "우리 교회 등록")와도 이름이 겹치지 않습니다.
- **데이터 계층의 동작을 확인할 도구:**
  - 프로젝트에 jiti 2.7.0이 이미 설치되어 있습니다(eslint·tailwind 의존성, `node_modules/.bin/jiti`). TS 파일을 바로 실행하고, `JITI_ALIAS`로 `@/` 경로를 풀 수 있습니다(`node_modules/jiti/README.md`).
  - **조사로 바뀐 점:** 처음에는 데이터 task가 lint·build 말고는 확인할 거리가 없어 컴포넌트 task와 합치려 했습니다. jiti로 `getStats()`를 직접 실행해 출력할 수 있어 따로 둡니다.
- **화면 확인 도구:** 세션 scratchpad의 `e2e/`에 playwright-core와 스크린샷 스크립트가 있어, 설치된 Chrome으로 375·768·1440px 스크린샷을 찍을 수 있습니다.
- **배운 점(`docs/lessons.md`):**
  - 한국어 설명 문구에 `break-keep`을 줍니다.
  - 테스트 기대값은 앱 코드에서 가져오지 않고 직접 적습니다.
  - Node 22는 `nvm use`로 바꿉니다.

## 결정
- **질문과 답:** 묻지 않았습니다(결과가 갈리는 선택지가 없었음).
- **정한 것:**
  - **링크:** 카드 전체를 링크로 만듭니다. 등록 교회 → `/map`, 이번 주 행사 → `/events`, 공유 공지 → `/notices`, 대표자 인증 → `/admin`. 오른쪽 위 `>`가 이동을 뜻하고, 네 페이지 모두 이미 있습니다.
  - **데이터 모양:** `Stats`에는 숫자만 둡니다(`churchCount`, `regionCount`, `weeklyEventCount`, `noticeCount`, `verifiedRepresentativeCount`).
    - 이름·설명·아이콘·색·링크는 화면의 일이라 컴포넌트에 둡니다.
    - Supabase로 바꿀 때 `getStats()` 안을 개수 조회로만 바꾸면 됩니다.
    - "전국 17개 지역"의 17도 `regionCount`에서 가져옵니다.
  - **문구:** 참고 이미지 그대로 씁니다. 숫자는 `toLocaleString("ko-KR")`로 표시해 1,000 이상에도 대비합니다.
  - **색:** 파랑 `blue`, 초록 `emerald`, 주황 `orange`, 보라 `violet`을 씁니다. 타일은 `-50` 배경에 `-600` 아이콘(주황은 `-500`), 숫자는 같은 진한 색입니다.
  - **배치:** `grid`로 1열 → `sm` 2열 → `lg` 4열입니다. 히어로와의 간격은 `page.tsx`에서 세로 `gap`으로 줍니다.
  - **shadcn Card:** 설치하지 않고, `Link`에 카드 스타일(`rounded-xl border bg-card shadow-sm`)을 직접 줍니다. 세로 구조의 카드가 필요한 섹션(추천 교회 등)에서 설치합니다.
  - **접근성:** `<section aria-label="교회 연합 현황">` 안에 `<ul>`/`<li>`로 놓습니다. 아이콘은 `aria-hidden`입니다.

## Tasks
task 형식은 `run-plan`이 읽으므로 그대로 씁니다.

- [x] **T1. 통계 데이터 계층**
  - 파일: `src/lib/types.ts`, `src/lib/mock/stats.ts`, `src/lib/data/stats.ts`
  - 의존: 없음
  - 확인(동작 증거):
    - scratchpad의 임시 스크립트가 `@/lib/data/stats`의 `getStats()`를 불러 결과를 출력합니다.
    - `JITI_ALIAS='{"@/*":"<프로젝트>/src/*"}' npx jiti <스크립트>` 출력이 (실제로는 `{"@":"<프로젝트>/src"}` 꼴이어야 동작함. 변경 이력 참고) `churchCount 248, regionCount 17, weeklyEventCount 32, noticeCount 87, verifiedRepresentativeCount 146`입니다.
    - `npm run lint && npm run build`가 통과합니다.
  - 증거: `JITI_ALIAS='{"@":"<프로젝트>/src"}' npx jiti check-stats.ts` → `churchCount 248, regionCount 17, weeklyEventCount 32, noticeCount 87, verifiedRepresentativeCount 146`, lint·build 통과
- [x] **T2. StatCards 컴포넌트와 홈 배치**
  - 파일: `src/components/home/StatCards.tsx`, `src/app/page.tsx`
  - 의존: T1
  - 확인(동작 증거):
    - 빌드 결과를 3100 포트로 띄우고 scratchpad 스크립트로 375·768·1440px를 확인합니다. 기대 결과:
      - 카드가 4개입니다.
      - 숫자는 248·32·87·146입니다.
      - 링크는 `/map`·`/events`·`/notices`·`/admin`입니다.
      - 한 줄에 놓인 카드 수가 1·2·4개입니다.
      - 가로 스크롤과 콘솔 오류가 없습니다.
    - 1440px 스크린샷을 참고 이미지와 나란히 보고 다음을 확인합니다: 아이콘 타일, accent 색 숫자, 오른쪽 위 `>`, 회색 설명.
    - `grep -rn "lib/mock" src/components src/app`의 결과가 없습니다(데이터 계층 규칙).
  - 증거: `check-stats.mjs` → 375 `cards=4 perRow=1`, 768 `perRow=2`, 1024·1440 `perRow=4`, 모두 `overflow=false`, 콘솔 오류 none, 숫자·링크 248 `/map`·32 `/events`·87 `/notices`·146 `/admin`. 1440 스크린샷이 참고 이미지와 같은 구성(아이콘 타일·accent 숫자·`>`·회색 설명). mock import grep 결과 없음, lint·build 통과
  - 재확인(리뷰 반영 후, 개발 서버 3000): 375·768·1024·1440 `perRow` 1·2·4·4, `overflow=false`, 콘솔 오류 none. 숫자 대비 248 `5.25` · 32 `3.65` · 87 `3.58` · 146 `5.89`, 아이콘 색 = 숫자 색, `role=list`. forced-colors에서 포커스 `outline=solid 2px`(ring은 `none`)
- [x] **T3. 통계 카드 e2e 테스트**
  - 파일: `e2e/home.spec.ts`
  - 의존: T2
  - 확인(동작 증거):
    - 새 테스트 8개를 추가합니다:
      - 카드 4개의 이름·숫자 1개
      - 카드별 이동 4개
      - 폭별 열 수 3개
    - `npm run test`에서 기존 17개를 포함해 25개가 모두 통과합니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림):
      - 목데이터 248을 249로 바꾸면 이름·숫자 테스트가 실패합니다.
      - `lg:grid-cols-4`를 `lg:grid-cols-2`로 바꾸면 1440px 열 수 테스트가 실패합니다.
  - 증거: `npm run test` → `25 passed (12.7s)`. 248→249: 이름·숫자 테스트만 실패(`Expected pattern: /^등록 교회\s*248\D/`, `Received string: "등록 교회249전국 …"`). `lg:grid-cols-2`: 1440px 열 수 테스트만 실패(`Expected length: 4`, `Received length: 2`). 둘 다 되돌림
  - 재확인(리뷰 반영 후): 설명 검사를 더해 `npm run test` → `25 passed (15.0s)`. regionCount 17→18: 이름·숫자·설명 테스트만 실패(`Expected substring: "전국 17개 지역의 교회가 함께하고 있습니다."`, `Received string: "등록 교회248전국 18개 지역의 …"`). 되돌림
- [x] **T4. 문서 반영**
  - 파일: `CLAUDE.md`, `docs/plans/2026-09-30-church-community.md`
  - 의존: T3
  - 확인(동작 증거):
    - `grep -n "StatCards" CLAUDE.md`가 Architecture의 home 줄을 보여 줍니다.
    - 상위 계획서 변경 이력에 이 계획서 링크와 "shadcn Card 대신 Link에 카드 스타일" 결정이 있습니다.
    - 링크한 파일이 실제로 있습니다.
  - 증거: `grep -n StatCards CLAUDE.md` → `20:src/components/home/      홈 섹션 (HeroBanner, StatCards)`. 상위 계획서 변경 이력 마지막 줄에 `[세부 계획](2026-10-02-stat-cards.md)`과 Card 결정, `ls docs/plans/2026-10-02-stat-cards.md` 존재

## 리스크와 멈출 조건
- **1024px 근처에서 4열이 좁을 수 있음:** 카드 폭이 약 230px이라 설명이 세 줄 넘게 꺾일 수 있습니다.
  - T2 확인 때 1024px도 함께 봅니다.
  - 답답하면 4열을 `xl`로 옮기고 변경 이력에 적습니다(1·2·4열 구성은 그대로).
- **jiti 별칭 형식:** `JITI_ALIAS`의 경로 형식이 맞지 않으면 `JITI_TSCONFIG_PATHS`에 `tsconfig.json` 경로를 줍니다. 이것은 확인 방법의 문제라 앱 코드는 바꾸지 않습니다.
- **계획 밖 결정이 필요할 때:** 범위·데이터 구조 변경, 새 의존성, 되돌리기 어려운 작업이 필요해지면 다음 task로 넘어가지 않고 묻습니다.

## 검증
- **전체 완료 조건:**
  - `npm run lint && npm run build`
  - `npm run test` (25개)
  - 375·768·1440px 스크린샷을 참고 이미지와 비교
- **일부러 깨뜨려 보기:** T3에서 숫자와 열 수를 바꿔 테스트가 잡아내는지 봅니다.
- **마무리:**
  - `/code-review`로 독립 리뷰를 받습니다.
  - 새 함정은 `docs/lessons.md`에 적습니다.
  - 세 스킬을 처음 써 보며 느낀 불편한 점을 정리해 보고합니다.

## 범위 밖
- 통계 숫자를 실제 행사·공지 데이터에서 계산하기(행사·공지 데이터가 아직 없음. Supabase 단계)
- 다른 홈 섹션(지도·추천 교회·대표자 안내·행사·공지·커뮤니티)
- shadcn Card 설치
- 스크린샷 비교 테스트(`toHaveScreenshot`)
- 세 스킬 자체의 수정(불편한 점은 보고만 하고, 고칠지는 따로 정함)

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->
- 2026-10-02 (T1): jiti 별칭을 `{"@/*":"…/src/*"}` 대신 `{"@":"…/src"}`로 줬습니다. `/*` 꼴은 `Cannot find module '@/lib/data/stats'`로 실패했고, 접두어 꼴로 바꾸자 통과했습니다. 확인 방법만 바뀌었고 앱 코드는 그대로입니다.
- 2026-10-02 (리뷰 반영): `/code-review` 지적 15개 중 확인된 6개를 반영했습니다. 고친 코드가 T2·T3에 걸쳐 두 task의 체크를 풀고 다시 확인했습니다.
  - **색을 디자인 토큰으로:** 상위 계획서(디자인 토큰 절)는 통계 카드 accent 4색을 `globals.css`의 `@theme`에 두기로 했는데, 팔레트 클래스(`bg-blue-50` 등)를 직접 썼습니다. `--stat-*`·`--stat-*-soft` 토큰을 추가했습니다. 파랑은 브랜드 `--primary`·`--accent`를 그대로 씁니다. 글자색은 카드에 한 번만 주고 아이콘과 숫자가 물려받게 해, 같은 색을 두 번 적지 않습니다.
  - **주황 -500 → -600:** `orange-500` 숫자는 흰 카드에서 대비 2.89:1로, 큰 글자 기준(3:1)에 못 미쳤습니다. -600으로 바꿔 3.58:1입니다.
  - **접근성:** `<ul role="list">`를 줬습니다. Tailwind preflight가 목록 스타일을 지우면 Safari VoiceOver가 목록으로 읽지 않습니다. `outline-none` 대신 `outline-hidden`을 써서, 강제 색 모드에서도 포커스 테두리가 보입니다(Tailwind 문서 preflight·outline-style).
  - **테스트:** 카드 설명도 검사합니다. 전에는 `regionCount`를 잘못 연결해도 통과했습니다.
  - **화면 확인:** DoD대로 `npm run dev`(3000)에서 다시 확인했습니다. 처음 확인은 빌드 결과(3100)였습니다.

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다 -->
- **lint·build:** `npm run lint` 종료 코드 0, `npm run build` → `✓ Compiled successfully in 1094ms`, 라우트 7개 모두 정적 생성
- **동작 테스트:** 일부러 깨뜨린 코드를 되돌린 뒤 `npm run test` → `25 passed (12.8s)` (기존 17개 + 새 통계 카드 테스트 8개)
- **일부러 깨뜨려 보기:**
  - 목데이터 248→249: `카드 4개가 이름과 숫자를 순서대로 보여 준다`만 실패. `Received string: "등록 교회249전국 17개 지역의 교회가 함께하고 있습니다."`
  - `lg:grid-cols-4`→`lg:grid-cols-2`: `1440px 폭에서 카드가 한 줄에 4개 놓인다`만 실패. `Expected length: 4`, `Received array: [449, 449]`
- **화면 확인:** scratchpad `e2e/check-stats.mjs`로 빌드 결과(3100 포트)를 확인
  - 한 줄의 카드 수: 375px 1개 · 768px 2개 · 1024px 4개 · 1440px 4개
  - 네 폭 모두 `overflow=false`, 콘솔 오류 없음
  - 1440px 스크린샷이 참고 이미지와 같은 구성입니다: 왼쪽 연한 accent 아이콘 타일, accent 색 굵은 숫자, 오른쪽 위 `>`, 회색 설명
  - 다른 점: lucide 아이콘은 선 아이콘이라 참고 이미지처럼 채워져 있지 않습니다
- **구현 중 고친 것:** 1440px에서 첫 카드 설명만 두 줄로 꺾여 카드 내용을 세로 가운데 정렬하면 이름·숫자 높이가 카드마다 달랐습니다. 참고 이미지처럼 위쪽 정렬(`items-start`)로 바꿔 네 카드의 이름 줄을 맞췄습니다.
- **1024px 리스크:** 4열에서 설명이 2~3줄로 꺾이지만 잘리거나 넘치지 않아 `lg` 4열을 그대로 둡니다(카드 높이 164px).
- **리뷰에서 반영하지 않은 지적과 이유:**
  - 홈이 빌드 때 정적으로 만들어져 통계가 고정됨: 목데이터 단계에서는 맞는 동작입니다. Supabase로 바꿀 때 `getStats()` 안에서 `connection()`을 부르면 요청마다 계산되고, UI 코드는 바꾸지 않아도 됩니다(`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`의 `app/lib/data.ts` 예시).
  - 248곳·17개 지역이 앞으로 만들 교회 목데이터(서울·경기 12~20곳)와 맞지 않음: 숫자는 요청한 참고 디자인 그대로입니다. 교회 목데이터를 만들 때 맞출지 정합니다.
  - '대표자 인증'이 권한이 필요한 `/admin`으로 연결됨: 지금 `/admin`은 준비 중 페이지입니다. 권한을 붙이는 백엔드 단계에서 연결 대상을 다시 정합니다.
  - 테스트 정규식에 이름을 그대로 넣음: 지금 이름에는 정규식 특수문자가 없습니다. 설명은 `toContainText`로 문자열 그대로 검사합니다.
  - 카드·포커스 스타일 공통화: 카드 섹션이 하나뿐이라 지금 묶으면 이릅니다.
  - 목데이터 객체를 그대로 반환: 기존 `getCurrentUser()`와 같은 관례이고, 반환값을 고치는 호출부가 없습니다.
