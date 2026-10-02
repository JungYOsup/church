# 함께하는 교회: 지도 기반 교회 커뮤니티 웹 구현 계획

## 배경
- 참고 이미지(ChatGPT 목업)는 **여러 지역 교회를 지도 위에서 연결하는 연합 커뮤니티**입니다.
  - 메뉴: 홈 / 교회 지도 / 행사 / 공지 / 커뮤니티 / 대표자 관리, 검색, 알림, 역할 표시("서연교회 대표자")
  - 홈 화면: 히어로(교회 찾기·우리 교회 등록) → 통계 카드 4개 → [지역 교회 지도 | 추천 교회 3개 | 대표자 등록 안내] → [다가오는 행사 | 최근 공지 | 커뮤니티 최신 글]
- 목적은 **포트폴리오/학습용**입니다. 완성도 있는 데모와 깔끔한 구조, 배포된 URL이 목표입니다.
- 결정한 사항: **Next.js + Supabase**, **UI 먼저 만들고 백엔드는 나중에**, **카카오맵**
- 현재 저장소는 비어 있습니다(커밋 0개, `.harness/`만 있음). 처음부터 만드는 프로젝트입니다.
- 환경 문제: 기본 Node가 **v18.18.2**인데 Next.js 16.2는 **Node 20.9 이상**이 필요합니다(ctx7로 확인). nvm에 v22.14.0이 설치되어 있으므로 이 버전으로 고정합니다.

## 전체 방향: 3단계
| 단계 | 목표 | 결과물 |
|---|---|---|
| 1. UI | 이미지와 똑같은 화면을 목데이터로 구현, 반응형 | 클릭해 볼 수 있는 전체 페이지 |
| 2. 백엔드 | Supabase DB·인증·권한·스토리지 연결 | 로그인, 교회 등록, 행사/공지/글 작성 |
| 3. 배포 | Vercel 배포, README에 스크린샷 추가 | 공개 URL과 포트폴리오 문서 |

**핵심 설계 원칙:** 컴포넌트는 데이터를 `src/lib/data/*.ts`의 async 함수로만 가져옵니다. 1단계에서는 이 함수들이 목데이터를 반환하고, 2단계에서는 함수 안쪽만 Supabase 쿼리로 바꿉니다. 이렇게 하면 UI 코드는 수정할 필요가 없습니다.

---

## 결정 기록 (2026-09-30)
| 질문 | 선택 | 이유 |
|---|---|---|
| 목적 | 포트폴리오/학습 | 완성도 있는 데모와 공개 URL이 목표. 실사용자 운영은 부차적 |
| 스택 | Next.js + Supabase | 1인 개발로 속도가 가장 빠름. DB·인증·스토리지·권한(RLS)을 한 번에 해결 |
| 1차 범위 | UI 먼저, 이후 백엔드 | 이미지 재현을 먼저 확인하고, 데이터 계층만 바꿔 백엔드를 연결 |
| 지도 | 카카오맵 | 국내 지도 품질, 주소→좌표 변환, 클러스터링 지원. 카카오 로그인과도 잘 맞음 |
| 검토했지만 제외 | 별도 백엔드(Spring/Nest), Firebase, 네이버 지도, Leaflet | 작업량이 약 2배 / 관계형·위치 쿼리 불편 / NCP 결제 등록 필요 / 국내 품질 낮음 |

## 0단계: 프로젝트 기반
0. **계획 히스토리 남기기(가장 먼저)**
   - 이 계획서 전체(배경, 결정 기록, 단계별 계획, 검증)를 `docs/plans/2026-09-30-church-community.md`로 저장합니다.
   - 첫 커밋으로 기록합니다: `docs: 교회 커뮤니티 구현 계획 및 의사결정 기록`. 빈 저장소의 초기 커밋이라 main에 바로 올립니다.
   - 앞으로 계획이 바뀌면 이 파일 아래쪽 `## 변경 이력`에 날짜별로 이어서 적습니다.
1. `.nvmrc`에 `22`를 적고 Node 22에서 작업합니다.
2. `create-next-app` 옵션: TypeScript, App Router, Tailwind CSS(v4), ESLint, `src/` 디렉터리, `@/*` alias
3. `shadcn/ui` init: Button, Card, Badge, Input, Sheet(모바일 메뉴), DropdownMenu(프로필), Avatar
4. 폰트는 **Pretendard**(`next/font/local` 또는 CDN)를 쓰고, 아이콘은 `lucide-react`를 씁니다.
5. 짧은 `CLAUDE.md`에 스택, 명령어, 폴더 구조, **DoD(`npm run lint && npm run build`)**를 적고, "계획은 `docs/plans/`에 남긴다"는 규칙도 넣습니다. harness-doctor가 제안한 Top 3 항목에 해당합니다.

## 1단계: UI (목데이터)

### 디자인 토큰 (`src/app/globals.css`의 `@theme`)
- primary 파랑(CTA, 강조 텍스트), 통계 카드 accent 4색(파랑·초록·주황·보라)
- 배경은 연회색, 카드는 흰색. 모서리 반경 12~16px, 그림자는 약하게
- 태그 배지는 파스텔 배경에 진한 글자

### 라우트
```
src/app/
  layout.tsx              # Header + Pretendard
  page.tsx                # 홈 (이미지 재현)
  map/page.tsx            # 교회 지도: 전체 지도 + 좌측 목록 + 지역 필터
  churches/[id]/page.tsx  # 교회 상세 (소개, 행사, 공지)
  events/page.tsx         # 행사 목록 (날짜순, 태그 필터)
  notices/page.tsx        # 공지 목록 (카테고리 배지)
  community/page.tsx      # 커뮤니티 글 목록
  admin/page.tsx          # 대표자 관리 (1단계는 화면만)
```

### 컴포넌트
```
src/components/
  layout/  Header.tsx, MobileNav.tsx(Sheet), UserMenu.tsx
  home/    HeroBanner, StatCards, MapPreview, RecommendedChurches,
           RepRegisterCta, UpcomingEvents, RecentNotices, CommunityFeed
  church/  ChurchCard.tsx (지역 칩, 좋아요, 목사명, 인원, 태그)
  event/   EventCard.tsx (날짜 뱃지, 장소, 시간, 태그)
  map/     KakaoMap.tsx ('use client')
  ui/      shadcn 컴포넌트
```

### 데이터 계층
- `src/lib/types.ts`: `Church`, `ChurchEvent`, `Notice`, `Post`, `Stats`, `UserProfile`
  - `Church`: `id, name, slogan, pastorName, memberCount, region, address, lat, lng, imageUrl, tags[]`
- `src/lib/mock/*.ts`: 서울과 경기 교회 12~20개. 이미지 속 교회(서연·한강·은혜·사랑의·샘물·드림 등)를 넣고 실제 구 좌표를 씁니다. 행사, 공지, 글은 각각 8~10개입니다.
- `src/lib/data/*.ts`: `getChurches({ bounds?, region? })`, `getRecommendedChurches()`, `getUpcomingEvents()`, `getRecentNotices()`, `getRecentPosts()`, `getStats()`

### 카카오맵
- 카카오 개발자 콘솔에서 앱을 만들고 **JavaScript 키**를 발급받습니다. 플랫폼 Web 도메인에 `http://localhost:3000`을 등록하고, 앱 설정에서 카카오맵 사용이 켜져 있는지 확인합니다.
- `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_KEY`를 넣고, `.env.example`도 함께 둡니다.
- `next/script`로 SDK를 불러옵니다(`autoload=false&libraries=services,clusterer`). `kakao.maps.load()` 뒤에 렌더링합니다. `react-kakao-maps-sdk` 래퍼를 쓸지는 구현할 때 ctx7로 최신 문서를 보고 정합니다.
- 교회마다 커스텀 마커(십자가 핀)와 이름 라벨을 붙이고, 선택한 교회는 사진 오버레이로 강조합니다.
- 지도 범위가 바뀌면(`idle` 이벤트) bounds 안의 교회만 걸러서 "현재 지도 범위 내 교회 N개"를 보여줍니다.
- 키가 없으면 정적인 대체 화면을 보여줍니다. 빌드와 데모가 깨지지 않게 하기 위함입니다.

### 이미지
- 1단계에서는 Unsplash 이미지를 씁니다(`next.config`의 `images.remotePatterns`). 나중에 직접 준비한 이미지로 바꾸거나 `public/images/`로 옮길 수 있습니다.

### 반응형
- 데스크톱(≥1280px)은 이미지 레이아웃 그대로입니다.
- 태블릿은 2열, 모바일은 1열로 쌓고 햄버거 메뉴를 씁니다. 행사 카드는 가로 스크롤입니다.

## 2단계: Supabase 연동 (UI 완성 후)
- `@supabase/ssr`로 서버·클라이언트 클라이언트를 따로 만들고, `middleware`에서 세션을 갱신합니다. 정확한 API는 구현할 때 ctx7로 확인합니다.
- 스키마는 `supabase/migrations/*.sql`로 저장소에 남깁니다(포트폴리오 포인트).
  - `profiles`(role: `member | church_rep | admin`, 직분, 소속 교회)
  - `churches`(status: `pending | approved`, lat/lng에 인덱스)
  - `rep_verifications`(대표자 인증 신청, 증빙 파일, 승인 상태)
  - `events`, `notices`, `posts`, `comments`, `favorites`, `notifications`
- **RLS 정책**
  - 승인된 교회와 그 콘텐츠는 누구나 읽을 수 있습니다.
  - 행사와 공지 작성은 해당 교회의 `church_rep`만 할 수 있습니다.
  - 글은 로그인한 사용자가 씁니다.
  - 교회 승인과 대표자 인증은 `admin`만 처리합니다.
- **인증**: 카카오 로그인(Supabase Auth provider)과 이메일 로그인
- **교회 등록 폼**: 다음 우편번호로 주소를 검색하고, 카카오 Geocoder로 lat/lng를 자동 입력합니다. 대표 사진은 Supabase Storage에 올립니다.
- **대표자 관리**: 인증 신청, 관리자 승인, 내 교회의 행사·공지 관리
- 교체 방법: `src/lib/data/*.ts`의 함수 안쪽만 Supabase 쿼리로 바꿉니다.

## 3단계: 배포와 포트폴리오
- Vercel에 배포하고 환경변수를 설정합니다. 카카오 콘솔에 배포 도메인을 추가합니다.
- README: 스크린샷, 아키텍처 다이어그램, ERD, RLS 설계에서 고민한 점
- 선택 사항: Playwright 스모크 테스트(홈 렌더링, 지도 마커 표시, 로그인 흐름)

---

## 검증
- **각 단계 완료 조건(DoD):** `npm run lint && npm run build` 통과
- **1단계**
  - `npm run dev`로 띄운 홈 화면을 참고 이미지와 나란히 놓고 비교합니다. 섹션 순서, 색상, 카드 구성을 확인합니다(run 스킬 또는 브라우저 스크린샷).
  - 375px, 768px, 1440px 폭에서 레이아웃이 깨지지 않는지 봅니다.
  - 카카오 키가 있을 때 마커가 뜨고, 지도를 움직이면 "범위 내 교회 N개"가 바뀌는지 봅니다. 키가 없을 때는 대체 화면이 나오는지 봅니다.
  - 네비게이션으로 모든 라우트에 이동할 수 있는지 확인합니다.
- **2단계**
  - 비로그인, 일반 회원, 대표자, 관리자 계정으로 각각 쓰기 권한을 시험해 RLS가 의도대로 막고 허용하는지 확인합니다.
  - 교회를 등록하면 지도에 마커가 생기는지 확인합니다.

## 바로 시작할 범위
승인하면 **계획 히스토리부터 저장하고 커밋합니다(0-0).** 그다음 0단계와 1단계를 진행합니다. 결과물은 홈 화면을 이미지대로 재현하고, 나머지 라우트를 목데이터로 채우고, 카카오맵을 연동하는 것까지입니다. 구현 코드 커밋은 요청할 때만 합니다.

---

## 변경 이력
- 2026-09-30: 최초 작성 (목적·스택·지도·범위 결정)
- 2026-10-01: 첫 작업 범위를 프로젝트 세팅, 헤더, 홈 히어로로 좁힘 ([세부 계획](2026-10-01-setup-header-hero.md)). 작은 범위로 하네스 사이클을 먼저 한 바퀴 돌려 보기 위함
- 2026-10-01: `create-next-app`은 이 폴더의 기존 파일(CLAUDE.md, README.md, .harness/)과 충돌하므로 임시 폴더에서 생성한 뒤 필요한 파일만 복사하기로 함
- 2026-10-01: create-next-app이 만드는 `AGENTS.md`를 채택. Next.js는 설치된 버전의 문서(`node_modules/next/dist/docs/`)를 기준으로 함
- 2026-10-01: 히어로 배경을 서울 한강·도심 사진으로 정함 (Daryan Shamkhali, Unsplash License, https://unsplash.com/photos/vpk8V_O5-Xk). 교회 건물 사진 후보는 구도가 넓은 배너에 맞지 않았음. 인용구는 목업 문구 대신 개역개정 히브리서 10:24 본문을 사용
- 2026-10-01: shadcn/ui 4.21은 `clsx`+`tailwind-merge` 대신 shadcn이 배포하는 `cn` 패키지를 설치함. 스타일 프리셋은 `radix-nova`
- 2026-10-02: 홈 통계 카드 4개를 추가함 ([세부 계획](2026-10-02-stat-cards.md)). 카드 전체가 링크이고 아이콘과 글을 가로로 놓는 구조라, shadcn Card를 설치하지 않고 `Link`에 카드 스타일을 직접 줌. Card는 세로 구조 카드가 필요한 섹션(추천 교회 등)에서 설치함
- 2026-10-02: 홈 두 번째 행(우리 지역 교회 지도 · 추천 교회 · 대표자 등록 안내)과 교회 데이터 계층을 추가함 ([세부 계획](2026-10-02-home-church-row.md))
  - `Church`에 `district`(시·군·구)를 더함. `region`은 시·도이고, 지역 칩은 "서울 용산구"처럼 둘을 이어 보여 줌. `address`는 동까지만 적음
  - 목데이터는 서울 9곳·경기 6곳, 모두 15곳. 통계 카드의 248곳·17개 지역은 전국 수치라 맞추지 않음. 같은 화면에 두 수가 같이 보이지 않도록 지도 대체 화면에는 교회 수를 적지 않음
  - `getChurches()`는 아직 인자가 없음. bounds·region 필터는 지도 작업에서 더함
  - 지도 칸은 카카오맵 키가 없을 때의 대체 화면(`components/map/MapFallback`)으로 먼저 만듦
  - 배치: 1280px 미만은 한 열(지도 → 추천 → 안내), 1280px 이상은 `1 : 1.35 : 0.75` 세 칸. 태블릿 2열은 화면 순서와 읽는 순서가 어긋나서 쓰지 않음. 추천 칸은 카드 3장이 들어가도록 목업보다 조금 넓게 줌
  - 태그 배지 3색(`--tag-*`)과 하트 강조색(`--favorite`)을 디자인 토큰에 더함. shadcn Card·Badge를 설치함
  - 교회 사진 6장(Unsplash License, 960px로 받음. 그 교회의 실제 모습이 아니라 `alt=""`)
    - `public/images/churches/modern-white.jpg` Remigiusz Dettlaff, https://unsplash.com/photos/modern-church-building-with-a-tall-steeple-and-cross-yc9xMSeZPnQ
    - `red-brick.jpg` Amos Lee, https://unsplash.com/photos/a-large-brick-building-with-a-clock-tower--hLV9XYURSU
    - `white-steeple.jpg` Roger Starnes Sr, https://unsplash.com/photos/white-wooden-church-under-blue-sky-H6jr8d3ElqQ
    - `stone-chapel.jpg` Wally Holden, https://unsplash.com/photos/a-church-with-a-steeple-surrounded-by-trees-nd87I3pXALw
    - `white-clock-tower.jpg` Ronni Kurtz, https://unsplash.com/photos/beige-church-near-trees-p--sYC1cSTM
    - `brick-tower.jpg` Aleksei Zaitcev, https://unsplash.com/photos/brown-concrete-building-under-blue-sky-during-daytime-gE0DpQoVRg8
  - 한강교회 목사는 목업의 "이재훈" 대신 가상 이름 "이준혁"을 씀. 실존 인물과 이름이 같기 때문
- 2026-10-02: 홈 세 번째 행(다가오는 행사 · 최근 공지 · 커뮤니티 최신 글)과 행사·공지·글 데이터 계층을 추가함 ([세부 계획](2026-10-02-home-third-row.md)). 이 행으로 홈이 참고 이미지와 같은 구성이 됨. `feat/home-third-row` branch에서 task마다 커밋하고 master에 merge 커밋으로 합침
  - **목데이터 날짜:** 고정하지 않고 지금 시각을 받아 "서울 날짜로 오늘부터 며칠 뒤 몇 시"로 만듦(`createMockEvents(now)` 등). 고정하면 시간이 지나 모두 지난 행사가 되어 홈 칸이 비고 e2e가 실패하기 때문
  - **"지금"은 빌드 시각:** `cacheComponents`가 꺼져 있어 홈은 빌드 때 정적으로 만들어짐. 다시 그리는 주기(`revalidate`/`connection`)는 Supabase를 붙일 때 정함
  - **시간대:** 날짜는 모두 `Asia/Seoul`로 표기함(`src/lib/datetime.ts`). 배포 서버(Vercel)가 UTC라 시간대를 빼먹으면 9시간 어긋나기 때문. Vitest는 `vitest.config.mts`에서 TZ를 UTC로 고정해, 그 실수를 KST 컴퓨터에서도 잡음
  - **타입:**
    - `ChurchEvent`, `Notice`, `Post`. 시각은 ISO 문자열이고, 분류는 문자열 union임
    - 화면에는 `WithChurch<T>`(교회 이름·사진)를 붙여 넘김. 목데이터 단계에서는 `data/churches.ts`의 `withChurch()`가 붙이고, Supabase 단계에서는 쿼리 join으로 바뀜
  - **고르기 로직:** `src/lib/timeline.ts`의 `pickUpcoming`·`pickLatest`를 테스트 먼저 구현함. TDD 규칙을 만든 뒤 처음 쓴 실전임
  - **홈 개수:** 행사 6개(가로 스크롤, 이전·다음 버튼), 공지 4개, 글 4개. 목데이터는 행사 10개(지난 행사 2개 포함), 공지 8개, 글 8개
  - **배치:**
    - 768px 미만은 한 열(행사 → 공지 → 커뮤니티)
    - 768~1279px는 행사를 전체 폭으로 위에, 그 아래에 공지 | 커뮤니티 두 칸. 두 번째 행과 달리 읽는 순서와 화면 순서가 같아서 2열을 씀
    - 1280px 이상은 `1.6 : 1 : 1` 세 칸(목업 44 : 28 : 28)
  - **공통 컴포넌트:**
    - 두 번째 행 계획이 미뤄 둔 "섹션 머리 공통 컴포넌트"를 `home/SectionCard`로 만들어 다섯 칸에 씀
    - 태그 목록과 색 규칙은 `common/TagList`로 옮겨 교회·행사 카드가 함께 씀
  - **분류 배지 색:** `--tag-rose`, `--tag-orange`, `--tag-gray`를 디자인 토큰에 더함. 공지·글 배지 8가지의 대비는 4.92~6.87:1
  - **목업 문구:** 제목에 연도·월을 넣지 않음. 날짜가 상대값이라 어느 때 보아도 어색하지 않게 하기 위함("2024 청년 연합 찬양집회" → "청년 연합 찬양집회", "8월 새벽부흥회" → "특별새벽기도회")
  - **사진:** 공지 썸네일은 그 교회 사진, 커뮤니티 썸네일은 행사 사진을 다시 씀. 행사 사진 6장(Unsplash License, 960px, `alt=""`)의 출처:
    - `public/images/events/worship.jpg` NATHAN MULLET, https://unsplash.com/photos/pmiW630yDPE
    - `volunteer.jpg` Rineshkumar Ghirao, https://unsplash.com/photos/UdDjFekHQuk
    - `bible.jpg` Aaron Burden, https://unsplash.com/photos/c333d6YEhi0
    - `prayer.jpg` Dallas Penner, https://unsplash.com/photos/NsQZkWRUwcs
    - `gathering.jpg` Nicolas Lobos, https://unsplash.com/photos/qbazkeo-R1o
    - `choir.jpg` Olek Buzunov, https://unsplash.com/photos/B-moLesnWhY
