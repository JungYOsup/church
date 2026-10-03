# 공지 목록 페이지 (최신순, 분류 필터)

## Context
- 왜 하는가: 행사 목록에 이어 두 번째 실제 페이지로 `/notices`를 만듭니다. 지금은 "준비 중" 화면이고, 홈 "최근 공지"의 "더보기", 통계 카드 "공유 공지", 위쪽 메뉴 "공지"가 모두 이 페이지로 연결됩니다. 행사 페이지의 칩을 공통으로 올려, 다음 커뮤니티 페이지도 같은 칩을 쓰게 합니다.
- spec:
  - 무엇을: 공지 전체를 최신순으로 보여 주고, 분류 칩 하나를 골라 그 분류의 공지만 남기는 목록 페이지. 한 줄에 요약 한두 줄을 함께 보여 줌
  - 어디서: `src/app/notices/page.tsx`
  - 완료 조건: 공지 8개가 최신순으로 분류·날짜·교회·요약과 함께 보임. 분류 칩을 누르면 그 분류만 남고, 같은 칩을 다시 누르면 전체로 돌아옴. 행사 페이지 e2e는 고치지 않고 그대로 통과. e2e를 추가하고 `npm run test` 통과. 375 / 768 / 1440px에서 직접 확인
- 6축 위치: 실행(새 화면, 공통 컴포넌트), 검증(단위·e2e 추가)

## 확인한 사실
- **상위 계획서**(라우트, 반응형, 데이터 계층 절을 통째로 읽음):
  - `notices/page.tsx`는 "공지 목록 (카테고리 배지)"입니다.
  - 반응형은 "태블릿 2열, 모바일 1열"입니다. 행사 페이지는 이를 따라 카드 격자를 썼습니다.
  - 데이터 함수 목록에 `getRecentNotices()`가 있고, 컴포넌트는 `src/lib/data/` 함수로만 데이터를 받습니다.
  - 통계 카드 숫자(공유 공지 등)는 전국 수치라 목데이터와 맞추지 않습니다(2026-10-02 변경 이력).
- **참고 이미지:** 홈 한 장뿐이고 공지 페이지 디자인은 없습니다. 홈 "최근 공지" 칸의 한 줄(썸네일, 제목, 날짜·교회, 분류 배지)과 파스텔 배지 색을 따릅니다.
- **지금 코드:**
  - `Notice`(`src/lib/types.ts`)는 `id, churchId, title, category, publishedAt`이고 본문·요약이 없습니다. `NoticeCategory`는 `"행사안내" | "일정변경" | "모집안내" | "일반공지"` union입니다.
  - `getRecentNotices(limit)`(`src/lib/data/notices.ts`)는 `pickLatest(createMockNotices(now), publishedAt, limit)`에 교회 정보를 붙입니다. 쓰는 곳은 홈 `RecentNotices`의 `getRecentNotices(4)` 하나입니다.
  - 공지 분류 색(`CATEGORY_TONES`)은 `src/components/home/RecentNotices.tsx` 안에 있습니다. 대비는 홈 작업에서 4.92~6.87:1로 확인했습니다.
  - `FeedRow`(`home/`)는 64px 썸네일에 제목을 한 줄로 자르는 홈 칸 전용 줄입니다. 공지 페이지 줄은 요약이 들어가고 제목을 자르지 않아 모양이 다릅니다.
  - `EventTagFilter`(`src/components/event/`)는 경로 `/events`와 파라미터 `tag`가 박혀 있습니다. 칩 모양, `aria-current`, " 선택 해제"(`sr-only`), `scroll={false}`, `role="list"`가 이미 리뷰를 거쳤습니다.
  - `parseTagParam`(`src/lib/tags.ts`)은 이름과 달리 태그와 상관없는 일(주소값의 첫 값 꺼내기)을 합니다.
  - `pickLatest(items, dateOf, limit)`(`src/lib/timeline.ts`)는 `slice(0, limit)`이라 `Infinity`를 주면 전부입니다.
  - 레이아웃 `main`은 `max-w-[1600px]`입니다. 한 열 목록을 전체 폭으로 두면 1440px에서 요약 줄이 길어집니다.
- **목데이터**(`src/lib/mock/notices.ts`, `churches.ts`): 공지 8개이고 분류마다 정확히 2개입니다. 최신순으로 놓으면 다음과 같습니다.
  1. 특별새벽기도회에 여러분을 초대합니다 · 서연교회 · 행사안내 (-1일)
  2. 지역 연합 기도회 장소가 변경되었습니다 · 한강교회 · 일정변경 (-3)
  3. 다음세대 수련회 등록 안내 · 드림교회 · 모집안내 (-5)
  4. 교회 주차장 이용 안내 · 은혜교회 · 일반공지 (-8)
  5. 연합 찬양제 참가팀 모집 · 샘물교회 · 모집안내 (-11)
  6. 주일 예배 시간 변경 안내 · 서울교회 · 일정변경 (-14)
  7. 새가족 교육 과정 개강 · 새생명교회 · 행사안내 (-18)
  8. 교회 홈페이지 개편 안내 · 열린문교회 · 일반공지 (-25)
- **Next 16:** 행사 계획에서 확인한 것을 그대로 씁니다(같은 설치본). `searchParams`는 Promise이고 쓰면 요청마다 렌더링됩니다(`page.md` 117~121행). `PageProps<"/events">`처럼 전역 타입을 씁니다(`src/app/events/page.tsx`).
- **배운 점**(`docs/lessons.md`):
  - 검색어에 따라 바뀌는 탭 제목은 기본 미리 불러오기에서 어긋납니다. 탭 제목은 고정하고 `role="status"`로 알립니다.
  - Playwright 역할 이름은 부분 일치라 `exact: true`를 줍니다. 테스트 기대값은 앱 코드에서 가져오지 않습니다. 목데이터 날짜는 꼴만 봅니다.
  - 포커스 스타일은 `outline-hidden`, 목록 스타일을 지운 `ul`에는 `role="list"`, 본문 블록에는 `break-keep`.
  - 오래 띄운 개발 서버는 새 파일의 클래스를 빠뜨릴 때가 있습니다. 화면이 코드와 다르면 빌드 CSS와 비교합니다.
- **조사로 바뀐 점:**
  - spec-check는 `FeedRow`를 공유 위치로 옮긴다고 했지만, 공지 페이지 줄은 모양이 달라 `FeedRow`를 쓰지 않습니다. 그래서 `FeedRow`와 `CommunityFeed`는 고치지 않고, 분류 색표만 공지 폴더로 옮겨 홈과 페이지가 같이 씁니다.
  - `parseTagParam`을 공지에도 쓰므로 이름을 `parseSearchParam`으로 바꿔 `src/lib/search-params.ts`로 옮깁니다.

## 결정
- **질문과 답:** 공지 한 줄에 요약 한두 줄을 더합니다. `Notice`에 `summary`를 더하고 목데이터 8개에 요약을 씁니다.
- **정한 것:**
  - **필터 상태는 주소(`/notices?category=일정변경`)**에 두고 서버 페이지가 `searchParams`로 거릅니다. 행사 페이지와 같은 방식입니다.
  - **순수 로직:**
    - `src/lib/categories.ts`(짝 `categories.test.ts`): 커뮤니티 글(`PostCategory`)도 같이 쓰도록 `{ category: string }`에 대해 씁니다.
      - `collectCategories(items, order)`: `order` 순서대로, 항목이 하나라도 있는 분류만 돌려줍니다.
      - `filterByCategory(items, category)`: `null`이면 전부(새 배열), 아니면 분류가 정확히 같은 항목만 원래 순서대로 돌려줍니다.
    - `src/lib/search-params.ts`(짝 `search-params.test.ts`): `parseSearchParam(value)`. `tags.ts`의 `parseTagParam`을 이름만 바꿔 옮기고, 테스트도 옮깁니다.
  - **분류 순서는 한 곳에서:** `types.ts`에 `NOTICE_CATEGORIES = ["행사안내", "일정변경", "모집안내", "일반공지"] as const`를 두고 `NoticeCategory`를 여기서 만듭니다. 분류는 4개로 정해져 있어, 많이 쓰인 순서보다 고정 순서가 예측하기 쉽습니다.
  - **데이터 계층:**
    - `getRecentNotices({ limit?, category? } = {})`: `limit`가 없으면 전부입니다. 홈은 `{ limit: 4 }`로 고칩니다.
    - `getNoticeCategories()`: 공지가 있는 분류를 정해진 순서로 돌려줍니다. 칩을 눌러 빈 결과가 나오는 일이 없습니다.
  - **공통 칩:** `EventTagFilter`를 `src/components/common/FilterChips.tsx`로 옮기고 `label`(nav 이름), `basePath`, `param`, `options`, `selected`를 받게 합니다. 모양과 접근성 동작은 그대로입니다. 행사 페이지는 `label="태그 필터" basePath="/events" param="tag"`로 부르고 `EventTagFilter`는 지웁니다.
  - **분류 색:** `src/components/notice/categoryTones.ts`의 `NOTICE_CATEGORY_TONES`로 옮겨 `RecentNotices`와 공지 페이지가 같이 씁니다.
  - **화면 구성(위에서부터):**
    - 페이지 머리: `Bell` 아이콘(홈 칸과 같음), `h1` "공지", 설명 "교회들의 중요한 소식을 확인해보세요."(홈 칸과 같음)
    - 분류 칩: `FilterChips label="분류 필터"`. "전체" 다음에 분류 4개
    - 목록: `section` 안에 `h2` "공지 목록"과 개수(`role="status"`: "총 8개" / "일정변경 2개" / "맞는 공지 0개"), 흰 카드 안의 한 열 목록(`divide-y`)
  - **한 줄(`src/components/notice/NoticeItem.tsx`):** 왼쪽에 교회 사진 썸네일(모바일 64px, 640px부터 96px, `alt=""`), 가운데에 `h3` 제목(자르지 않고 줄바꿈) → 요약(`line-clamp-2`) → 날짜 · 교회, 오른쪽 위에 분류 배지. 요약에는 `max-w-prose`를 줘서 넓은 화면에서도 읽는 줄이 길어지지 않게 합니다. 상세 페이지가 없어 줄은 링크가 아닙니다.
  - **한 열 목록:** 상위 계획의 "태블릿 2열"과 다릅니다. 공지는 글 위주라 격자보다 줄 목록이 읽기 쉽기 때문입니다. 상위 계획서 변경 이력에 적습니다.
  - **탭 제목:** "공지"로 고정합니다.
  - **빈 결과:**
    - 칩에 없는 분류(잘못된 주소): 그 글자를 다시 적지 않고 "고른 분류의 공지가 없습니다."와 "전체 공지 보기" 링크를 보여 줍니다.
    - 공지가 아예 없을 때: 홈과 같은 "등록된 공지가 없습니다." 분류가 없으면 칩 줄을 그리지 않습니다.
  - **요약 문구(목데이터):** 가상의 내용이고 월·연도 같은 절대 날짜를 넣지 않습니다.
    - notice-5: 한 주 동안 새벽 5시 30분에 본당에서 함께 기도합니다. 이웃 교회 성도님도 누구나 오실 수 있습니다.
    - notice-2: 참석 인원이 늘어 장소를 본당에서 교육관 2층 대강당으로 옮깁니다. 모이는 시간은 그대로입니다.
    - notice-7: 중고등부 수련회 참가 신청을 받습니다. 교회 사무실이나 담당 교역자에게 신청해 주세요.
    - notice-3: 주일 오전에는 주차장이 붐비니 가까운 공영주차장을 이용해 주세요. 어르신과 장애인 차량은 먼저 안내합니다.
    - notice-6: 지역 교회 찬양팀이 함께 서는 연합 찬양제에 참가할 팀을 모집합니다. 팀마다 두 곡을 준비해 주세요.
    - notice-1: 다음 주일부터 2부 예배가 오전 11시에서 11시 30분으로 바뀝니다. 1부와 3부는 그대로입니다.
    - notice-8: 처음 오신 분을 위한 4주 과정의 새가족 교육을 시작합니다. 주일 예배 뒤 소예배실에서 모입니다.
    - notice-4: 홈페이지가 새 모습으로 바뀌었습니다. 예배 영상과 주보를 휴대폰에서도 편하게 볼 수 있습니다.

## Tasks
task 형식은 `run-plan`이 읽으므로 그대로 씁니다.

- [x] **T1. 분류 모으기·거르기 순수 로직**
  - 파일: `src/lib/categories.test.ts`, `src/lib/categories.ts`
  - 의존: 없음
  - 테스트 먼저(red): `categories.test.ts`를 먼저 쓰고 `npm run test:unit`. 테스트할 경우는 다음과 같습니다.
    - `collectCategories`: `order` 순서를 따름(항목 순서와 무관), 항목이 없는 분류는 뺌, 빈 목록은 빈 목록
    - `filterByCategory`: `null`이면 전부 원래 순서, 정확히 같은 분류만, 없는 분류는 빈 목록, 원래 객체 그대로, 입력 배열을 바꾸지 않음

    모양만 있는 빈 구현(`collectCategories`는 `order` 그대로, `filterByCategory`는 입력 그대로)에서 판단이 들어간 테스트가 실패하는 출력을 기록합니다.
  - 확인(동작 증거):
    - `npm run test:unit`이 모두 통과합니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): `collectCategories`가 항목에 나온 순서로 돌려주게 하면 순서 테스트만 실패합니다. `filterByCategory`가 `null`일 때 원래 배열을 그대로 돌려주면 "새 배열" 테스트만 실패합니다.
  - 증거:
    - Red(빈 구현): `Tests 7 failed (7)`. 판단이 들어간 7개가 모두 실패했습니다.
    - Green: `npm run test:unit` → `Test Files 5 passed (5)`, `Tests 57 passed (57)`
    - 깨뜨려 보기: 항목 순서로 돌려주기 → "정해진 순서로 돌려준다" 1개만 실패. `null`일 때 원래 배열 → "새 배열로 돌려준다" 1개만 실패. 되돌린 뒤 `57 passed`
    - `npm run lint` 오류 0건, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`
    - 리뷰 반영 뒤 재확인(`collectCategories`를 제네릭으로 바꿈): `57 passed`, 깨뜨려 보기 두 가지가 다시 각각 1개만 실패, 되돌린 뒤 `cmp`로 원본 확인
- [x] **T2. 칩과 주소값 해석을 공통으로 (행사 페이지 리팩터)**
  - 파일: `src/lib/search-params.test.ts`, `src/lib/search-params.ts`, `src/lib/tags.ts`, `src/lib/tags.test.ts`, `src/components/common/FilterChips.tsx`, `src/components/event/EventTagFilter.tsx`(삭제), `src/app/events/page.tsx`
  - 의존: 없음
  - 테스트 먼저(red): `tags.test.ts`의 `parseTagParam` 테스트를 `search-params.test.ts`의 `parseSearchParam` 테스트로 옮기고 `npm run test:unit`. `search-params.ts`가 없어서 그 파일만 실패하는 것을 봅니다. 동작은 바뀌지 않는 리팩터라 화면 동작의 새 테스트는 없습니다. 기존 `e2e/events.spec.ts`가 보증합니다.
  - 확인(동작 증거):
    - `npm run test:unit` 통과. `e2e/events.spec.ts` 10개가 **고치지 않은 채** 통과합니다(`npm run test:e2e -- e2e/events.spec.ts`).
    - `grep -rn "EventTagFilter\|parseTagParam" src e2e`가 아무것도 찾지 않습니다.
  - 증거:
    - Red 1(파일 없음): `Cannot find package '@/lib/search-params'`. 경로 문제와 구분되지 않아 `null`만 돌려주는 빈 구현을 두고 다시 돌렸습니다.
    - Red 2(빈 구현): `Tests 2 failed | 1 passed (3)`. "문자열은 그대로", "첫 값"이 실패하고 빈 값 테스트만 통과했습니다.
    - Green: `npm run test:unit` → `Test Files 6 passed (6)`, `Tests 57 passed (57)`(옮긴 3개는 개수가 같음)
    - `git diff --stat e2e/`가 비어 있는 상태에서 `npm run test:e2e -- e2e/events.spec.ts` → `10 passed (9.3s)`
    - `grep -rn "EventTagFilter\|parseTagParam" src e2e` → 결과 없음(exit 1)
    - `npm run lint` 오류 0건, `npm run build` → `✓ Compiled successfully`, `├ ƒ /events`
    - 칩 객체의 글자 필드를 `label` 대신 `text`로 했습니다. nav 이름 prop `label`과 이름이 겹쳐 가려지지 않게 하기 위함입니다.
- [x] **T3. 공지 데이터 계층에 요약과 분류 거르기 더하기**
  - 파일: `src/lib/types.ts`, `src/lib/mock/notices.ts`, `src/lib/data/notices.ts`, `src/components/home/RecentNotices.tsx`
  - 의존: T1
  - 테스트 먼저(red): 해당 없음 — 목데이터를 T1 함수와 `pickLatest`에 넘기기만 합니다. 고르는 판단은 T1과 `timeline.test.ts`가 테스트합니다.
  - 확인(동작 증거):
    - jiti 임시 스크립트(scratchpad) 출력으로 확인합니다.
      - `getRecentNotices()`: 8개가 위 "확인한 사실"의 최신순이고, 모두 `summary`가 있습니다.
      - `getRecentNotices({ category: "일정변경" })`: 지역 연합 기도회 장소 변경 → 주일 예배 시간 변경 2개
      - `getRecentNotices({ limit: 4 })`: 4개
      - `getNoticeCategories()`: `["행사안내", "일정변경", "모집안내", "일반공지"]`
    - 홈 e2e "홈 최근 공지" 2개가 그대로 통과합니다.
  - 증거:
    - jiti(`scratchpad/notices-check.ts`, 2026-10-03 실행):
      - `all: 8`. 서연교회 행사안내(10-02) → 한강교회 일정변경(09-30) → 드림교회 → 은혜교회 → 샘물교회 → 서울교회 → 새생명교회 → 열린문교회(09-08) 순서이고 모두 `summary=true`
      - `일정변경: [ '지역 연합 기도회 장소가 변경되었습니다', '주일 예배 시간 변경 안내' ]`
      - `limit 4: 4`
      - `categories: [ '행사안내', '일정변경', '모집안내', '일반공지' ]`
    - `npm run test:e2e -- -g "홈 최근 공지"` → `2 passed`
    - `npm run test:unit` → `57 passed`, `npm run lint` 오류 0건, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`
    - 리뷰 반영 뒤 재확인(`getNoticeCategories`가 `NoticeCategory[]`를 돌려줌): jiti 출력이 위와 같습니다(8개 순서, 일정변경 2개, limit 4, 분류 4개).
- [x] **T4. 공지 목록 페이지 (필터 없이)**
  - 파일: `e2e/notices.spec.ts`, `src/app/notices/page.tsx`, `src/components/notice/NoticeItem.tsx`, `src/components/notice/categoryTones.ts`, `src/components/home/RecentNotices.tsx`(색표 import)
  - 의존: T3
  - 테스트 먼저(red): `e2e/notices.spec.ts`의 "공지 목록" 묶음을 먼저 쓰고 `npm run test:e2e -- e2e/notices.spec.ts`. 지금은 준비 중 화면이라 새 테스트만 실패합니다.
    - `h1` "공지", 개수 "총 8개", 공지 8개가 최신순으로 `h3` 제목, 분류 배지, 날짜 꼴(`YYYY. M. D`), 교회, 요약과 함께 보임
    - 375 / 768 / 1440px에서 모든 줄의 왼쪽 위치가 같고(한 열), 가로 스크롤이 없음
  - 확인(동작 증거):
    - `npm run test` 전부 통과합니다.
    - 개발 서버(3000) 375 / 768 / 1440px 스크린샷: 홈 칸과 같은 배지 색, 흰 카드와 연회색 배경, 요약 두 줄 안, 가로 넘침과 콘솔 오류 없음
  - 증거:
    - Red: `npm run test:e2e -- e2e/notices.spec.ts` → `4 failed`(준비 중 화면이라 `status`·목록 줄을 찾지 못함)
    - Green: 같은 명령 → `4 passed (7.1s)`. `npm run test` → 단위 `57 passed`, e2e `61 passed (24.1s)`(기존 57 + 공지 목록 4)
    - `npm run lint` 오류 0건, `npm run build` → `✓ Compiled successfully`, `└ ○ /notices`(아직 `searchParams`를 읽지 않아 정적)
    - 화면(개발 서버 3001, 변경 이력 참고) 375 / 768 / 1440px: `overflow: false`, 콘솔 오류 `[]`. 배지 색이 홈 칸과 같고, 375px에서 요약이 두 줄에서 말줄임됩니다.
    - 첫 스크린샷에서 두 가지를 고쳤습니다(변경 이력 참고). 썸네일이 줄 높이만큼 늘어나 4:3이 깨짐 → `items-start`. 1440px에서 요약이 한글 30자 남짓에서 꺾임 → `max-w-prose` 대신 `max-w-4xl`
    - 리뷰 반영 뒤 재확인(`wrap-anywhere`, 배지의 쓸모없는 `shrink-0` 제거): 새 e2e "띄어쓰기 없는 긴 제목도 줄을 바꿔 375px에서 가로 스크롤을 만들지 않는다"를 고친 코드를 잠깐 되돌린 상태에서 돌려 red(`Expected: false`, `Received: true`)를 본 뒤 고친 코드로 green. 375 / 768 / 1440px 스크린샷이 그대로이고(한글 제목은 여전히 띄어쓰기에서 꺾임) `overflow: false`, 콘솔 오류 `[]`
- [x] **T5. 분류 필터**
  - 파일: `e2e/notices.spec.ts`, `src/app/notices/page.tsx`
  - 의존: T2, T4
  - 테스트 먼저(red): "공지 분류 필터" 묶음을 먼저 쓰고 `npm run test:e2e -- -g "공지 분류 필터"`. 칩이 없어서 새 테스트만 실패합니다.
    - 칩이 "전체, 행사안내, 일정변경, 모집안내, 일반공지" 순서이고 처음에는 "전체"가 선택됨
    - "일정변경"을 누르면 주소 `category=일정변경`, 2개만 남음, 고른 칩의 접근 이름 "일정변경 선택 해제", 개수 안내 "일정변경 2개"
    - 고른 칩을 다시 누르면 `/notices`로, 8개, "전체" 선택, 탭 제목 "공지 | 함께하는 교회"
    - `?category=모집안내`로 바로 들어오면 모집안내 2개
    - `?category=기도제목`(커뮤니티 분류라 공지에는 없음)이면 "고른 분류의 공지가 없습니다.", "맞는 공지 0개", `main`에 "기도제목"이 없음, 선택된 칩 없음, "전체 공지 보기"로 돌아감
  - 확인(동작 증거):
    - `npm run test` 전부 통과합니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): 페이지가 `category`를 무시하면 필터 동작 e2e만 실패합니다.
    - 개발 서버 375 / 768 / 1440px에서 `/notices?category=일정변경`: 칩 줄과 선택 상태, 포커스 ring
  - 증거:
    - Red: `npm run test:e2e -- -g "공지 분류 필터"` → `5 failed`(칩 nav가 없음)
    - Green: `npm run test` → 단위 `57 passed`, e2e `66 passed (23.2s)`(공지 목록 4 + 분류 필터 5 추가)
    - `npm run lint` 오류 0건, `npm run build` → `✓ Compiled successfully`, `└ ƒ /notices`(이제 요청마다 렌더링)
    - 깨뜨려 보기: 페이지가 `getRecentNotices()`로 `category`를 무시하게 하자 `e2e/notices.spec.ts`에서 필터 동작 4개만 실패(`4 failed`, `5 passed`)하고 칩 순서 테스트는 통과했습니다. 되돌린 뒤 `cmp`로 원본과 같음을 확인했습니다.
    - 화면(개발 서버 3001) 375 / 768 / 1440px의 `/notices?category=일정변경`: `overflow: false`, 콘솔 오류 `[]`. "일정변경" 칩이 파란 선택 상태이고, 키보드로 옮긴 "모집안내" 칩에 포커스 ring이 보입니다. 375px에서는 칩이 두 줄로 꺾여 모두 보입니다.
    - 리뷰 반영 뒤 재확인(`isKnownCategory`를 `some`으로, 칩 nav 찾기에 `exact: true`): `npm run test` → 단위 `57 passed`, e2e `67 passed (26.2s)`. `category` 무시 깨뜨려 보기 → 필터 동작 4개만 실패(`4 failed`, `6 passed`), 되돌린 뒤 `cmp` 확인. 화면 375 / 768 / 1440px `overflow: false`, 포커스 `모집안내`, 콘솔 오류 `[]`
- [x] **T6. 문서**
  - 파일: `CLAUDE.md`, `docs/plans/2026-09-30-church-community.md`, 이 계획서, (새 함정이 있으면) `docs/lessons.md`
  - 의존: T5
  - 테스트 먼저(red): 해당 없음 — 문서만 바꿉니다.
  - 확인(동작 증거):
    - CLAUDE.md Architecture에 `notices` 구현, `components/notice/`, `common/FilterChips`, `lib/categories.ts`·`search-params.ts`가 적혀 있고 `EventTagFilter`가 없습니다.
    - 상위 계획서 변경 이력에 범위, 요약 필드, 한 열 목록(태블릿 2열과 다름), 공통 칩이 적혀 있습니다.
  - 증거:
    - `grep -n "EventTagFilter" CLAUDE.md` → 결과 없음. Architecture에 `notices` 구현, `src/components/notice/`, `common/` FilterChips, `categories.ts`·`search-params.ts`, `types.ts`의 `NOTICE_CATEGORIES`를 적었습니다.
    - 상위 계획서 203행에 "2026-10-03: 공지 목록 페이지" 항목(범위, 요약 필드, 분류 칩 순서, 한 열 목록, 공통으로 올린 것, 데이터 함수, 탭 제목)을 더했습니다.
    - `docs/lessons.md`에 새 함정 3개를 더했습니다: `next start`와 빌드를 함께 돌리면 chunk 404, flex `stretch`가 썸네일 비율을 깨뜨림, 한글 본문에 `max-w-prose`를 쓰지 않음.
    - 리뷰 반영 뒤 2개를 더했습니다: `git rm`만 staging된 채 커밋하면 pre-commit이 못 잡음, 띄어쓰기 없는 긴 글은 `wrap-anywhere`.

## 리스크와 멈출 조건
- **칩을 옮기며 행사 페이지 동작이 바뀜:** T2는 `e2e/events.spec.ts`를 고치지 않고 통과시키는 것이 완료 조건입니다. 테스트를 고쳐야 통과한다면 동작이 바뀐 것이므로 원인을 찾아 코드를 맞춥니다.
- **1440px에서 한 열 목록이 너무 넓어 보임:** 요약에 `max-w-prose`를 줍니다. 그래도 어색하면 목록 폭 제한을 시험하고, 화면 구성이 크게 바뀌면 묻습니다.
- 계획 밖 결정(범위·데이터 구조 변경, 새 의존성, 되돌리기 어려운 작업)이 필요해지면 다음 task로 넘어가지 않고 사용자에게 묻습니다.

## 검증
- 전체 완료 조건: `npm run test:unit && npm run lint && npm run build`(`├ ƒ /notices`), `npm run test`(단위 + e2e)
- 화면 확인: `npm run dev`(3000)에서 375 / 768 / 1440px의 `/notices`와 `/notices?category=일정변경`. 홈 "최근 공지" 칸과 배지 색·글자 크기가 어울리는지 봅니다.
- 일부러 깨뜨려 보기: T1(순서, 새 배열), T5(`category` 무시). 확인한 뒤 되돌리고 `npm run test`로 원래 상태가 통과하는지 다시 봅니다.
- 흔들림: `e2e/notices.spec.ts --repeat-each=5`

## 범위 밖
- 공지 상세 페이지와 줄 링크, 본문 전체
- 여러 분류 고르기, 교회·날짜 필터, 검색, 페이지 나누기
- 커뮤니티 페이지(이번에 만든 `FilterChips`·`categories.ts`를 그때 씀)
- `FeedRow`·`CommunityFeed` 변경
- 통계 카드 "공유 공지" 숫자 맞추기
- 커밋(요청할 때만)

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->
- 2026-10-03 (T4): 요약의 폭 제한을 `max-w-prose`에서 `max-w-4xl`(896px)로 바꿨습니다.
  - `max-w-prose`는 `65ch`이고, `ch`는 숫자 0의 폭이라 한글로는 30자 남짓입니다. 1440px 스크린샷에서 짧은 요약도 두 줄로 꺾여 줄 오른쪽이 크게 비었습니다.
  - `max-w-4xl`에서는 데스크톱에서 요약이 한 줄에 들어가고, 읽는 줄은 한글 60자 남짓으로 묶입니다.
- 2026-10-03 (T4): 줄에 `items-start`를 더했습니다. 기본 `stretch`이면 썸네일이 줄 높이만큼 늘어나 `aspect-4/3`이 무시되었습니다(375px에서 세로로 긴 사진).
- 2026-10-03 (T4): 화면 확인을 3000이 아니라 3001의 개발 서버로 했습니다.
  - 3000에는 다른 Claude 세션이 띄운 `npm run start`(프로덕션 서버)가 떠 있었습니다.
  - 그 서버는 `.next`를 읽는데, 이 작업의 `npm run build`·`npm run test`가 `.next`를 다시 만들어 그 서버의 chunk가 404·500을 냈습니다. 그 세션의 서버라 끄지 않았습니다.
- 2026-10-03 (마무리, `/code-review` 반영): 지적 12개 가운데 사실로 확인되고 고칠 가치가 있는 5개를 반영했습니다. T1·T3·T4·T5의 체크를 풀고 다시 확인했습니다.
  - **#2 삭제만 staged(T2):** `git rm`으로 `EventTagFilter.tsx` 삭제만 index에 올라가 있었습니다(`git status`의 `D `). 그대로 `git commit`하면 행사 페이지가 지운 파일을 import하는 커밋이 생기고, pre-commit은 작업 폴더를 검사하므로 통과합니다. `git restore --staged`로 내렸습니다. 커밋할 때 task별로 함께 올립니다.
  - **#3 긴 제목이 카드 밖으로 넘침(T4):** 띄어쓰기 없는 긴 제목을 375px 화면에 넣자 `scrollWidth` 605px로 가로 스크롤이 생겼습니다(재현). 글 칸에 `wrap-anywhere`(Tailwind v4, ctx7로 확인)를 주고, 화면에서 제목을 바꿔 보는 e2e를 먼저 써서 red를 본 뒤 고쳤습니다. e2e가 66개에서 67개가 되었습니다.
  - **#7 칩 nav 찾기에 `exact: true`(T5):** 배운 점(역할 이름은 부분 일치)대로 `e2e/notices.spec.ts`와 `e2e/events.spec.ts`의 nav 찾기에 `exact: true`를 줬습니다. T2의 "행사 e2e를 고치지 않은 채 통과"는 T2 시점의 증거이고, 이 수정은 그 뒤의 테스트 보강입니다.
  - **#10·#4 분류 타입 유지(T1·T3·T5):** `collectCategories`를 `<C extends string>` 제네릭으로 바꿔 `getNoticeCategories`가 `NoticeCategory[]`를 돌려줍니다. `order`에 없는 분류는 돌려주지 않는다는 점을 주석에 적고, 분류 타입을 `order`와 같게 두어 타입 수준에서 막습니다. 페이지의 `includes`는 `some`으로 바꿨습니다(문자열을 좁은 타입 배열에 넣을 수 없어서).
  - **#12 배지의 `shrink-0`(T4):** shadcn Badge 기본 클래스에 이미 있어(`badge.tsx` 7행) 빼고 `cn`도 지웠습니다.

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다. 리뷰에서 반영하지 않은 지적은 이유와 함께 적는다 -->
- **전체 완료 조건(2026-10-03):**
  - `npm run test:unit` → `Test Files 6 passed (6)`, `Tests 57 passed (57)`
  - `npm run lint` → 오류·경고 0건
  - `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `├ ƒ /events`, `└ ƒ /notices`
  - `npm run test` → 단위 57개 다음 e2e `66 passed (24.8s)`. 기존 57개 + 공지 목록 4개 + 분류 필터 5개입니다. `e2e/events.spec.ts`와 `e2e/home.spec.ts`는 고치지 않았습니다.
  - 리뷰 반영 뒤: `npm run lint` 0건, `npm run build` → `└ ƒ /notices`, `npm run test` → 단위 `57 passed`, e2e `67 passed (26.2s)`(긴 제목 1개 추가). `e2e/events.spec.ts`는 nav 찾기에 `exact: true`만 더했습니다.
- **화면 확인:** 개발 서버(3001) 375 / 768 / 1440px의 `/notices`(T4)와 `/notices?category=일정변경`(T5)
  - 가로 넘침과 콘솔 오류가 없습니다.
  - 배지 색이 홈 "최근 공지" 칸과 같고, 흰 카드와 연회색 배경, 파란 강조입니다.
  - 썸네일이 4:3을 지키고, 375px에서 요약이 두 줄에서 말줄임됩니다. 1440px에서는 한 줄입니다.
  - 칩이 줄을 바꿔 모두 보이고, 키보드 포커스 ring이 보입니다.
- **일부러 깨뜨려 보기:** 확인한 뒤 모두 되돌렸고, 되돌린 상태에서 위의 `npm run test`가 통과합니다.
  - T1 항목 순서로 분류 돌려주기 → "정해진 순서로 돌려준다" 1개만 실패
  - T1 `null`일 때 원래 배열 돌려주기 → "새 배열로 돌려준다" 1개만 실패
  - T5 페이지가 `category` 무시 → 필터 동작 e2e 4개만 실패
- **흔들림:** `e2e/notices.spec.ts --repeat-each=5` → `45 passed (15.7s)`. 리뷰 반영 뒤 `e2e/notices.spec.ts e2e/events.spec.ts --repeat-each=5` → `100 passed (30.4s)`
- **독립 리뷰(`/code-review`):** 지적은 12개였습니다(확정 버그는 없다는 판단, 단위 57개·`tsc --noEmit` 통과). 반영한 5개(#2, #3, #4·#10, #7, #12)는 변경 이력에 적었습니다. 반영하지 않은 6개와 그 이유는 다음과 같습니다.
  - **#1 주소의 분류를 데이터 함수가 검사하지 않음(Supabase enum이면 500):** 목데이터에서는 빈 목록으로 정상 동작합니다. Supabase로 바꿀 때 함수 안쪽만 고치는 규칙대로, 그때 `NOTICE_CATEGORIES`에 없는 값은 쿼리 전에 빈 목록으로 돌려주면 됩니다. 열을 enum으로 할지 text로 할지도 그 단계의 결정이라 지금 정하지 않습니다.
  - **#5 `category: ""`이면 빈 결과:** 주소 값은 항상 `parseSearchParam`을 거쳐 빈 값이 `null`이 됩니다. 지금 다른 호출처는 없습니다.
  - **#6 NFD 한글:** 행사 페이지 리뷰 #7과 같은 이유입니다. 칩은 NFC 값 하나만 만들고, 손으로 만든 주소는 빈 안내와 "전체 공지 보기"로 돌아올 수 있습니다.
  - **#8 개수 문구·빈 안내·링크 클래스가 행사 페이지와 겹침:** 행사 페이지 리뷰 #12에서 "세 번째가 생기면 묶는다"로 정했습니다. 커뮤니티 페이지가 세 번째이므로 그때 `common/`으로 묶습니다.
  - **#9 목데이터를 두 번 만들고 배열을 두 번 복사:** 행사 페이지 리뷰 #8·#13과 같은 이유입니다. 공지 8개에서는 비용이 무시할 만하고, Supabase 단계에서 한 쿼리로 합칠지 정합니다.
  - **#11 커뮤니티 글 분류 색이 아직 `CommunityFeed` 안에 있음:** 범위 밖(`CommunityFeed` 변경 안 함)으로 정했습니다. 커뮤니티 페이지에서 공지처럼 옮깁니다.
