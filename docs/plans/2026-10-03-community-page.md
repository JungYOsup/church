# 커뮤니티 글 목록 페이지 (최신순, 분류 필터)

## Context
- 왜 하는가:
  - 행사·공지에 이어 세 번째 목록 페이지로 `/community`를 만듭니다.
  - 지금은 "준비 중" 화면입니다. 홈 "커뮤니티 최신 글"의 "더보기"와 위쪽 메뉴 "커뮤니티"가 이 페이지로 연결됩니다.
  - 공지 작업에서 공통으로 올린 칩(`FilterChips`)과 분류 거르기(`categories.ts`)를 그대로 씁니다.
  - 카카오맵 작업과 섞이지 않게 워크트리 `/Users/anderson/Documents/claudeProject/church-community`(branch `feat/community-page`, master `f7c2c4f` 기반)에서 진행합니다.
- spec:
  - 무엇을: 커뮤니티 글 전체를 최신순으로 보여 주고, 분류 칩 하나를 골라 그 분류의 글만 남기는 목록 페이지. 줄마다 본문 미리보기 두 줄
  - 어디서: `src/app/community/page.tsx`
  - 완료 조건:
    - 글 8개가 최신순으로 보이고, 줄마다 분류, 지난 시간, 교회, 미리보기가 있습니다.
    - 분류 칩을 누르면 그 분류만 남고, 같은 칩을 다시 누르면 전체로 돌아옵니다.
    - 공지 페이지 e2e는 고치지 않은 채 통과합니다.
    - e2e를 추가하고 `npm run test`가 통과합니다. 375 / 768 / 1440px에서 직접 확인합니다.
- 6축 위치: 실행(새 화면, 공통 컴포넌트), 검증(e2e 추가)

## 확인한 사실
- **상위 계획서**(라우트, 데이터 계층, 반응형 절과 변경 이력을 통째로 읽음):
  - `community/page.tsx`는 "커뮤니티 글 목록"이고, 목데이터의 글은 8~10개입니다.
  - 공지 변경 이력에 "행사 페이지의 태그 칩을 `common/FilterChips`로 옮겨 두 페이지가 같이 씀. 커뮤니티 페이지도 이것을 씀"과 "분류 거르기는 `categories.ts`. 커뮤니티 글 분류에도 씀"이 있습니다.
  - 공지는 "태블릿 2열" 대신 모든 폭에서 한 열 줄 목록으로 정했습니다(글 위주라 줄 목록이 읽기 쉬움).
- **지금 코드:**
  - `Post`(`src/lib/types.ts`)는 `id, churchId, title, category, createdAt, imageUrl`입니다. 본문과 미리보기가 없습니다. `PostCategory`는 `"기도제목" | "사역나눔" | "선교소식" | "봉사후기"` union입니다.
  - `getRecentPosts(limit)`(`src/lib/data/posts.ts`)는 `pickLatest(createMockPosts(now), createdAt, limit)`에 교회 정보를 붙입니다. 쓰는 곳은 홈 `CommunityFeed`의 `getRecentPosts(4)` 하나입니다.
  - 글 분류 색(`CATEGORY_TONES`)은 `src/components/home/CommunityFeed.tsx` 안에 있습니다(rose, blue, green, orange).
  - `NoticeItem`(`src/components/notice/`)은 공지 페이지의 한 줄입니다.
    - 썸네일, `h3` 제목과 분류 배지, 미리보기 두 줄, 날짜·교회로 되어 있습니다.
    - 리뷰와 스크린샷에서 고친 것 세 가지가 들어 있습니다: `items-start`(썸네일 비율), `wrap-anywhere`(긴 제목), `max-w-4xl`(한글 줄 폭).
    - 커뮤니티 줄은 이와 같은 모양이고, 사진 출처, 시간 표기, 필드 이름만 다릅니다.
  - `FilterChips`, `parseSearchParam`, `collectCategories`, `filterByCategory`는 모두 제네릭이고 단위 테스트가 있습니다. 이번에는 새 순수 로직이 생기지 않습니다.
  - `formatRelativeTime(iso, now)`(`src/lib/datetime.ts`)는 "N분/N시간/N일 전"으로 적고, 7일이 지나면 날짜로 적습니다.
  - `CommunityFeed`는 데이터를 받은 **뒤에** `now`를 잡습니다. 그래야 지난 시간이 단위 경계 아래로 내려가지 않습니다.
- **목데이터**(`src/lib/mock/posts.ts`, `churches.ts`): 글 8개이고 분류마다 정확히 2개입니다. 최신순으로 놓으면 다음과 같습니다.
  1. 이번 주 지역 전도 활동을 위해 기도해주세요 · 사랑의교회 · 기도제목 · 2시간 전
  2. 청년부 연합 예배가 은혜 가운데 진행되었습니다! · 한강교회 · 사역나눔 · 5시간 전
  3. 선교지 소식과 기도편지를 나눕니다 · 드림교회 · 선교소식 · 1일 전
  4. 지역 어르신들을 위한 봉사활동 이야기 · 은혜교회 · 봉사후기 · 1일 전
  5. 주일학교 교사 모집에 함께해 주세요 · 기쁨교회 · 사역나눔 · 3일 전
  6. 단기선교 준비를 위해 기도 부탁드립니다 · 열매교회 · 기도제목 · 5일 전
  7. 연탄 나눔 봉사 후기 · 하늘빛교회 · 봉사후기 · 날짜(8일 전)
  8. 선교사님 귀국 보고 모임 소식 · 생명샘교회 · 선교소식 · 날짜(12일 전)
  - 시간 단위 글(2·5·26·30시간)은 경계에서 10분 비켜 있습니다. 날짜 단위 글(3·5·8·12일)은 정확히 경계 위에 있습니다.
- **홈 e2e**(`e2e/home.spec.ts` 328행): 홈 칸의 글 4개(1~4번)와 지난 시간을 기대값으로 적고 있습니다. 데이터 함수의 모양이 바뀌어도 이 테스트는 그대로 통과해야 합니다.
- **Next 16:** 행사·공지 페이지와 같은 방식입니다. `searchParams`는 Promise이고 읽으면 요청마다 그립니다. 타입은 `PageProps<"/community">`입니다(`src/app/notices/page.tsx`).
- **배운 점**(`docs/lessons.md`):
  - 검색어에 따라 바뀌는 탭 제목은 기본 미리 불러오기에서 어긋납니다. 탭 제목은 고정하고 `role="status"`로 알립니다.
  - `next start`와 빌드를 함께 돌리면 chunk가 404를 냅니다. 화면 확인은 다른 포트의 `next dev`로 합니다.
  - Playwright 역할 이름에는 `exact: true`를 줍니다. 기대값은 앱 코드에서 가져오지 않습니다.
- **워크트리:**
  - Stop hook과 PreToolUse hook은 `$CLAUDE_PROJECT_DIR` 기준으로 돕니다. 이 세션의 스킬 경로가 원래 폴더(`church/`)로 나와, hook은 워크트리가 아니라 원래 폴더를 볼 가능성이 큽니다.
  - pre-commit은 `core.hooksPath=.husky/_`(상대 경로)라 워크트리에서 커밋하면 워크트리의 `.husky/pre-commit`이 돕니다.
  - 워크트리에는 `.env.local`이 없어 지도는 대체 화면입니다. 홈 e2e의 기대와 같습니다.
  - Node 22는 `env PATH=/Users/anderson/.nvm/versions/node/v22.14.0/bin:… npm …` 꼴로 씁니다. 이 세션에서는 `source nvm.sh`가 막힙니다.
- **조사로 바뀐 점:** 커뮤니티 줄은 `NoticeItem`과 모양이 같습니다. 그래서 한 번 더 베끼지 않고, 그 줄을 `common/ArticleRow`로 올려 두 페이지가 같이 씁니다. 공지 줄에 들어간 세 가지 수정이 한 곳에만 있게 하기 위함입니다.

## 결정
- **질문과 답:** 글 한 줄에 본문 미리보기 두 줄을 넣습니다. `Post`에 `excerpt`(목록에 보여 줄 본문 앞부분)를 더하고 목데이터 8개에 씁니다.
- **정한 것:**
  - **필터 상태는 주소(`/community?category=기도제목`)**에 둡니다. 서버 페이지가 `searchParams`로 거릅니다. 행사·공지와 같습니다.
  - **분류 순서는 한 곳에서:** `types.ts`에 `POST_CATEGORIES = ["기도제목", "사역나눔", "선교소식", "봉사후기"] as const`를 두고 `PostCategory`를 여기서 만듭니다. 지금 union의 순서입니다.
  - **데이터 계층:**
    - `getRecentPosts({ limit?, category? } = {})`: `limit`가 없으면 전부입니다. 홈은 `{ limit: 4 }`로 고칩니다.
    - `getPostCategories()`: 글이 있는 분류를 정해진 순서로 돌려줍니다.
  - **날짜 경계 비키기:** 날짜 단위 글 4개(3·5·8·12일)에도 10분을 더합니다. 목데이터 주석의 규칙("단위가 바뀌는 경계에서 10분쯤 비켜 둔다")을 날짜에도 맞추는 것입니다. 홈에 보이는 1~4번은 바뀌지 않습니다.
  - **공통 한 줄:** `NoticeItem`의 마크업을 `src/components/common/ArticleRow.tsx`로 옮기고 `NoticeItem`은 지웁니다.
    - 받는 값: `imageUrl`, `title`, `category`, `categoryClassName`, `excerpt`, `meta`(ReactNode)
    - 공지 페이지는 교회 사진, 요약, "날짜 · 교회"를 넘깁니다. 커뮤니티 페이지는 글 사진, 미리보기, "교회 · N시간 전"(홈 칸과 같은 순서)을 넘깁니다.
  - **분류 색:** `src/components/post/categoryTones.ts`의 `POST_CATEGORY_TONES`로 옮겨 홈 `CommunityFeed`와 페이지가 같이 씁니다. 공지의 `notice/categoryTones.ts`와 같은 꼴입니다.
  - **지난 시간:** 페이지는 데이터를 받은 뒤에 `now`를 잡아 `formatRelativeTime`으로 적습니다(`CommunityFeed`와 같음). 요청마다 그리는 페이지라 요청 시각 기준으로 맞습니다.
  - **화면 구성(위에서부터):**
    - 페이지 머리: `Users` 아이콘, `h1` "커뮤니티", 설명 "교회들의 이야기와 기도제목을 나눠주세요."(홈 칸과 같음)
    - 분류 칩: `FilterChips label="분류 필터" basePath="/community" param="category"`
    - 목록: `section` 안에 `h2` "글 목록"과 개수(`role="status"`: "총 8개" / "기도제목 2개" / "맞는 글 0개"), 흰 카드 안의 한 열 목록(`divide-y`)
  - **빈 결과:**
    - 칩에 없는 분류: 그 글자를 다시 적지 않고 "고른 분류의 글이 없습니다."와 "전체 글 보기" 링크를 보여 줍니다.
    - 글이 아예 없을 때: 홈과 같은 "아직 올라온 글이 없습니다." 분류가 없으면 칩 줄을 그리지 않습니다.
  - **탭 제목:** "커뮤니티"로 고정합니다(지금과 같음).
  - **페이지 틀은 공통으로 올리지 않습니다:** 머리·칩·개수·빈 안내의 짜임은 공지와 같지만, 문구가 모두 다르고 쓰는 곳이 두 곳뿐입니다.
  - **카카오 작업과 겹치는 파일은 건드리지 않습니다:** `MapPreview`, `e2e/fixtures.ts`, `e2e/home.spec.ts`, `playwright.config.ts`, `.env.example`
  - **미리보기 문구(목데이터):** 가상의 내용이고, 계절·월·연도 같은 절대 시점을 넣지 않습니다.
    - post-3 (전도 기도): 토요일 오후 동네 공원에서 전도지와 따뜻한 차를 나눕니다. 처음 나가는 청년들이 담대하게 섬길 수 있도록 기도해 주세요.
    - post-7 (청년부 연합 예배): 다섯 교회 청년부가 함께 모여 찬양하고 말씀을 나눴습니다. 준비해 주신 교회들과 섬겨 주신 모든 분께 감사드립니다.
    - post-1 (선교지 소식): 현지 교회와 함께 시작한 어린이 성경학교 소식을 전합니다. 아이들이 매주 서른 명 넘게 모이고 있습니다.
    - post-5 (어르신 봉사): 청년들과 함께 홀로 지내시는 어르신 댁을 찾아 반찬을 전하고 말벗이 되어 드렸습니다. 다음 방문에도 함께해 주세요.
    - post-4 (주일학교 교사): 아이들과 함께 말씀을 배우고 자랄 주일학교 교사를 찾습니다. 처음 섬기시는 분도 교사 교육부터 함께합니다.
    - post-8 (단기선교 기도): 청년 열두 명이 곧 떠날 단기선교를 준비하고 있습니다. 언어 공부와 건강, 현지 사역을 위해 함께 기도해 주세요.
    - post-2 (연탄 나눔): 성도 서른 명이 언덕 위 마을에 연탄 이천 장을 날랐습니다. 끝까지 함께해 주신 모든 분께 감사드립니다.
    - post-6 (선교사 귀국 보고): 선교지에서 사역하신 선교사님이 잠시 귀국해 보고 모임을 엽니다. 주일 오후 예배 뒤 본당에서 함께 모입니다.

## Tasks
task 형식은 `run-plan`이 읽으므로 그대로 씁니다.

- [x] **T1. 목록 한 줄을 공통으로 (공지 페이지 리팩터)**
  - 파일: `src/components/common/ArticleRow.tsx`, `src/components/notice/NoticeItem.tsx`(삭제), `src/app/notices/page.tsx`
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음 — 동작이 바뀌지 않는 리팩터입니다. 기존 `e2e/notices.spec.ts` 10개가 보증합니다.
  - 확인(동작 증거):
    - `git diff --stat e2e/`가 빈 상태에서 `npm run test:e2e -- e2e/notices.spec.ts` 10개가 **고치지 않은 채** 통과합니다.
    - `grep -rn "NoticeItem" src e2e`가 아무것도 찾지 않습니다.
    - 1440px `/notices` 목록 영역 스크린샷이 리팩터 전후로 같습니다. 개발 서버(3002)에서 같은 날짜에 찍어 `cmp`로 비교합니다.
  - 증거:
    - 목록 영역(`section[aria-labelledby="notice-list-title"]`) 스크린샷을 개발 서버 3002에서 리팩터 전후로 찍었습니다. 1440px와 375px 모두 `cmp`가 같다고 나왔습니다(바이트까지 같음). `overflow: false`, 콘솔 오류 `[]`
    - `git diff --stat e2e/`가 빈 상태에서 `npm run test:e2e -- e2e/notices.spec.ts` → `10 passed (15.8s)`
    - `grep -rn "NoticeItem" src e2e` → 결과 없음(exit 1). 삭제는 staging하지 않고 작업 폴더에만 둡니다(공지 계획의 "삭제만 staged" 함정).
    - `npm run test:unit` → `57 passed`, `npm run lint` exit 0, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `└ ƒ /notices`
- [x] **T2. 글 데이터 계층에 미리보기와 분류 거르기 더하기**
  - 파일: `src/lib/types.ts`, `src/lib/mock/posts.ts`, `src/lib/data/posts.ts`, `src/components/post/categoryTones.ts`, `src/components/home/CommunityFeed.tsx`
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음 — 목데이터를 이미 테스트된 `filterByCategory`·`collectCategories`·`pickLatest`에 넘기기만 합니다.
  - 확인(동작 증거):
    - jiti 임시 스크립트(scratchpad) 출력으로 확인합니다.
      - `getRecentPosts()`: 8개가 위 "확인한 사실"의 최신순이고, 모두 `excerpt`가 있습니다.
      - `getRecentPosts({ category: "기도제목" })`: 지역 전도 기도 → 단기선교 기도 2개
      - `getRecentPosts({ limit: 4 })`: 4개
      - `getPostCategories()`: `["기도제목", "사역나눔", "선교소식", "봉사후기"]`
    - 홈 e2e "홈 커뮤니티 최신 글" 2개가 그대로 통과합니다. 홈 칸의 배지 색이 바뀌지 않습니다.
  - 증거:
    - jiti(`scratchpad/posts-check.ts`, 2026-10-03 실행):
      - `all: 8`. 사랑의교회 기도제목 2시간 전 → 한강교회 사역나눔 5시간 전 → 드림교회 선교소식 1일 전 → 은혜교회 봉사후기 1일 전 → 기쁨교회 사역나눔 3일 전 → 열매교회 기도제목 5일 전 → 하늘빛교회 봉사후기 `2026. 9. 25` → 생명샘교회 선교소식 `2026. 9. 21`. 모두 `excerpt=true`
      - `기도제목: [ '이번 주 지역 전도 활동을 위해 기도해주세요', '단기선교 준비를 위해 기도 부탁드립니다' ]`
      - `limit 4: 4`
      - `categories: [ '기도제목', '사역나눔', '선교소식', '봉사후기' ]`
    - `npm run test:e2e -- -g "홈 커뮤니티 최신 글"` → `2 passed (6.8s)`. 배지 색은 `CommunityFeed`의 문자열 4개를 그대로 `POST_CATEGORY_TONES`로 옮겼습니다.
    - `npm run test:unit` → `57 passed`, `npm run lint` exit 0, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `┌ ○ /`(홈은 그대로 정적)
- [x] **T3. 커뮤니티 목록 페이지 (필터 없이)**
  - 파일: `e2e/community.spec.ts`, `src/app/community/page.tsx`
  - 의존: T1, T2
  - 테스트 먼저(red): `e2e/community.spec.ts`의 "커뮤니티 글 목록" 묶음을 먼저 쓰고 `npm run test:e2e -- e2e/community.spec.ts`. 지금은 준비 중 화면이라 새 테스트가 모두 실패합니다.
    - `h1` "커뮤니티", 개수 "총 8개"
    - 글 8개가 최신순이고, 줄마다 `h3` 제목, 분류 배지, 미리보기, 교회가 보입니다.
    - 지난 시간이 1~6번은 "2시간 전 / 5시간 전 / 1일 전 / 1일 전 / 3일 전 / 5일 전", 7~8번은 날짜 꼴(`YYYY. M. D`)입니다.
    - 375 / 768 / 1440px에서 모든 줄의 왼쪽 위치가 같고(한 열), 가로 스크롤이 없습니다.
  - 확인(동작 증거):
    - `npm run test` 전부 통과합니다.
    - 개발 서버(3002) 375 / 768 / 1440px 스크린샷을 봅니다. 홈 칸과 배지 색이 같고, 썸네일이 4:3이고, 미리보기가 두 줄 안에 들고, 가로 넘침과 콘솔 오류가 없어야 합니다.
  - 증거:
    - Red: `npm run test:e2e -- e2e/community.spec.ts` → `4 failed`(준비 중 화면이라 `status`를 찾지 못하고 줄이 0개)
    - 첫 red 시도는 `http://localhost:3100 is already used`로 돌지 못했습니다. 원래 폴더(`church/`)의 `next-server`가 3100을 쓰고 있었습니다(다른 세션의 e2e). 그 서버는 건드리지 않고, 포트가 빈 뒤 다시 돌렸습니다.
    - Green: 같은 명령 → `4 passed (7.0s)`. `npm run test` → 단위 `57 passed`, e2e `71 passed (25.5s)`(기존 67 + 커뮤니티 목록 4)
    - `npm run lint` exit 0, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `├ ○ /community`(아직 `searchParams`를 읽지 않아 정적)
    - 화면(개발 서버 3002) 375 / 768 / 1440px: `overflow: false`, 콘솔 오류 `[]`
      - 배지 4색이 홈 칸과 같습니다(기도제목 rose, 사역나눔 blue, 선교소식 green, 봉사후기 orange).
      - 썸네일은 4:3입니다.
      - 미리보기는 1440px에서 한 줄, 768px에서 한두 줄이고, 375px에서는 두 줄에서 말줄임됩니다.
      - 7·8번 글은 `2026. 9. 25`, `2026. 9. 21`로 날짜가 적힙니다.
- [x] **T4. 분류 필터**
  - 파일: `e2e/community.spec.ts`, `src/app/community/page.tsx`
  - 의존: T3
  - 테스트 먼저(red): "커뮤니티 분류 필터" 묶음을 먼저 쓰고 `npm run test:e2e -- -g "커뮤니티 분류 필터"`. 칩이 없어서 새 테스트만 실패합니다.
    - 칩이 "전체, 기도제목, 사역나눔, 선교소식, 봉사후기" 순서이고, 처음에는 "전체"가 선택되어 있습니다.
    - "기도제목"을 누르면 주소가 `category=기도제목`이 되고 2개만 남습니다. 고른 칩의 접근 이름은 "기도제목 선택 해제", 개수 안내는 "기도제목 2개"입니다.
    - 고른 칩을 다시 누르면 `/community`로 돌아가 8개가 보이고 "전체"가 선택됩니다. 탭 제목은 "커뮤니티 | 함께하는 교회"입니다.
    - `?category=봉사후기`로 바로 들어오면 봉사후기 2개가 보입니다.
    - `?category=일정변경`(공지 분류라 글에는 없음)이면 다음과 같습니다.
      - "고른 분류의 글이 없습니다."와 "맞는 글 0개"가 보입니다.
      - `main`에 "일정변경"이 없고, 선택된 칩도 없습니다.
      - "전체 글 보기"를 누르면 전체로 돌아갑니다.
  - 확인(동작 증거):
    - `npm run test` 전부 통과합니다. `e2e/community.spec.ts --repeat-each=5`도 모두 통과합니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): 페이지가 `category`를 무시하면 필터 동작 e2e만 실패합니다.
    - 개발 서버 375 / 768 / 1440px에서 `/community?category=기도제목`을 봅니다. 칩 줄, 선택 상태, 포커스 ring이 보여야 합니다.
  - 증거:
    - Red: `npm run test:e2e -- -g "커뮤니티 분류 필터"` → `5 failed`(칩 nav가 없고 목록이 걸러지지 않음)
    - Green: `npm run test` → 단위 `57 passed`, e2e `76 passed (26.0s)`(커뮤니티 목록 4 + 분류 필터 5 추가)
    - `npm run lint` exit 0, `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `├ ƒ /community`(이제 요청마다 렌더링)
    - 흔들림: `npx playwright test e2e/community.spec.ts --repeat-each=5` → `45 passed (13.5s)`
    - 깨뜨려 보기: 페이지가 `getRecentPosts()`로 `category`를 무시하게 하자, 필터 동작 4개만 실패했습니다(`4 failed`, `5 passed`). 칩 순서 테스트와 목록 테스트는 통과했습니다. 되돌린 뒤 `grep`으로 `getRecentPosts({ category })`를 확인했고, 같은 명령이 `9 passed`
    - 화면(개발 서버 3002)에서 `/community?category=기도제목`을 375 / 768 / 1440px로 봤습니다. `overflow: false`, 콘솔 오류 `[]`
      - "기도제목" 칩이 파란 선택 상태입니다.
      - Tab으로 옮긴 "사역나눔" 칩에 포커스 ring이 보입니다(`focused: "사역나눔"`).
      - 375px에서는 칩이 두 줄로 꺾여 모두 보입니다.
      - 개수 안내는 "기도제목 2개"입니다.
- [x] **T5. 문서**
  - 파일: `CLAUDE.md`, `docs/plans/2026-09-30-church-community.md`, 이 계획서, (새 함정이 있으면) `docs/lessons.md`
  - 의존: T4
  - 테스트 먼저(red): 해당 없음 — 문서만 바꿉니다.
  - 확인(동작 증거):
    - CLAUDE.md Architecture에 다음이 적혀 있고, `NoticeItem`은 없습니다.
      - `community` 구현
      - `components/post/`(분류 색)
      - `common/ArticleRow`
      - `types.ts`의 `POST_CATEGORIES`
    - 상위 계획서 변경 이력에 커뮤니티 항목이 있습니다: 범위, 미리보기 필드, 분류 순서, 한 열 목록, 공통 한 줄, 지난 시간 표기.
  - 증거:
    - `grep -n "NoticeItem" CLAUDE.md` → 결과 없음(exit 1). Architecture에 다음을 적었습니다. CLAUDE.md는 72줄입니다.
      - 18행: `community` 구현
      - 26행: `components/post/`
      - 29행: `common/` ArticleRow
      - 36행: `POST_CATEGORIES`
    - 상위 계획서 215행에 "2026-10-03: 커뮤니티 글 목록 페이지" 항목을 더했습니다. 범위, 미리보기 필드, 분류 칩 순서, 한 열 목록, 공통 한 줄, 지난 시간, 데이터 함수, 탭 제목을 담았습니다.
    - `docs/lessons.md` "여러 세션이 함께 일할 때"에 "워크트리로 나눠 일할 때"를 더했습니다.
      - 기본 워크트리는 `origin`에서 갈라짐
      - 저장소 안에 두지 않음
      - hook은 원래 폴더를 봄
      - e2e 3100 포트를 같이 씀
      - `source nvm.sh`가 막힘
      - `.env.local` 없음

## 리스크와 멈출 조건
- **hook이 워크트리를 보지 않을 수 있음:** Stop hook(DoD 확인)이 원래 폴더를 검사하면, 이 작업의 변경은 자동 확인되지 않습니다.
  - 그래서 task 경계마다 워크트리에서 `npm run test:unit && npm run lint && npm run build`를 직접 돌리고 출력을 증거로 남깁니다.
  - 커밋 때는 워크트리의 pre-commit이 `npm run test`를 돕니다.
  - Stop hook이 원래 폴더(카카오 작업)의 실패로 응답을 막으면, 그 코드는 고치지 않고 사용자에게 알립니다.
- **e2e 3100 포트를 같이 씀:** 원래 폴더의 세션이 `npm run test`나 커밋을 하는 동안에는 이쪽 e2e가 포트 충돌로 실패합니다.
  - e2e를 돌리기 전에 `lsof -iTCP:3100 -sTCP:LISTEN`으로 포트가 비었는지 봅니다. 차 있으면 기다렸다가 다시 돌립니다.
  - `playwright.config.ts`는 카카오 T3가 고치는 파일이라 바꾸지 않습니다.
- **merge 충돌:** 카카오 작업도 `CLAUDE.md` Architecture와 상위 계획서 변경 이력을 고칩니다. 먼저 합치는 쪽 뒤에 생기는 충돌은 merge할 때 양쪽 내용을 모두 살려 풉니다.
- **공통 한 줄로 옮기며 공지 동작이 바뀜:** T1은 `e2e/notices.spec.ts`를 고치지 않고 통과시키는 것이 완료 조건입니다. 테스트를 고쳐야 통과한다면 동작이 바뀐 것이므로 코드를 맞춥니다.
- 계획 밖 결정(범위·데이터 구조 변경, 새 의존성, 되돌리기 어려운 작업)이 필요해지면 다음 task로 넘어가지 않고 사용자에게 묻습니다.

## 검증
- 전체 완료 조건(워크트리에서): `npm run test:unit && npm run lint && npm run build`(`├ ƒ /community`), `npm run test`(단위 + e2e)
- 화면 확인: 워크트리의 `npx next dev -p 3002`에서 375 / 768 / 1440px의 `/community`, `/community?category=기도제목`, `/notices`. 3000은 원래 폴더 세션이 쓸 수 있어 피합니다. 홈 "커뮤니티 최신 글" 칸과 배지 색·글자 크기가 어울리는지 봅니다.
- 일부러 깨뜨려 보기:
  - T4: `category` 무시
  - `POST_CATEGORIES` 순서 바꾸기 → 칩 순서 테스트만 실패
  - 페이지가 `formatDate`로 시간을 적기 → 목록 테스트만 실패

  확인한 뒤 되돌리고, `npm run test`로 원래 상태가 통과하는지 다시 봅니다.
- 흔들림: `e2e/community.spec.ts --repeat-each=5`

## 범위 밖
- 글쓰기, 글 상세 페이지와 줄 링크, 본문 전체, 댓글(로그인과 DB가 필요한 2단계)
- 여러 분류 고르기, 교회·기간 필터, 검색, 페이지 나누기
- 목록 페이지 틀(머리·칩·개수·빈 안내)을 공통 컴포넌트로 올리기
- `FeedRow`와 홈 칸 모양 바꾸기
- 카카오맵 관련 파일 전부
- 커밋, merge, push(요청할 때만)

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->
- 2026-10-03 (시작 전): 워크트리를 `EnterWorktree`의 이름 방식이 아니라 `git worktree add -b feat/community-page ../church-community master`로 만들고 `path`로 들어갔습니다.
  - 이름 방식은 `origin/master`(33df095)에서 갈라져, push하지 않은 행사·공지 페이지 커밋 11개가 빠지기 때문입니다.
  - 저장소 안 `.claude/worktrees/`는 `.gitignore`에 없어, 원래 폴더의 lint·타입 검사·Tailwind가 워크트리를 훑게 됩니다. 그래서 저장소 옆에 두었습니다.
- 2026-10-03 (T3): 리스크로 적은 일이 실제로 일어났습니다.
  - 첫 red 시도가 `http://localhost:3100 is already used`로 돌지 못했습니다. 원래 폴더 `church/`의 `next-server`(다른 세션의 e2e)가 3100을 쓰고 있었습니다. 그 서버는 건드리지 않고, 포트가 빌 때까지 기다린 뒤 다시 돌렸습니다.
  - 응답이 끝날 때 Stop hook이 이 워크트리가 아니라 원래 폴더를 검사했습니다(`RUN v5.0.3 /Users/anderson/Documents/claudeProject/church`, 단위 64개). 다른 세션이 작업 중인 `e2e/fixtures.ts`의 lint 오류(`react-hooks/rules-of-hooks`)로 응답을 막았습니다.
    - 그 코드는 그 세션의 일이라 고치지 않았습니다.
    - 이 작업은 계획대로 task 경계마다 워크트리에서 단위 테스트·lint·build를 직접 돌렸습니다.
  - 같은 Stop에서 지도 갱신 hook이 원래 폴더의 커밋 안 된 `docs/plans/2026-10-03-map-page.md`(다른 세션의 지도 페이지 계획)를 이유로 갱신을 요청했습니다. 그 세션이 스스로 반영해야 할 변경이라 게시하지 않았고, `--mark-synced`도 하지 않았습니다(하면 그 세션의 갱신 요청이 사라짐).

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다. 리뷰에서 반영하지 않은 지적은 이유와 함께 적는다 -->
- **전체 완료 조건(워크트리):**
  - `npm run test` → 단위 `Test Files 6 passed`, `Tests 57 passed`, e2e `76 passed (25.2s)`(기존 67 + 커뮤니티 9)
  - `npm run lint` exit 0
  - `npm run build` → `✓ Compiled successfully`, `Finished TypeScript`, `├ ƒ /community`, `└ ƒ /notices`
- **화면(개발 서버 3002):**
  - `/community`를 375 / 768 / 1440px로 봤습니다(T3). `overflow: false`, 콘솔 오류 `[]`
  - `/community?category=기도제목`을 세 폭에서 봤고, "사역나눔" 칩에 키보드 포커스를 옮겼습니다(T4). `overflow: false`, 콘솔 오류 `[]`
  - `/notices` 목록 영역은 리팩터 전후 375·1440px 스크린샷이 `cmp`로 같습니다(T1).
- **일부러 깨뜨려 보기(각각 되돌린 뒤 `npm run test` → `76 passed`):**
  - 페이지가 `category`를 무시하게 함 → 필터 동작 4개만 실패(`4 failed`, `5 passed`)
  - `POST_CATEGORIES` 순서를 바꿈(사역나눔 ↔ 기도제목) → 커뮤니티·홈 e2e 45개 중 칩 순서 테스트 1개만 실패(`1 failed`, `44 passed`)
  - 페이지가 `formatDate`로 시간을 적게 함 → 목록 테스트 1개만 실패(`1 failed`, `8 passed`)
- **흔들림:** `e2e/community.spec.ts --repeat-each=5` → `45 passed (13.5s)`
- **공지 페이지 동작 유지:** `e2e/notices.spec.ts`를 고치지 않은 채 T1 뒤와 마무리 전체 테스트에서 통과했습니다.
- **독립 리뷰(`/code-review medium`):** 지적 0건입니다. 첫 실행은 지적 없이 멈춰(600초 동안 진행 없음) 다시 돌렸습니다.
  - 리뷰가 확인한 것:
    - `getRecentPosts`를 부르는 곳 둘이 모두 새 꼴입니다.
    - 빈 `?category=`와 없는 분류를 처리합니다.
    - `now`를 데이터 뒤에 잡고, 날짜 단위 글이 단위 경계와 7일 경계를 비켜 있습니다.
    - `ArticleRow`가 지운 `NoticeItem`과 같은 마크업입니다.
    - `cacheComponents`가 꺼져 있어 `new Date()`를 써도 됩니다.
  - 지적으로 올리지 않은 참고 2개는 반영하지 않았습니다.
    - 홈 칸의 "N시간 전"이 빌드 시각 기준입니다. 이번 변경 전부터 그랬고, 다시 그리는 주기는 Supabase 단계에서 정하기로 상위 계획서(2026-10-02)에 적혀 있습니다.
    - `limit = Infinity` 기본값을 Supabase 쿼리 `.limit()`에 그대로 넘기면 안 됩니다. 행사·공지 데이터 함수도 같은 꼴이라, Supabase로 바꿀 때 세 함수를 함께 다룹니다. 지금 목데이터에서는 `slice(0, Infinity)`라 문제가 없습니다.
