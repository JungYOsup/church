# Vercel 배포: 목데이터 상태로 공개 URL 만들기

## Context
- **왜 하는가:** 1단계 UI(라우트 9개)를 다 만들었지만 아직 이 컴퓨터에서만 볼 수 있습니다. 상위 계획서의 목표는 "완성도 있는 데모와 공개 URL"입니다. 3단계(배포)를 2단계(Supabase)보다 먼저 해서, URL을 일찍 얻고 배포 환경에서만 드러나는 문제를 지금 잡습니다. 그러면 Supabase 작업도 단계마다 운영 환경에서 확인할 수 있습니다.
- **spec**
  - 무엇을: 목데이터 상태의 사이트를 Vercel Hobby(무료)에 배포
  - 어디서: GitHub `JungYOsup/church`(공개 저장소)를 Vercel에 연결. master에 push하면 운영 배포, 다른 branch는 미리보기 배포
  - 완료 조건:
    - 공개 URL에서 모든 라우트가 열리고, 없는 교회 id는 404
    - 홈 "다가오는 행사"가 빌드 날짜가 아니라 접속 시각 기준
    - 운영 도메인에서 카카오맵이 뜸
    - `npm run test` 통과
- **6축 위치:** 실행(task 단위 실행), 검증(테스트 먼저, 운영 주소에서 확인)

## 확인한 사실
- **정적인 라우트는 홈뿐입니다:**
  - `npm run build` 결과: `○ /`, `○ /_not-found`이고 나머지 7개는 `ƒ`(요청마다 그림)입니다.
  - 빌드 결과를 띄워 응답 헤더를 보면 `/`는 `Cache-Control: s-maxage=31536000`, `/events`는 `private, no-cache, no-store, max-age=0, must-revalidate`입니다.
  - 목데이터 날짜는 "그린 시각부터 며칠 뒤"로 만듭니다(`createMockEvents(now)`). 그래서 홈은 배포한 날을 기준으로 굳고, 며칠이 지나면 "다가오는 행사"에 지난 날짜가 남습니다.
  - `Header.tsx` 20~21행의 주석도 "다시 그리는 주기는 배포 작업에서 정한다"고 이 일을 미뤄 두었습니다.
- **Next 16의 `connection()`:** `next/server`에서 가져옵니다. `await connection()` 뒤의 코드는 요청 때만 돌고, 쿠키나 헤더 같은 요청 API를 쓰지 않으면서 `new Date()` 결과가 요청마다 달라야 할 때 씁니다(`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`). 요청마다 그리는 페이지는 `Cache-Control`이 `private, no-cache, no-store…`입니다(`02-guides/self-hosting.md` 99행).
- **Vercel(공식 문서):**
  - 사용할 수 있는 Node는 24.x(기본)·22.x·20.x이고, `package.json`의 `engines.node`가 프로젝트 설정보다 앞섭니다. `.nvmrc`는 문서에 나오지 않습니다(`/docs/functions/runtimes/node-js/node-js-versions`).
  - 함수 기본 지역은 `iad1`(워싱턴)이고 `vercel.json`의 `"regions"`로 바꿉니다. Hobby는 한 지역만 고를 수 있고, 서울은 `icn1`입니다(`/docs/functions/configuring-functions/region`, `/docs/regions`).
  - Hobby는 비상업 개인용입니다. 한도를 넘으면 과금되지 않고 그 기능이 30일 멈춥니다(`/docs/plans/hobby`).
- **카카오(ctx7 `/websites/developers_kakao_ko`):** JavaScript 키는 등록한 도메인에서만 요청을 받습니다. 도메인은 JavaScript 키 아래에서 설정하고, 최대 10개를 등록할 수 있습니다. http와 https 중 하나만 등록해도 둘 다 됩니다.
- **빌드에 걸림이 없는 것:**
  - husky `prepare`는 `.git`이 없으면 메시지만 돌려주고 실패하지 않습니다(`node_modules/husky/index.js`).
  - `@playwright/test`는 설치할 때 브라우저를 받지 않습니다.
  - 이미지는 모두 `public/images/` 안의 파일이라 `next.config.ts`를 바꿀 필요가 없습니다.
  - `.gitignore`에 이미 `.vercel`이 있습니다.
- **카카오 키는 빌드 때 번들에 박힙니다(`NEXT_PUBLIC_`).** 그래서 Vercel 환경변수를 바꾸면 다시 배포해야 합니다(`.env.example` 설명과 같음).
- **조사로 바뀐 점:** 처음에는 Node 버전을 `.nvmrc`로 맞출 수 있을 줄 알았지만, Vercel은 `engines`를 봐야 합니다.

## 결정
- **질문과 답:** 묻지 않았습니다. 사용자가 "내 저장소에서 배포"를 확인했습니다.
- **정한 것:**
  - **홈은 요청마다 그립니다(`await connection()`).** 주기적으로 다시 만드는 방식(ISR, `revalidate`)은 기한이 지난 뒤 첫 방문자에게 옛 페이지를 먼저 보여 줍니다. 가끔 들르는 포트폴리오에서는 그 첫 방문자가 바로 보여 주고 싶은 사람입니다. 다른 목록 페이지도 이미 요청마다 그려지고 있습니다. Supabase 단계에서 캐시 전략을 다시 정합니다.
  - **Node는 `engines: 22.x`로 고정합니다.** 로컬(`.nvmrc` 22)과 테스트 환경이 같아집니다.
  - **함수 지역은 `icn1`(서울)입니다.** 사용자가 국내에 있고, Supabase도 서울 지역에 둘 예정입니다.
  - **연결은 Vercel 대시보드에서 GitHub 저장소를 가져오는 방식입니다.** push마다 자동으로 배포되고 CLI 로그인이 필요 없습니다.
  - **카카오 키 환경변수는 Production에만 넣습니다.** 미리보기 주소는 배포마다 달라 카카오에 등록할 수 없습니다. 키가 없으면 SDK 요청 없이 바로 대체 화면이 나오고 콘솔 오류도 남지 않습니다.
  - **git:** branch `chore/vercel-deploy`에서 task마다 커밋하고, merge 커밋으로 master에 합친 뒤 `git push origin master`로 배포를 일으킵니다. 승인하시면 이 커밋과 push도 승인한 것으로 봅니다.

## Tasks
- [x] **T1. 홈을 요청마다 그리기**
  - 파일: `e2e/home.spec.ts`, `src/app/page.tsx`, `src/components/layout/Header.tsx`(주석)
  - 의존: 없음
  - 테스트 먼저(red): `e2e/home.spec.ts`에 "홈은 요청마다 새로 그린다" 테스트를 씁니다. `request.get("/")`의 `cache-control`에 `no-store`가 있는지 봅니다. `npm run test:e2e -- -g "요청마다"`를 돌리면 지금은 `s-maxage=31536000`이라 실패해야 합니다.
  - 구현: `HomePage`를 async로 바꾸고 맨 앞에 `await connection()`을 넣습니다(이유는 주석으로). Header 주석의 "배포 작업에서 정한다"를 실제 동작으로 고칩니다.
  - 확인(동작 증거):
    - `npm run build` 출력이 `ƒ /`입니다.
    - `npm run test`가 모두 통과합니다.
    - `connection()`을 빼면 새 테스트만 실패합니다. 확인한 뒤 되돌립니다.
  - 증거 (2026-10-07):
    - red: `npm run test:e2e -- -g "요청마다"` → `Expected substring: "no-store" / Received string: "s-maxage=31536000"`
    - green: `npm run build` → `┌ ƒ /`(나머지 라우트 그대로, `○ /_not-found`만 정적). `npm run lint` 통과, `npm run test` → 단위 `Tests 90 passed`, e2e `151 passed (43.3s)`
    - 깨뜨려 보기: `await connection()`을 주석 처리하자 `✘ 홈 렌더링 › 홈은 요청마다 새로 그린다`만 실패(`1 failed, 150 passed`). 되돌림
- [ ] **T2. Vercel 빌드 설정과 첫 배포**
  - 파일: `package.json`(`"engines": { "node": "22.x" }`), `vercel.json`(새 파일: `$schema`, `"regions": ["icn1"]`)
  - 의존: T1
  - 테스트 먼저(red): 해당 없음. 배포 플랫폼이 읽는 설정이라 로컬 테스트로 볼 동작이 없습니다. 아래 운영 응답으로 확인합니다.
  - 진행:
    1. 커밋하고 master에 merge한 뒤 push합니다(pre-commit이 `npm run test`를 돌립니다).
    2. **사용자가 할 일:** vercel.com에 GitHub 계정으로 가입(Hobby)합니다. Add New → Project에서 `JungYOsup/church`를 가져옵니다(Vercel GitHub 앱에 저장소 접근 허용). 프로젝트 이름을 정합니다(주소가 `<이름>.vercel.app`이 됨). Environment Variables에 `NEXT_PUBLIC_KAKAO_MAP_KEY`를 Production에만 넣고 Deploy합니다. 운영 URL을 알려 주시고, 빌드 로그에 찍힌 Node 버전도 봐 주세요.
  - 확인(동작 증거). `curl`로 운영 URL을 확인합니다:
    - `/`, `/map`, `/events`, `/notices`, `/community`, `/admin`, `/admin?tab=register`, `/search?q=교회`, `/churches/<목데이터 id>`가 200이고, 없는 교회 id는 404입니다.
    - `/`의 `cache-control`에 `no-store`가 있습니다.
    - 요청마다 그리는 페이지의 `x-vercel-id`에 `icn1`이 있습니다.
    - 홈 HTML의 첫 "다가오는 행사" 날짜가 오늘(서울) 이후입니다.
    - 빌드 로그의 Node가 22.x입니다.
    - 도메인을 아직 등록하지 않았으므로 지도 자리에는 대체 화면이 나옵니다. 운영에서도 대체 화면 경로가 동작한다는 증거입니다.
- [ ] **T3. 운영 도메인에서 카카오맵 띄우기**
  - 파일: 없음(카카오 콘솔 설정)
  - 의존: T2
  - 테스트 먼저(red): 해당 없음. 외부 콘솔 설정이고, e2e는 실제 카카오 서버를 쓰지 않습니다(`e2e/fixtures.ts`).
  - 진행: **사용자가 할 일:** 카카오 개발자 콘솔에서 JavaScript 키의 SDK 도메인에 `https://<이름>.vercel.app`을 더합니다. 지금 있는 `http://localhost:3000`은 그대로 둡니다.
  - 확인(동작 증거): scratchpad의 Playwright 스크립트(설치된 Chrome, 실제 SDK)로 운영 `/map`과 `/`를 엽니다.
    - 지도 영역에 "지도를 표시할 수 없습니다"가 없습니다.
    - `/map` 지도 영역의 핀 버튼이 15개입니다.
    - 콘솔 오류가 없습니다.
    - 375 / 1440px 스크린샷을 Read로 직접 봅니다.
- [ ] **T4. 문서 반영**
  - 파일: `CLAUDE.md`, `.env.example`, `docs/plans/2026-09-30-church-community.md`(변경 이력), `docs/lessons.md`, 이 계획서(검증 결과)
  - 의존: T3
  - 테스트 먼저(red): 해당 없음. 문서입니다.
  - 내용:
    - `CLAUDE.md`
      - Tech Stack의 배포 줄: 운영 URL, master push는 운영 배포, 다른 branch는 미리보기(지도는 대체 화면), 함수 지역 `icn1`
      - Rules의 "실제 지도는 localhost:3000에서만"을 운영 도메인까지로 고침
    - `.env.example`: 운영 키는 Vercel 환경변수(Production)에 넣고 운영 도메인을 카카오에 등록한다는 설명
    - 상위 계획서 변경 이력: 배포를 Supabase보다 먼저 한 것, 홈을 요청마다 그리기로 바꾼 것(2026-10-02 "다시 그리는 주기는 Supabase 때 정함"을 바꿈)
    - 배운 점: Vercel은 `.nvmrc` 대신 `engines`를 봄, 상대 날짜 목데이터와 정적 페이지가 만나면 생기는 문제, 그 밖에 진행하며 만난 함정
  - 확인(동작 증거): 문서의 URL과 주소가 실제 운영 주소와 같은지 `grep`으로 봅니다. 커밋하고 merge한 뒤 push합니다(문서만 바뀐 커밋이라 pre-commit은 건너뜀). 하네스 지도 갱신 요청이 오면 따릅니다.

## 리스크와 멈출 조건
- **Vercel 빌드 실패:** 빌드 로그 첫 오류를 받아 원인을 고치고 다시 push합니다. 로그를 볼 수 없으면 사용자에게 `! npx vercel login`을 부탁한 뒤 `vercel inspect --logs`로 봅니다.
- **환경변수를 빼고 배포한 경우:** 키는 빌드 때 박히므로 넣은 뒤 Redeploy해야 지도가 뜹니다.
- **`x-vercel-id`로 지역을 알 수 없는 경우:** 대시보드 Settings → Functions의 지역 표시로 확인합니다.
- **도메인을 등록해도 지도가 안 뜨는 경우:** 배운 점의 `ERR_BLOCKED_BY_ORB` 항목대로 SDK 응답 본문(403/401 사유)을 봅니다. 반영이 늦을 수 있어 몇 분 뒤 다시 봅니다.
- 계획 밖 결정(유료 기능, 커스텀 도메인, 코드 구조 변경)이 필요해지면 다음 task로 넘어가지 않고 묻습니다.

## 검증
- 전체 완료 조건: `npm run lint && npm run build`, `npm run test` 통과, T2·T3의 운영 확인 증거
- 화면 확인: 운영 URL을 375 / 1440px에서 봅니다(T3 스크린샷). 홈과 지도 모양은 로컬과 같아야 합니다.
- 일부러 깨뜨려 보기: `connection()`을 빼면 "홈은 요청마다 새로 그린다" e2e가 실패합니다. 확인한 뒤 되돌리고 `npm run test`로 다시 통과하는지 봅니다.

## 범위 밖
- README·스크린샷·GitHub 저장소 홈페이지 링크, CI(GitHub Actions): 다음 작업 후보
- 커스텀 도메인, Vercel Analytics·Speed Insights
- 미리보기 배포의 지도(대체 화면으로 둠)
- 404 페이지의 정적 헤더(목데이터 상대 시각이라 결과가 같음). Supabase 캐시 전략과 함께 봄
- Supabase 연동(2단계)

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다. 리뷰에서 반영하지 않은 지적은 이유와 함께 적는다 -->
