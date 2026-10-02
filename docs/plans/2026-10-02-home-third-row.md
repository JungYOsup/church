# 홈 세 번째 행: 다가오는 행사 · 최근 공지 · 커뮤니티 최신 글

## Context
- **왜 하는가:**
  - 상위 계획서의 홈 구성에서 마지막 행입니다(히어로 → 통계 → [지도 | 추천 | 안내] → **[다가오는 행사 | 최근 공지 | 커뮤니티 최신 글]**). 이 행이 들어가면 홈이 참고 이미지와 같은 구성이 됩니다.
  - TDD 규칙을 만든 뒤 처음 하는 실전입니다. "지난 행사는 빼고 날짜순으로 n개" 같은 판단 로직이 생깁니다.
  - 기능 branch에서 작업하고 merge 커밋으로 합쳐 진단 VF-06도 함께 풉니다.
  - 행사·공지·글 데이터 계층은 나중에 `/events`, `/notices`, `/community` 페이지가 그대로 씁니다.
- **spec:**
  - 무엇을: 홈 세 번째 행 세 칸과 행사·공지·글 데이터 계층
  - 어디서: 홈 두 번째 행 아래. branch `feat/home-third-row`
  - 완료 조건:
    - 세 칸이 목업 구성대로 보입니다.
    - 375·768·1440px에서 깨지지 않습니다.
    - 로직은 vitest red→green, 화면은 e2e를 먼저 쓰고 `npm run test`가 통과합니다.
    - master에 `--no-ff` merge 커밋으로 합치고 push합니다.
- **6축 위치:** 실행(task 단위 실행), 검증(TDD red→green, e2e, 일부러 깨뜨려 보기, VF-06 branch·merge)

## 확인한 사실
- **참고 이미지**(`~/Downloads/ChatGPT 이미지 2026년 9월 30일 오후 03_36_59-1.png`, Read로 확인). 세 번째 행의 비율은 약 44 : 28 : 28입니다.
  - **다가오는 행사:**
    - 머리: 달력 아이콘과 "다가오는 행사", 회색 설명 "지역 교회의 다양한 행사에 참여해보세요.", 오른쪽 "더보기 >"
    - 카드 3장: 사진 왼쪽 위에 흰 날짜 배지("8.18" / "(일)"), 굵은 제목, 핀 아이콘과 교회 이름, 시계 아이콘과 "2024. 8. 18 (일) 오후 7:00", 파스텔 태그 3개
    - 오른쪽 가장자리에 ">" 버튼
  - **최근 공지:**
    - 머리: 종 아이콘과 "최근 공지", 설명 "교회들의 중요한 소식을 확인해보세요.", "더보기 >"
    - 4줄: 썸네일(교회 건물 사진), 제목 한 줄, "2024. 8. 10 · 서연교회", 오른쪽 분류 배지(행사안내·일정변경·모집안내·일반공지)
  - **커뮤니티 최신 글:**
    - 머리: 사람들 아이콘과 "커뮤니티 최신 글", 설명 "교회들의 이야기와 기도제목을 나눠주세요.", "더보기 >"
    - 4줄: 썸네일(사람 사진), 제목, "사랑의교회 · 2시간 전", 분류 배지(기도제목·사역나눔·선교소식·봉사후기)
- **상위 계획서(1단계 절 전체를 읽음):**
  - 컴포넌트 이름: `home/UpcomingEvents`, `home/RecentNotices`, `home/CommunityFeed`, `event/EventCard`(날짜 뱃지, 장소, 시간, 태그)
  - 타입 이름: `ChurchEvent`, `Notice`, `Post`. 데이터 함수: `getUpcomingEvents()`, `getRecentNotices()`, `getRecentPosts()`
  - 목데이터는 행사·공지·글 각 8~10개입니다.
  - 반응형: "행사 카드는 가로 스크롤입니다."
  - 디자인 토큰: 색은 `globals.css`에 두고, 태그는 파스텔 배경에 진한 글자입니다.
- **두 번째 행 계획서(`2026-10-02-home-church-row.md`):**
  - "섹션 머리 공통 컴포넌트는 하단 행까지 생긴 뒤 판단한다"고 남겼습니다. 지금 같은 머리가 두 곳(`MapPreview`, `RecommendedChurches`)에 있고, 이번에 세 곳이 더 생깁니다.
  - 배치: 1280px 미만은 한 열이었습니다. 2열에서 화면 순서와 읽는 순서가 어긋났기 때문입니다.
- **지금 코드:**
  - `src/app/page.tsx`는 히어로 → 통계 → 두 번째 행 grid 순서입니다. `main`은 `max-w-[1600px] px-4 lg:px-6`입니다.
  - 태그 색은 `ChurchCard.tsx` 안의 `tagToneClassName`(글자 코드 합 % 3)이 정합니다. 행사 태그도 같은 규칙을 써야 합니다.
  - 섹션 관례: `<section aria-labelledby>`, `h2`, shadcn `Card`/`CardHeader`/`CardAction`, `ul role="list"`, 장식 아이콘 `aria-hidden`, 사진 `alt=""`
  - 교회 목데이터 id: church-1 서연, 2 한강, 3 사랑의, 4 샘물, 5 드림, 6 서울, 7 빛과소금, 8 새생명, 9 열린문, 10 은혜, 11 기쁨, 12 평화, 13 열매, 14 하늘빛, 15 생명샘
- **Next.js 16**(`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`, `caching-without-cache-components.md`):
  - `cacheComponents`가 꺼져 있으면(`next.config.ts`는 비어 있음) `new Date()`를 쓰는 페이지도 빌드 때 정적으로 만들어집니다. 그래서 홈의 "지금"은 빌드 시각입니다.
  - 요청마다 바꾸려면 `connection()`이 필요하지만, UI 단계에서는 필요 없습니다.
- **날짜 표기**(Node 22로 실행해 확인):
  - `Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", … }).format()`은 `"2026. 10. 4. (일) 오후 7:00"`입니다. 목업 표기("2026. 10. 4 (일) 오후 7:00")와 달리 일 뒤에 점이 붙습니다. 그래서 `formatToParts`로 조립합니다.
  - `RelativeTimeFormat("ko", { numeric: "auto" })`는 하루 전을 "어제"로 씁니다. 목업은 "1일 전"입니다.
  - 이 컴퓨터는 `Asia/Seoul`이고 Vercel 서버는 UTC입니다. 시간대를 빼먹은 코드는 로컬에서는 맞고 배포에서만 9시간 어긋납니다.
- **Vitest 시간대**(ctx7 `/vitest-dev/vitest`, common-errors):
  - `vitest.config`의 맨 위에서 `process.env.TZ`를 정하면 모든 pool에 적용됩니다.
  - 설정의 `test.env`에 넣는 `TZ`는 threads pool에서 효과가 없습니다.
- **Playwright 테스트:**
  - 메뉴 테스트는 `navigation` 영역 안에서 `exact: true`로 찾습니다. 그래서 새 링크 "다가오는 행사 더보기"가 메뉴 "행사"와 겹치지 않습니다.
  - 추천 교회 "더보기" 테스트는 영역 안에서만 찾습니다.
- **배운 점(`docs/lessons.md`):**
  - Red에서 "Cannot find module"은 별칭 오류와 구분되지 않습니다. 그래서 빈 구현(stub)으로 red를 봅니다.
  - `break-keep`, `outline-hidden`, `role="list"`를 씁니다. 연한 글자색은 대비 4.5:1을 잽니다.
  - Playwright 역할 이름은 부분 일치입니다. 개발 서버 CSS가 오래될 수 있습니다.
  - jiti 별칭은 `{"@":"<프로젝트>/src"}` 꼴로 줍니다.
- **VF-06**(`harness-doctor/.../scripts/lib/git.mjs`): `git rev-list --count --merges master`로 merge 커밋을 셉니다. 그래서 fast-forward로 합치면 흔적이 남지 않습니다.

## 결정
- **질문과 답:**
  - 사진: 행사 사진만 새로 받습니다(5~6장). 공지 썸네일은 그 교회 사진을, 커뮤니티 썸네일은 행사 사진을 다시 씁니다.
  - 합치기: 로컬에서 `git merge --no-ff`로 합친 뒤 push합니다.
- **정한 것:**
  - **"지금" 기준 목데이터:** 날짜를 고정하지 않고, `createMockEvents(now)`처럼 지금 시각을 받아 만듭니다.
    - 행사 시각은 "오늘(서울)부터 N일 뒤 19:00"으로 정합니다. 오프셋이 1일 이상이면 항상 미래, -1일 이하면 항상 과거입니다. 그래서 언제 보아도 결과가 같습니다.
    - 고정 날짜로 두면 한 달 뒤에 행사가 다 지나가 홈 칸이 비고, e2e가 실패합니다.
  - **순수 로직(`src/lib`, 짝 테스트):**
    - `timeline.ts`:
      - `pickUpcoming(items, now, limit)`: 시작 시각이 지금 이후(같으면 포함)인 것만 남기고, 오름차순으로 limit개를 고릅니다.
      - `pickLatest(items, dateOf, limit)`: 최신순으로 limit개를 고릅니다.
      - 둘 다 입력을 바꾸지 않습니다. 같은 시각이면 원래 순서를 지킵니다.
    - `datetime.ts`:
      - `atSeoulTime(base, dayOffset, "HH:mm")`
      - `formatEventBadge` → `{ monthDay: "10.4", weekday: "일" }`
      - `formatEventDateTime` → "2026. 10. 4 (일) 오후 7:00"
      - `formatDate` → "2026. 10. 4"
      - `formatRelativeTime(iso, now)`: 1분 미만은 "방금 전", 60분 미만은 "N분 전", 24시간 미만은 "N시간 전", 7일 미만은 "N일 전"(지난 시간 기준), 그 이상은 `formatDate`
      - 모두 `Asia/Seoul` 기준입니다.
  - **단위 테스트는 UTC에서:** `vitest.config.mts` 맨 위에 `process.env.TZ = "UTC"`를 둡니다. Vercel과 같은 조건에서 돌려, 시간대를 빼먹은 코드를 이 컴퓨터(KST)에서도 잡기 위해서입니다.
  - **타입(`types.ts`):**
    - 시각은 ISO 문자열입니다(Supabase가 돌려주는 꼴).
    - `ChurchEvent { id, churchId, title, startsAt, imageUrl, tags }`
    - `Notice { id, churchId, title, category: NoticeCategory, publishedAt }`
    - `Post { id, churchId, title, category: PostCategory, createdAt, imageUrl }`
    - 분류는 문자열 union입니다: `"행사안내" | "일정변경" | "모집안내" | "일반공지"`, `"기도제목" | "사역나눔" | "선교소식" | "봉사후기"`
    - 화면용 타입은 `ChurchSummary = Pick<Church, "id" | "name" | "imageUrl">`와 `WithChurch<T> = T & { church: ChurchSummary }`입니다.
  - **교회 붙이기:** `data/churches.ts`에 `withChurch(items)`를 둡니다. `churchId`로 교회를 찾고, 없으면 `getRecommendedChurches`처럼 throw합니다. Supabase 단계에서는 쿼리 join으로 바뀝니다.
  - **데이터 함수:**
    - `getUpcomingEvents(limit)`, `getRecentNotices(limit)`, `getRecentPosts(limit)`
    - 함수 안에서 `now`를 한 번 만들고, 목데이터와 고르기에 같은 값을 씁니다.
    - 홈은 행사 6개, 공지 4개, 글 4개를 씁니다.
  - **목데이터:** 배열은 일부러 날짜순이 아니게 섞습니다. 시각은 서울 기준입니다.
    - 행사 10개:
      | 오프셋 | 제목 | 교회 | 태그 |
      |---|---|---|---|
      | -3일 19:30 | 지역 연합 기도회 | 평화 | 기도, 연합 |
      | -1일 11:00 | 새가족 환영 모임 | 새생명 | 새가족, 교제 |
      | +2일 19:00 | 청년 연합 찬양집회 | 서연 | 찬양, 청년, 연합행사 |
      | +4일 10:00 | 지역사회 연합 봉사활동 | 한강 | 봉사, 지역섬김, 연합 |
      | +6일 18:00 | 다음세대 말씀 집회 | 드림 | 말씀, 다음세대, 집회 |
      | +9일 14:00 | 가정 행복 세미나 | 은혜 | 가정사역, 세미나 |
      | +12일 19:30 | 연합 성가대 발표회 | 샘물 | 찬양, 연합 |
      | +15일 11:00 | 선교 나눔 바자회 | 서울 | 선교, 나눔 |
      | +20일 10:00 | 청소년 체육대회 | 기쁨 | 다음세대, 체육 |
      | +27일 11:00 | 연합 감사예배 | 사랑의 | 예배, 연합 |
      - 그래서 홈에는 +2일부터 +15일까지 6개가 나옵니다. 계획서의 "8~10개" 안이고, 지난 행사 2개와 범위 밖 2개가 섞입니다.
    - 공지 8개(오프셋 -N일 09:00):
      | 오프셋 | 제목 | 교회 | 분류 |
      |---|---|---|---|
      | -1 | 특별새벽기도회에 여러분을 초대합니다 | 서연 | 행사안내 |
      | -3 | 지역 연합 기도회 장소가 변경되었습니다 | 한강 | 일정변경 |
      | -5 | 다음세대 수련회 등록 안내 | 드림 | 모집안내 |
      | -8 | 교회 주차장 이용 안내 | 은혜 | 일반공지 |
      | -11 | 연합 찬양제 참가팀 모집 | 샘물 | 모집안내 |
      | -14 | 주일 예배 시간 변경 안내 | 서울 | 일정변경 |
      | -18 | 새가족 교육 과정 개강 | 새생명 | 행사안내 |
      | -25 | 교회 홈페이지 개편 안내 | 열린문 | 일반공지 |
    - 글 8개:
      | 오프셋 | 제목 | 교회 | 분류 | 화면 |
      |---|---|---|---|---|
      | -2시간 | 이번 주 지역 전도 활동을 위해 기도해주세요 | 사랑의 | 기도제목 | 2시간 전 |
      | -5시간 | 청년부 연합 예배가 은혜 가운데 진행되었습니다! | 한강 | 사역나눔 | 5시간 전 |
      | -26시간 | 선교지 소식과 기도편지를 나눕니다 | 드림 | 선교소식 | 1일 전 |
      | -30시간 | 지역 어르신들을 위한 봉사활동 이야기 | 은혜 | 봉사후기 | 1일 전 |
      | -3일 | 주일학교 교사 모집에 함께해 주세요 | 기쁨 | 사역나눔 | |
      | -5일 | 단기선교 준비를 위해 기도 부탁드립니다 | 열매 | 기도제목 | |
      | -8일 | 연탄 나눔 봉사 후기 | 하늘빛 | 봉사후기 | |
      | -12일 | 선교사님 귀국 보고 모임 소식 | 생명샘 | 선교소식 | |
    - 제목에는 연도·월·계절을 넣지 않습니다. 날짜가 상대값이라 어느 때 보아도 어색하지 않게 하기 위해서입니다. 목업의 "2024 청년 연합 찬양집회"와 "8월 새벽부흥회"도 그래서 바꿨습니다.
  - **사진:**
    - 행사 사진 6장(찬양, 봉사, 성경, 기도, 모임, 음악)을 Unsplash에서 `w=960&q=80`으로 받아 `public/images/events/`에 둡니다.
    - 무료 사진만 씁니다(Unsplash+ 제외). 간판이나 상표가 읽히는 사진은 뺍니다.
    - 출처는 상위 계획서 변경 이력에 적습니다. 모두 `alt=""`입니다.
  - **공통 컴포넌트:**
    - **섹션 머리:** `home/SectionCard`(아이콘, h2, 설명, 오른쪽 위 링크, 내용)를 만들어 새 세 칸과 기존 두 칸에 씁니다. 같은 머리가 다섯 벌이 되기 때문입니다.
    - **"더보기" 링크 이름:** 링크 글자는 "더보기"이고, 화면에 보이지 않는 칸 이름을 붙여 "<칸 이름> 더보기"로 읽히게 합니다(기존 추천 교회 방식). "전체 지도 보기"는 그대로 둡니다.
    - **태그 목록:** `ChurchCard`의 태그 목록과 색 규칙을 `common/TagList`로 옮기고, 교회 카드와 행사 카드가 함께 씁니다.
  - **행사 카드와 가로 스크롤:**
    - `event/EventCard`를 씁니다. 날짜 배지는 `aria-hidden`으로 둡니다. 아래 `<time>` 줄이 같은 정보를 읽어 주기 때문입니다.
    - 카드에는 링크를 걸지 않습니다(상세 페이지 없음).
    - `common/HorizontalScroller`(클라이언트 컴포넌트):
      - scroll-snap 목록에 "이전 행사"·"다음 행사" 버튼을 붙이고, 끝에 닿으면 그쪽 버튼을 비활성화합니다.
      - 버튼은 `sm`부터 보입니다. 모바일은 손가락으로 밉니다.
      - 카드 폭은 `sm` 이상에서 한 번에 3장, 모바일에서는 약 75%로 다음 카드가 엿보이게 합니다.
  - **공지·글 목록:**
    - 줄마다 썸네일, 제목 한 줄(넘치면 말줄임), 메타 줄, 분류 배지를 둡니다. 링크는 없습니다.
    - 분류 색은 고정 맵입니다:
      - 공지: 행사안내 파랑, 일정변경 보라, 모집안내 초록, 일반공지 회색
      - 글: 기도제목 장미, 사역나눔 파랑, 선교소식 초록, 봉사후기 주황
    - `globals.css`에 `--tag-rose`, `--tag-orange`, `--tag-gray`(와 `-soft`)를 더합니다. 대비는 4.5:1 이상을 잽니다.
  - **날짜 표기는 서버 컴포넌트에서만 합니다.** 클라이언트에서 다시 계산하면 서버와 시각이 달라 hydration 불일치가 납니다. `HorizontalScroller`는 이미 그려진 카드를 children으로 받기만 합니다.
  - **배치:**
    - 768px 미만은 한 열(행사 → 공지 → 커뮤니티)입니다.
    - 768~1279px는 행사가 전체 폭이고, 그 아래에 공지 | 커뮤니티 두 칸입니다. 읽는 순서와 화면 순서가 같아서 2열을 씁니다.
    - 1280px 이상은 `1.6 : 1 : 1` 세 칸입니다(목업 44 : 28 : 28).
  - **e2e 위치:** 기존 `e2e/home.spec.ts`에 describe를 더합니다. 기대값은 위 목데이터 표에서 직접 적습니다. 행사 날짜는 빌드 시각에 따라 달라서 정규식으로 확인합니다. 날짜가 정확한지는 단위 테스트가 맡습니다.
  - **커밋:** task마다 branch에 커밋합니다(pre-commit이 lint와 test를 돌립니다). 끝나면 `/code-review`를 거쳐 master에 `--no-ff`로 합치고 push합니다. 다 합친 branch는 `git branch -d`로 지웁니다.

## Tasks
task 형식은 `run-plan`이 읽으므로 그대로 씁니다.

- [x] **T1. 다가오는 행사·최신 글 고르기 (순수 로직)**
  - 파일: `src/lib/timeline.test.ts`, `src/lib/timeline.ts`
  - 의존: 없음
  - 테스트 먼저(red): `timeline.test.ts`를 먼저 씁니다.
    - `pickUpcoming`: 지난 항목은 빠집니다. 시작 시각 오름차순입니다. limit개만 남습니다. 지금과 같은 시각은 포함합니다. 같은 시각이면 원래 순서입니다. 입력 배열이 바뀌지 않습니다. 항목이 limit보다 적으면 있는 만큼 돌려줍니다.
    - `pickLatest`: 최신순, limit, 같은 시각이면 원래 순서, 입력 불변
    - 입력을 그대로 돌려주는 stub으로 `npm run test:unit`을 돌리면, 거르기·순서·개수 테스트가 실패합니다.
  - 확인(동작 증거):
    - `npm run test:unit` 통과
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): 비교를 `>=`에서 `>`로 바꾸면 "같은 시각 포함" 테스트만 실패합니다. 정렬 방향을 뒤집으면 순서 테스트가 실패합니다.
  - 증거:
    - red: 입력을 그대로 돌려주는 stub → `Tests 4 failed | 13 passed (17)`. 실패한 것은 "지난 항목은 빼고 …", "limit개만 남긴다", "남은 항목이 limit보다 적으면 …", "최신 항목부터 limit개를 돌려준다"입니다.
    - green: `Tests 17 passed (17)` (기존 geo 8개 + 새 9개)
    - 깨뜨려 보기:
      - `>=` → `>`: "지금 시작하는 항목은 포함한다"만 실패 → `1 failed | 16 passed`
      - 정렬 방향 뒤집기: 순서 테스트 2개("지난 항목은 빼고 …", "limit개만 남긴다")만 실패 → `2 failed | 15 passed`
      - 되돌린 뒤 `17 passed`
    - lint 종료 코드 0, build `✓ Compiled successfully in 2.1s`
- [x] **T2. 날짜·상대 시간 표기 (순수 로직)와 UTC 단위 테스트**
  - 파일: `src/lib/datetime.test.ts`, `src/lib/datetime.ts`, `vitest.config.mts`
  - 의존: 없음
  - 테스트 먼저(red): `datetime.test.ts`를 먼저 씁니다.
    - "단위 테스트는 UTC에서 돈다"(`Intl.DateTimeFormat().resolvedOptions().timeZone === "UTC"`)
    - `atSeoulTime`: `2026-10-02T15:30Z`(서울 10/3 00:30)에서 +1일 "19:00"이면 `2026-10-04T10:00:00.000Z`입니다. -1일 "09:00", 0일 "00:00"도 확인합니다.
    - `formatEventDateTime`: 저녁 "2026. 10. 4 (일) 오후 7:00", 오전 "오전 10:00". 서울과 UTC의 날짜가 다른 시각(`2026-10-04T16:00Z` → "2026. 10. 5 (월) 오전 1:00")도 확인합니다.
    - `formatEventBadge`, `formatDate`
    - `formatRelativeTime`: 30초 "방금 전", 5분 "5분 전", 2시간 "2시간 전", 26시간 "1일 전", 6일 23시간 "6일 전", 7일은 `formatDate`
    - 빈 문자열을 돌려주는 stub으로 `npm run test:unit`을 돌리면 표기 테스트가, TZ 설정 전에는 UTC 테스트가 실패합니다.
  - 확인(동작 증거):
    - `npm run test:unit` 통과(T1 포함)
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): `timeZone: "Asia/Seoul"`을 빼면 날짜가 서울과 다른 시각의 테스트가 실패합니다. 이 컴퓨터(KST)에서도 잡힌다는 증거입니다.
  - 증거:
    - red: 빈 문자열 stub, TZ 설정 전 → `Tests 18 failed | 17 passed (35)`. 새 테스트 18개가 모두 실패했고, 그중 "단위 테스트는 배포 서버(Vercel)처럼 UTC에서 돈다"가 있습니다.
    - green: `vitest.config.mts` 맨 위에 `process.env.TZ = "UTC"`를 두고 구현 → `Tests 35 passed (35)`
    - 깨뜨려 보기:
      - `timeZone: SEOUL` 제거(UTC에서 실행): 표기 테스트 6개 실패(저녁·오전·정오·다음 날, 배지, 날짜) → `6 failed | 29 passed`
      - 위에 더해 `process.env.TZ` 줄도 제거(KST에서 실행): 표기 테스트 6개는 다시 통과하고, UTC 확인 테스트만 실패 → `1 failed | 34 passed`. UTC 설정이 없으면 시간대를 빼먹은 코드가 이 컴퓨터에서는 보이지 않는다는 증거이고, 확인 테스트가 그 설정이 빠진 것을 잡습니다.
      - 되돌린 뒤 `35 passed`
    - lint 종료 코드 0, build `✓ Compiled successfully in 1228ms`
    - 재확인(T8에서 `formatEventDate`·`formatTime`을 더한 뒤 체크를 풀고 다시 확인):
      - 새 테스트 2개를 먼저 쓰고 stub으로 red → `2 failed | 35 passed (37)`
      - `formatEventDateTime`을 두 함수의 조합으로 바꾸고 green → `37 passed (37)`
      - `timeZone` 제거 → `7 failed | 30 passed`(기존 6 + 새 1). 되돌린 뒤 `37 passed`
    - 테스트 이름: 처음 쓴 상대 시간 테스트는 `%s → %s`에 기대값 대신 입력 시각이 찍혀서, green 전에 인자 순서를 바꿔 "2시간 전 → 2시간 전"처럼 읽히게 했습니다.
- [x] **T3. 행사 사진 6장 준비**
  - 파일: `public/images/events/*.jpg` (6개)
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음 — 정적 파일만 더하고, 확인할 동작이 없음
  - 확인(동작 증거):
    - `ls -la public/images/events`에 6장이 있고, 장마다 250KB 이하입니다.
    - `sips -g pixelWidth`가 장마다 960 이하입니다.
    - 6장을 Read로 직접 봅니다. 16:9로 잘라도 주제(찬양·봉사·성경·기도·모임·음악)를 알아볼 수 있고, 간판·상표가 읽히지 않습니다.
    - 장마다 작가와 Unsplash URL을 기록합니다(T9에서 변경 이력에 옮김).
  - 증거:
    - 후보를 찾은 방법: Unsplash JSON API(`napi`)는 401을 돌려줘서 쓰지 못했습니다. `license=free` 검색 페이지를 WebFetch로 읽어 Unsplash+가 아닌 사진만 골랐습니다. 주제마다 3장씩 18장을 480px로 받아, Playwright로 16:9 모아보기를 찍어 비교했습니다.
    - 받은 방법: `https://unsplash.com/photos/<id>/download?w=960`이 이미지 주소로 넘어가서, 그 주소의 `q=85`를 `q=80`으로 바꿔 받았습니다.
    - `ls -la public/images/events` → 6장, 73,980~182,460바이트
    - `sips` → 모두 `pixelWidth: 960`(높이 540~721)
    - 6장을 16:9로 자른 모아보기를 Read로 봤습니다. 주제를 알아볼 수 있고 간판·상표가 없습니다. 얼굴이 크게 나오는 후보(공원 청소 봉사, 야외 대화)는 뺐습니다.
    - 출처:
      - `worship.jpg` NATHAN MULLET, https://unsplash.com/photos/pmiW630yDPE
      - `volunteer.jpg` Rineshkumar Ghirao, https://unsplash.com/photos/UdDjFekHQuk
      - `bible.jpg` Aaron Burden, https://unsplash.com/photos/c333d6YEhi0
      - `prayer.jpg` Dallas Penner, https://unsplash.com/photos/NsQZkWRUwcs
      - `gathering.jpg` Nicolas Lobos, https://unsplash.com/photos/qbazkeo-R1o
      - `choir.jpg` Olek Buzunov, https://unsplash.com/photos/B-moLesnWhY
- [x] **T4. 행사 데이터 계층**
  - 파일: `src/lib/types.ts`, `src/lib/mock/events.ts`, `src/lib/data/events.ts`, `src/lib/data/churches.ts`(`withChurch`)
  - 의존: T1, T2, T3
  - 테스트 먼저(red): 해당 없음 — 목데이터를 T1의 `pickUpcoming()`과 T2의 `atSeoulTime()`에 넘기기만 합니다. 고르고 계산하는 판단은 T1·T2가 테스트합니다.
  - 확인(동작 증거):
    - scratchpad 스크립트를 `JITI_ALIAS='{"@":"<프로젝트>/src"}' npx jiti`로 실행합니다. 기대 출력:
      - `getUpcomingEvents(6)`의 제목이 "청년 연합 찬양집회, 지역사회 연합 봉사활동, 다음세대 말씀 집회, 가정 행복 세미나, 연합 성가대 발표회, 선교 나눔 바자회" 순서입니다.
      - 모두 지금 이후이고, 교회 이름이 붙어 있습니다.
      - 모든 `imageUrl` 파일이 실제로 있습니다.
      - `formatEventDateTime`으로 찍은 첫 행사가 "오늘+2일 (요일) 오후 7:00"입니다.
    - `npm run lint && npm run build` 통과
  - 증거: `check-t4.ts`(jiti, 서울 기준 2026. 10. 2 (금) 오후 4:37에 실행)
    - `count 6`, `titles 청년 연합 찬양집회, 지역사회 연합 봉사활동, 다음세대 말씀 집회, 가정 행복 세미나, 연합 성가대 발표회, 선교 나눔 바자회`
    - `allFuture true`, `churches 서연교회, 한강교회, 드림교회, 은혜교회, 샘물교회, 서울교회`
    - `mockCount 10 uniqueIds true`, `missingImages none`
    - `first 2026. 10. 4 (일) 오후 7:00`(오늘 +2일, 기대값과 같음)
    - lint 종료 코드 0, build `✓ Compiled successfully in 1146ms`
- [x] **T5. 섹션 머리 공통 컴포넌트와 태그 목록 (리팩터링)**
  - 파일: `src/components/home/SectionCard.tsx`, `src/components/common/TagList.tsx`, `src/components/home/MapPreview.tsx`, `src/components/home/RecommendedChurches.tsx`, `src/components/church/ChurchCard.tsx`
  - 의존: 없음
  - 테스트 먼저(red): 해당 없음 — 보이는 모습과 동작이 같아야 하는 리팩터링이라, 기존 e2e 35개(칸 이름, 링크, 태그 순서, 배치)가 안전망입니다.
  - 확인(동작 증거):
    - 고치기 전과 뒤에 `npm run test` → 35개가 모두 통과합니다.
    - 개발 서버에서 1440·375px 두 번째 행의 스크린샷을 고치기 전과 비교해, 다른 점이 없습니다.
    - `grep -n "tagToneClassName" src -r`가 `TagList.tsx`에만 나옵니다.
  - 증거:
    - 고치기 전: T4 커밋의 pre-commit에서 `35 passed (16.0s)`. 개발 서버(3000)에서 지도·추천 칸을 375·1440px로 찍었습니다(콘솔 오류 none).
    - 고친 뒤: 같은 스크립트로 다시 찍어 `cmp`로 비교했습니다. `375-map`, `375-rec`, `1440-map`, `1440-rec` 모두 `identical`(바이트까지 같음)
    - 개발 서버가 새 코드를 내보냈는지도 확인했습니다. `SectionCard`에 `data-probe`를 잠깐 넣자 `curl /`에 2번 나왔고, 바로 되돌렸습니다.
    - `npm run test` → `Tests 35 passed (35)`(단위), `35 passed (20.1s)`(e2e). lint 종료 코드 0
    - `grep -rn "tagToneClassName" src` → `src/components/common/TagList.tsx` 11·22행만
    - 재확인(T8에서 `SectionCard`에 `className`을 더한 뒤 체크를 풀고 다시 확인): 두 번째 행 4장이 처음 찍은 것과 `cmp`로 모두 `identical`, 콘솔 오류 none. `npm run test` → e2e `46 passed (23.9s)`
- [x] **T6. 다가오는 행사 섹션**
  - 파일: `e2e/home.spec.ts`, `src/components/event/EventCard.tsx`, `src/components/common/HorizontalScroller.tsx`, `src/components/home/UpcomingEvents.tsx`, `src/app/page.tsx`(두 번째 행 아래에 임시로 전체 폭)
  - 의존: T4, T5
  - 테스트 먼저(red): `e2e/home.spec.ts`에 "홈 다가오는 행사" describe를 먼저 씁니다.
    - 카드 6장의 제목 순서와 교회 이름(위 표)을 확인합니다. 날짜 줄은 `/^\d{4}\. \d{1,2}\. \d{1,2} \([일월화수목금토]\) 오[전후] \d{1,2}:\d{2}$/`이고, 태그도 확인합니다.
    - 지난 행사("지역 연합 기도회", "새가족 환영 모임")와 7번째 이후 행사("청소년 체육대회")는 없습니다.
    - "더보기" → `/events`
    - 1440px에서 "이전 행사"는 비활성이고, "다음 행사"를 누르면 목록이 옆으로 움직이고 "이전 행사"가 활성이 됩니다.
    - `npm run test:e2e -- -g "다가오는 행사"`를 돌리면 칸이 없어서 새 테스트만 실패합니다.
  - 확인(동작 증거):
    - `npm run test` 전부 통과. 기존 "가로 스크롤 없음" 테스트가 375·768·1440에서 통과해, 안쪽 가로 스크롤이 페이지를 넓히지 않음을 확인합니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림): 목데이터의 "가정 행복 세미나"를 +16일로 옮기면 순서 테스트만 실패합니다.
    - 개발 서버 375/768/1440px 스크린샷을 참고 이미지의 행사 칸과 비교합니다.
    - 행사 태그 대비가 4.5:1 이상입니다.
  - 증거:
    - red: `npm run test:e2e -- -g "다가오는 행사"` → `4 failed`(칸이 없어 `toHaveCount`·`element(s) not found`·`locator.click: Timeout`)
    - green: 같은 명령 → `4 passed (10.5s)`. `npm run test` → 단위 `35 passed`, e2e `39 passed (18.5s)`(기존 35 + 새 4). 기존 "가로 스크롤이 생기지 않는다" 3개도 통과했습니다.
    - 깨뜨려 보기: "가정 행복 세미나"를 +9일에서 +16일로 옮기자 "다가오는 행사 6개를 날짜순으로 …"만 실패했습니다(`Expected: "가정 행복 세미나"`, `Received: "연합 성가대 발표회"` → `1 failed, 38 passed`). 되돌린 뒤 `git diff` 없음
    - `check-t6.mjs`(개발 서버 3000):
      - 375: 카드 233px, 한 번에 1장과 다음 카드가 엿보임, 버튼 숨김
      - 768: 227px 3장, 버튼 `이전 행사(disabled)`·`다음 행사`
      - 1280: 392px 3장
      - 1440: 445px 3장
      - 네 폭 모두 카드 안 넘침 false, 페이지 가로 넘침 false, 콘솔 오류 none, 태그 대비 최소 5.09
      - 첫 카드: `2026. 10. 4 (일) 오후 7:00`, 배지 `10.4(일)`
    - 처음 측정에서 태그 대비가 1.04로 나왔습니다. 스크립트가 Chrome이 돌려주는 `oklch(...)`를 RGB로 읽은 탓이라, canvas로 RGB로 바꿔 다시 쟀습니다(코드 문제 아님).
    - 스크린샷 비교(375·768·1440): 참고 이미지의 행사 칸과 같은 구성입니다. 사진 왼쪽 위 흰 날짜 배지, 굵은 제목, 핀·교회, 시계·일시, 파스텔 태그, 오른쪽 ">" 버튼이 있습니다. 지금은 임시 전체 폭이라 카드가 넓고, 세 칸 배치는 T8에서 합니다.
    - 재확인(T8에서 `UpcomingEvents`에 `className`을, `EventCard` 일시에 줄바꿈 묶음을 더한 뒤 체크를 풀고 다시 확인):
      - `check-t6.mjs` 결과: 375 카드 233·1장(버튼 숨김), 768 227·3장, 1280 158·3장, 1440 182·3장. 네 폭 모두 카드 안 넘침 false, 페이지 넘침 false, 콘솔 오류 none, 태그 대비 5.09, 일시 `2026. 10. 4 (일) 오후 7:00`
      - `npm run test` → e2e `46 passed (24.6s)`. 새 행사 테스트 4개도 그 안에 있습니다.
    - 재확인(리뷰 반영으로 `HorizontalScroller`의 포커스 이동을 더한 뒤 체크를 풀고 다시 확인):
      - 테스트 먼저: "키보드로 '다음 행사'를 눌러 끝에 닿으면 포커스가 '이전 행사'로 옮겨 간다"를 쓰고 red → `toBeFocused() failed`, `Received: inactive`
      - 고친 뒤 `npm run test` → 단위 `37 passed`, e2e `47 passed (25.0s)`. lint 통과
      - 포커스를 옮기는 줄을 빼면 새 테스트만 실패 → `1 failed, 4 passed`(행사 describe). 되돌린 뒤 `cmp`로 같음
      - `check-t6.mjs` 결과는 처음 재확인과 같습니다(카드 폭 233·227·158·182, 넘침·콘솔 오류 없음, 태그 대비 5.09).
- [x] **T7. 공지·글 데이터 계층**
  - 파일: `src/lib/types.ts`, `src/lib/mock/notices.ts`, `src/lib/mock/posts.ts`, `src/lib/data/notices.ts`, `src/lib/data/posts.ts`
  - 의존: T1, T2, T4
  - 테스트 먼저(red): 해당 없음 — 목데이터를 T1의 `pickLatest()`에 넘기기만 합니다.
  - 확인(동작 증거):
    - jiti 스크립트로 확인합니다. 기대 출력:
      - `getRecentNotices(4)`: 특별새벽기도회 → 장소 변경 → 수련회 → 주차장
      - `getRecentPosts(4)`: 전도 기도 → 청년부 예배 → 선교지 소식 → 어르신 봉사
      - 상대 시간이 "2시간 전, 5시간 전, 1일 전, 1일 전"입니다.
      - 교회와 썸네일 파일이 모두 있습니다.
    - `npm run lint && npm run build` 통과
  - 증거: `check-t7.ts`(jiti)
    - `notices 특별새벽기도회에 여러분을 초대합니다(서연교회, 행사안내, 2026. 10. 1) → 지역 연합 기도회 장소가 변경되었습니다(한강교회, 일정변경, 2026. 9. 29) → 다음세대 수련회 등록 안내(드림교회, 모집안내, 2026. 9. 27) → 교회 주차장 이용 안내(은혜교회, 일반공지, 2026. 9. 24)`
    - `posts 이번 주 지역 전도 활동을 …(사랑의교회, 기도제목) → 청년부 연합 예배가 …(한강교회, 사역나눔) → 선교지 소식과 …(드림교회, 선교소식) → 지역 어르신들을 …(은혜교회, 봉사후기)`
    - `relative 2시간 전, 5시간 전, 1일 전, 1일 전`. 처음에는 `1시간 전, 4시간 전, 1일 전, 1일 전`이었습니다(변경 이력 참고).
    - `counts 8 8 uniqueIds true`, `missingThumbs none`
    - lint 종료 코드 0, build `✓ Compiled successfully in 1446ms`
- [x] **T8. 최근 공지·커뮤니티 섹션과 세 칸 배치**
  - 파일: `e2e/home.spec.ts`, `src/components/home/RecentNotices.tsx`, `src/components/home/CommunityFeed.tsx`, `src/app/globals.css`(분류 색 토큰), `src/app/page.tsx`
  - 의존: T6, T7
  - 테스트 먼저(red): `e2e/home.spec.ts`에 테스트를 먼저 씁니다.
    - "홈 최근 공지": 4줄의 제목·교회·분류 순서, 날짜 `/^\d{4}\. \d{1,2}\. \d{1,2}$/` 꼴, "더보기" → `/notices`
    - "홈 커뮤니티 최신 글": 4줄의 제목·교회·분류, "2시간 전·5시간 전·1일 전·1일 전", "더보기" → `/community`
    - "홈 세 번째 행 배치": 375는 위아래로 행사 → 공지 → 커뮤니티, 768은 행사 아래에 공지·커뮤니티가 나란히, 1440은 세 칸이 한 줄
    - `npm run test:e2e -- -g "최근 공지|커뮤니티 최신 글|세 번째 행"`을 돌리면 새 테스트만 실패합니다.
  - 확인(동작 증거):
    - `npm run test` 전부 통과
    - 분류 배지 8색의 대비가 모두 4.5:1 이상입니다.
    - 일부러 깨뜨려 봅니다(확인 후 되돌림):
      - `pickLatest` 대신 목데이터 순서를 그대로 쓰면 공지 순서 테스트만 실패합니다.
      - `xl:grid-cols-[…]`를 지우면 1440 배치 테스트만 실패합니다.
    - 개발 서버 375/768/1280/1440px에서 넘침(`scrollWidth <= clientWidth`), 가로 스크롤, 콘솔 오류가 없습니다. 1440 스크린샷을 참고 이미지의 세 번째 행과 비교합니다.
  - 증거:
    - red: `npm run test:e2e -- -g "최근 공지|커뮤니티 최신 글|세 번째 행"` → `7 failed`(칸이 없어 `toHaveCount` 등)
    - green: `npm run test` → 단위 `37 passed`, e2e `46 passed (24.6s)`(39 + 새 7). lint 종료 코드 0
    - 깨뜨려 보기(각각 되돌리고 `cmp`로 원래 파일과 같음을 확인):
      - 공지에서 `pickLatest`를 빼고 목데이터 순서 그대로: "최근 공지 4개를 최신순으로 …"만 실패 → `1 failed, 45 passed`
      - `xl:grid-cols-[minmax(0,1.6fr)_…]` 삭제: "1440px 폭에서 세 칸이 한 줄에 놓인다"만 실패 → `1 failed, 45 passed`
    - `check-t8.mjs`(개발 서버 3000). 칸 위치는 x,y,폭,높이입니다.
      - 375: 행사 16,275 → 공지 16,641 → 커뮤니티 16,985로 위아래
      - 768: 행사 736 폭 위, 공지 16,639와 커뮤니티 392,639가 나란히
      - 1280: 530 / 331 / 331, 같은 y
      - 1440: 601 / 376 / 376, 같은 y
      - 네 폭 모두 줄 넘침(`li.scrollWidth > clientWidth`) false, 썸네일 4/4, 페이지 가로 넘침 false, 콘솔 오류 none
      - 제목이 길면 말줄임으로 자릅니다(1440에서 공지 2개, 글 3개).
    - 분류 배지 대비(1440): 행사안내 6.28, 일정변경 6.65, 모집안내 5.09, 일반공지 6.87, 기도제목 5.49, 사역나눔 6.28, 선교소식 5.09, 봉사후기 4.92. 모두 4.5 이상입니다.
    - 1280px에서 행사 카드(158px)의 일시가 "…(일) 오후 / 7:00"처럼 시간 중간에서 끊겼습니다. 날짜와 시간을 줄바꿈 없는 두 묶음으로 나눠, "2026. 10. 4 (일) / 오후 7:00"으로 끊기게 고쳤습니다(변경 이력 참고).
    - 1440 스크린샷을 참고 이미지와 비교했습니다. 같은 구성입니다: 행사 카드 3장과 ">" 버튼, 공지 4줄(교회 사진 썸네일·날짜·교회·분류 배지), 글 4줄(행사 사진 썸네일·교회·지난 시간·분류 배지), 비율 약 44 : 28 : 28. 다른 점은 다음과 같습니다.
      - 설명이 제목 옆이 아니라 아래 줄에 있습니다(두 번째 행과 같은 `SectionCard` 구조).
      - 공지의 종 아이콘이 주황이 아니라 다른 칸과 같은 파랑입니다.
- [x] **T9. 문서 반영**
  - 파일: `CLAUDE.md`, `docs/plans/2026-09-30-church-community.md`, `docs/lessons.md`
  - 의존: T8
  - 테스트 먼저(red): 해당 없음 — 문서만 바꿈
  - 확인(동작 증거):
    - `CLAUDE.md` Architecture에 `components/event/`, `common/`의 새 컴포넌트, `src/lib`의 순수 로직(짝 테스트)이 있습니다. "앞으로 생길 폴더"에서 `components/event`가 빠졌습니다.
    - 상위 계획서 변경 이력에 다음이 있습니다:
      - 이 계획서 링크
      - "지금" 기준 목데이터와 빌드 시각 고정
      - 서울 시간대 표기와 UTC 단위 테스트
      - 세 번째 행 배치(768 2열, 1280 `1.6:1:1`)
      - 섹션 머리 공통화
      - 행사 사진 6장의 출처
    - `docs/lessons.md`에 이번에 겪은 함정이 있습니다(최소: Intl 한국어 날짜의 끝 점과 "어제", Vitest TZ는 config 맨 위).
    - 링크한 파일이 실제로 있습니다.
  - 증거:
    - `CLAUDE.md`
      - 22~28행에 `components/event/`(EventCard)와 `common/`(ComingSoon, TagList, HorizontalScroller)가 있고, home 줄에 세 칸·SectionCard·FeedRow가 있습니다.
      - `src/lib/geo.ts, timeline.ts, datetime.ts` 순수 로직 줄(짝 테스트, Vitest는 UTC)이 있습니다.
      - 38행 "앞으로 생길 폴더"는 `supabase/migrations/`만 남았습니다.
    - 상위 계획서 159행부터 변경 이력이 있습니다: 이 계획서 링크, 상대 날짜 목데이터, 빌드 시각, 서울 시간대와 UTC 단위 테스트, 타입·`withChurch`, 배치(768 2열, 1280 `1.6:1:1`), `SectionCard`·`TagList`, 분류 색 토큰, 목업 문구 변경, 행사 사진 6장 출처
    - 카카오맵 계획: T4 항목에서 `src/lib/geo.ts`를 빼고 변경 이력(171행)에 이유를 적었습니다. 이번에 Architecture에 함께 적었기 때문입니다.
    - `docs/lessons.md`에 더한 항목:
      - 환경과 도구: "Unsplash 사진 찾기와 받기"
      - Next.js: "'같다'는 결과를 믿기 전에"(개발 서버 probe)
      - 테스트: "대비를 잴 때 브라우저가 돌려주는 색은 oklch다"
      - 새 절 "날짜와 시간": 고정 날짜 목데이터, KST에서 안 보이는 시간대 누락과 Vitest TZ, Intl 한국어 표기의 끝 점과 "어제", 상대 시간 경계, "오후 / 7:00" 줄바꿈
    - 링크 확인: `lessons.md`의 `(plans/…)` 링크를 모두 `ls`로 확인했고 MISSING이 없습니다. `docs/plans/2026-10-02-home-third-row.md`도 있습니다.

## 리스크와 멈출 조건
- **1280px에서 칸이 좁음:** 행사 카드는 약 158px, 공지·글 칸은 약 330px입니다. T8에서 넘침을 재고 스크린샷을 봅니다. 답답하면 비율이나 한 번에 보이는 카드 수를 조정하고 변경 이력에 적습니다.
- **정적 빌드의 "지금":** 배포한 뒤 다시 빌드하지 않으면 날짜가 빌드 시각에 묶입니다. UI 단계에서는 받아들입니다. 다시 그리는 주기(`revalidate`/`connection`)는 Supabase를 붙일 때 정합니다.
- **사진 내려받기가 막힘:** Unsplash에서 받을 수 없으면 T3에서 멈추고 묻습니다.
- **리팩터링이 기존 화면을 바꿈:** T5에서 기존 테스트나 스크린샷이 달라지면, 새 섹션으로 넘어가지 않고 T5 안에서 맞춥니다.
- **계획 밖 결정이 필요할 때:** 범위·데이터 구조 변경, 새 의존성, 되돌리기 어려운 작업이 필요해지면 다음 task로 넘어가지 않고 묻습니다.

## 검증
- 전체 완료 조건:
  - `npm run test:unit && npm run lint && npm run build`
  - `npm run test` (기존 35개 + 새 테스트)
  - 375·768·1440px 스크린샷을 참고 이미지와 비교
- 화면 확인: `npm run dev`(3000)에서 375 / 768 / 1280 / 1440px를 봅니다. 참고 디자인과 다음을 비교합니다:
  - 세 칸의 비율
  - 행사 카드의 날짜 배지·핀·시계·태그
  - 화살표 버튼
  - 공지·글 줄의 썸네일과 분류 배지 색
- 일부러 깨뜨려 보기:
  - T1: 같은 시각 포함, 정렬 방향
  - T2: 시간대 빼기
  - T6: 행사 날짜 옮기기
  - T8: 공지 순서, 세 칸 배치
  - 확인한 뒤 되돌리고 `npm run test`로 원래 상태가 통과하는지 다시 봅니다.
- 마무리:
  - `/code-review`로 독립 리뷰를 받습니다.
  - TDD 소감을 검증 결과에 적습니다(먼저 쓴 테스트가 설계에 준 영향, 불편).
  - `git switch master && git merge --no-ff feat/home-third-row` 후 `git rev-list --count --merges master`가 1 이상인지 보고 push합니다.

## 범위 밖
- `/events`, `/notices`, `/community` 페이지와 상세 페이지. 카드와 줄에는 링크를 걸지 않습니다.
- 통계 카드 숫자(이번 주 행사 32, 공유 공지 87)를 목데이터에서 계산하기
- 다시 그리는 주기(`revalidate`/`connection`)
- 행사 태그·분류로 거르기, 검색
- 다크 모드
- 카카오맵 계획의 남은 task(T2~T4)
- GitHub PR

## 변경 이력
<!-- run-plan이 계획과 달라진 점을 날짜·내용·이유로 적는다 -->
- 2026-10-02 (T7): 글 목데이터의 오프셋을 계획 표의 "-2시간, -5시간, -26시간, -30시간"에서 각각 10분씩 더 앞(2시간 10분 전 등)으로 옮겼습니다. 화면 표기("2시간 전, 5시간 전, 1일 전, 1일 전")는 계획 그대로입니다.
  - 이유: 확인 스크립트가 `now`를 데이터 함수보다 몇 ms 먼저 만들자 정확히 2시간 전인 글이 "1시간 전"으로 내려갔습니다.
  - 화면도 렌더 시각과 데이터 시각이 다를 수 있어서, 단위가 바뀌는 경계에서 비켜 두었습니다. 그 뒤 같은 스크립트(`now`를 먼저 만드는 순서 그대로)에서 계획한 표기가 나왔습니다.
  - 필드 이름도 `hoursAgo`에서 `minutesAgo`로 바꿨습니다.
- 2026-10-02 (T8): 계획의 파일 목록 밖에서 네 가지를 더했습니다. 앞 task의 코드를 건드린 것은 그 task의 체크를 풀고 다시 확인했습니다.
  - **`home/FeedRow.tsx` 추가:** 공지와 글의 한 줄(썸네일·제목·메타·배지)이 같은 모양이라 함께 쓰는 컴포넌트로 만들었습니다.
  - **`SectionCard`·`UpcomingEvents`에 `className`:** 768~1279px에서 행사 칸을 두 칸 폭(`md:col-span-2`)으로 두려고 section에 클래스를 넘기게 했습니다. T5·T6을 다시 확인했습니다.
  - **`formatEventDate`·`formatTime` 추가(T2):** 1280px 행사 카드에서 일시가 "오후 / 7:00"으로 끊겨, 날짜와 시간을 따로 줄바꿈 없이 묶었습니다. 테스트 2개를 먼저 써서 red를 본 뒤 구현했고, `formatEventDateTime`은 두 함수의 조합이 되었습니다. T2를 다시 확인했습니다.
  - **1280px는 그대로 둠:** 리스크 절의 대응(비율이나 한 번에 보이는 카드 수 조정)은 쓰지 않았습니다. 일시 줄바꿈을 고친 뒤에는 카드 안 넘침이 없고 읽기에 무리가 없었기 때문입니다. 1440px의 "다음 행사" 테스트(세 장씩 넘김)도 그대로 유지됩니다.
- 2026-10-02 (리뷰 반영): `/code-review`(medium)가 지적 2개를 남겼습니다.
  - **반영(low):** `HorizontalScroller`의 버튼이 끝에 닿아 꺼질 때 키보드 포커스가 사라졌습니다.
    - e2e로 먼저 재현했습니다(`toBeFocused` 실패).
    - 고친 방법: 누른 버튼이 꺼지면, 버튼 상태가 다시 그려진 뒤 반대쪽 버튼으로 포커스를 옮깁니다. `disabled`와 숨김은 그대로 둡니다. 리뷰가 제안한 `aria-disabled`로 바꾸면 보이지 않는 버튼이 포커스를 잡게 되기 때문입니다.
    - T6의 체크를 풀고 다시 확인했습니다.
  - **주석만 고침(medium):** "정적 빌드라 날짜가 빌드 시각에 묶인다"는 사실입니다.
    - 다만 이 계획이 리스크 절과 범위 밖에서 "UI 단계에서는 받아들이고, 다시 그리는 주기는 Supabase 단계에서 정한다"고 정했습니다. 그래서 동작은 바꾸지 않았습니다.
    - 요청마다 계산하는 것처럼 읽히던 `CommunityFeed`의 주석은 "그리는 시각은 빌드 시각"으로 고쳤습니다.

## 검증 결과
<!-- run-plan이 마무리 검증의 실제 출력 근거를 적는다. 리뷰에서 반영하지 않은 지적은 이유와 함께 적는다 -->
- **단위·lint·build·동작 테스트:** 리뷰 반영 뒤 `npm run test` → 단위 `Tests 37 passed (37)`, e2e `47 passed (25.0s)`(기존 35 + 새 12), lint 통과
- **독립 리뷰:** `/code-review`(medium)는 `src/`·`e2e/`의 변경을 모두 읽었습니다. 목데이터의 `churchId`가 모두 교회 15곳 안에 있는지, 화살표 버튼이 카드 여백에 잘리지 않는지, 빌드 결과(`index.html`, `x-nextjs-prerender: 1`)도 확인했습니다. 지적은 2개입니다.
  - 포커스 이동(low): 반영했습니다(변경 이력 참고).
  - 정적 빌드의 날짜(medium): 주석만 고쳤습니다.
- **리뷰에서 반영하지 않은 지적:** "배포 뒤 다시 빌드하지 않으면 다가오는 행사가 지난 행사가 되고 '2시간 전'이 굳는다(`connection()`이나 `revalidate`로 고치라)"
  - 사실입니다. 그래도 승인된 계획이 리스크 절과 범위 밖에서 이 동작을 UI 단계에서 받아들이고, 다시 그리는 주기를 Supabase 단계에서 정한다고 했습니다.
  - 지금은 배포가 없고, 개발 서버는 요청마다 그리고, e2e는 매번 새로 빌드합니다.
  - 배포 전에 정해야 할 일로 남깁니다.
- **일부러 깨뜨려 보기:** 모두 해당 테스트만 실패했고, 되돌린 뒤 통과했습니다(각 task 증거 참고).
  - T1: `>=`→`>`는 "지금 시작하는 항목은 포함한다" 1개, 정렬 방향 뒤집기는 순서 테스트 2개
  - T2: `timeZone` 제거는 UTC에서 표기 테스트 6개(나중에 7개). 같은 상태로 TZ 설정까지 빼면 KST에서 UTC 확인 테스트 1개만 실패
  - T6: "가정 행복 세미나" 날짜 옮기기는 행사 순서 테스트 1개
  - T8: `pickLatest` 제거는 공지 순서 테스트 1개, 세 칸 grid 제거는 1440 배치 테스트 1개
- **화면 확인:** 개발 서버(3000)에서 375 / 768 / 1280 / 1440px를 봤습니다(`check-t6.mjs`, `check-t8.mjs`).
  - 375는 한 열이고 행사 카드가 엿보이며 버튼은 숨깁니다. 768은 행사 위, 공지 | 커뮤니티 아래입니다. 1280·1440은 한 줄 세 칸입니다.
  - 네 폭 모두 페이지 가로 넘침, 카드·줄 안 넘침, 콘솔 오류가 없습니다.
  - 태그 대비는 5.09 이상, 분류 배지 대비는 4.92 이상입니다.
  - 1440 스크린샷이 참고 이미지의 세 번째 행과 같은 구성입니다. 다른 점(설명 위치, 종 아이콘 색)은 T8 증거에 적었습니다.
  - 두 번째 행은 리팩터링 전후 스크린샷이 바이트까지 같습니다(T5, T8 뒤 재확인).
- **TDD 소감**(TDD 규칙을 만든 뒤 첫 실전):
  - **설계에 준 영향:**
    - `pickUpcoming`의 테스트를 먼저 쓰다 보니 "지금"을 안에서 `new Date()`로 만들지 않고 인자로 받게 됐습니다. 그 덕에 목데이터도 `createMockEvents(now)`로 같은 `now`를 공유하는 구조가 됐습니다.
    - "단위 테스트는 UTC에서 돈다" 테스트를 먼저 쓰자, KST 컴퓨터에서는 시간대 누락이 보이지 않는다는 점이 드러났습니다. 그래서 Vitest를 UTC로 고정했고, 깨뜨려 보기로 그 효과를 확인했습니다.
    - 1280px 줄바꿈을 고칠 때도 `formatEventDate`·`formatTime`의 테스트를 먼저 써서, 기존 `formatEventDateTime`과 결과가 같다는 것을 묶어 두었습니다.
  - **red만으로는 부족했던 곳:**
    - stub(입력을 그대로 돌려줌)에서는 "같은 시각은 포함" 같은 테스트가 우연히 통과합니다. 일부러 깨뜨려 보기가 그 테스트의 쓸모를 보여 줬습니다.
    - e2e "지난 행사는 보이지 않는다"는 칸이 아예 없어도 통과할 수 있어서, 카드 개수를 먼저 확인하게 고쳤습니다.
  - **불편:**
    - "Cannot find module" red는 경로 문제와 구분되지 않아서, 매번 stub을 한 번 더 써야 합니다.
    - e2e red를 보려면 빌드를 포함해 15~25초가 걸립니다.
    - task마다 커밋할 때 pre-commit이 전체 테스트(약 20~25초)를 다시 돕니다. 9개 task에서 감당할 만했습니다.
