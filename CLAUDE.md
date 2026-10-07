@AGENTS.md

# 함께하는 교회

여러 지역 교회를 지도 위에서 연결하는 교회 연합 커뮤니티 웹. 1인 프로젝트로, 먼저 포트폴리오/학습용으로 완성도 있는 데모와 공개 URL까지 다 만든 뒤 실사용(사업화)으로 넘어간다. 넘어가기 전까지는 무료 요금제(Vercel Hobby, Supabase Free)를 쓴다.
배경, 결정 이유, 단계별 범위는 [구현 계획](docs/plans/2026-09-30-church-community.md)에 있다.

## Tech Stack
- Node 22 (`.nvmrc`). 시스템 기본 Node가 18이라 Next.js 16이 돌지 않는다. 명령을 실행하기 전에 `nvm use`로 바꾼다.
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + ESLint
- UI: shadcn/ui, lucide-react, Pretendard 폰트
- 지도: 카카오맵 JavaScript SDK
- 백엔드 (UI 완성 후): Supabase (DB, Auth, Storage, RLS)
- 배포: Vercel Hobby. 운영 https://church-community-eight.vercel.app (master push마다 자동 배포, 함수 지역 서울 `icn1`,
  Node는 `package.json`의 `engines`). 다른 branch는 미리보기 배포로 Vercel 로그인이 필요하고 지도는 대체 화면이다

## Architecture
```
src/app/                  라우트. 홈, 교회 지도(map), 교회 상세(churches/[id], 없는 id는 404), 행사 목록(events),
                          공지 목록(notices), 커뮤니티 글 목록(community), 대표자 관리(admin: ?tab=register는 신청 탭),
                          통합 검색(search: ?q=, 교회·다가오는 행사·공지·글)
src/components/layout/    Header(서버: 알림 시각 글자도 계산) + Logo, MainNav, MobileNav, UserMenu, NotificationMenu(클라이언트)
src/components/home/      홈 섹션 (HeroBanner, StatCards, MapPreview, RecommendedChurches, RepRegisterCta,
                          UpcomingEvents, RecentNotices, CommunityFeed)과 칸 틀 SectionCard, 목록 한 줄 FeedRow
src/components/church/    교회 카드 (ChurchCard: 이름 링크를 카드 전체로 넓힘, FavoriteButton), 지도 페이지 목록의 한 줄
                          (ChurchListItem), 교회 정보 목록 (ChurchFacts, 교회 상세와 대표자 관리가 같이 씀)
src/components/event/     행사 카드 (EventCard, 홈과 행사 페이지가 같이 씀)
src/components/notice/    공지 분류 배지 색 (categoryTones, 홈 칸과 공지 페이지가 같이 씀), 공지 한 줄 (NoticeRow, 공지 페이지와 검색)
src/components/post/      커뮤니티 글 분류 배지 색 (categoryTones, 홈 칸과 커뮤니티 페이지가 같이 씀), 글 한 줄 (PostRow, 커뮤니티와 검색)
src/components/search/    검색창 (SearchForm: next/form의 GET 폼, 검색어가 없을 때만 자동 포커스)
src/components/admin/     대표자 관리 (AdminTabs: 내 교회·신청 탭, MyChurchPanel: 대표자 대시보드,
                          ChurchRegisterForm: 교회 등록·인증 신청 폼, 입력 검사 뒤 데모 접수 화면)
src/components/map/       카카오맵 (kakao.ts: 쓰는 SDK API의 타입과 한 번만 불러오는 로더, ChurchMap: 핀 지도(교회가 한 곳이면 수준 4),
                          ChurchMapExplorer: 지도 페이지의 목록 + 지도, MapFallback: 키가 없거나 SDK 실패 때의 대체 화면)
src/components/common/    여러 페이지가 쓰는 컴포넌트 (TagList, HorizontalScroller,
                          목록 페이지의 칩 필터 FilterChips, 공지·글 목록의 한 줄 틀 ArticleRow)
src/components/ui/        shadcn/ui 생성 컴포넌트. 직접 고치기보다 감싸서 쓴다
src/lib/navigation.ts     메뉴 목록과 활성 경로 판정. 데스크톱·모바일 메뉴가 같이 쓴다
src/lib/geo.ts, timeline.ts, datetime.ts, tags.ts, categories.ts, search-params.ts, ownership.ts, church-registration.ts,
search.ts                 순수 로직: 지도 범위·지역 거르기, 다가오는 행사·최신 글 고르기, 서울 시각 표기, 태그 모으기·거르기,
                          분류 모으기·거르기, 주소 검색어 값 꺼내기, 교회별 거르기, 교회 등록 신청 입력 검사,
                          검색어 낱말 나누기·맞추기(낱말이 모두 들어 있어야 맞음).
                          짝 테스트(<이름>.test.ts)가 같은 폴더에 있고 Vitest는 UTC에서 돈다
src/lib/types.ts          도메인 타입과 분류 순서 상수(NOTICE_CATEGORIES, POST_CATEGORIES)
src/lib/data/             데이터 접근 함수. 컴포넌트가 데이터를 얻는 유일한 통로
src/lib/mock/             목데이터 (UI 단계 전용)
public/images/            정적 이미지 (출처는 계획서 변경 이력에 기록)
e2e/                      Playwright 동작 테스트. 메뉴 명세는 src를 가져오지 않고 테스트에 직접 적는다.
                          카카오맵은 실제 서버를 쓰지 않는다: fixtures.ts가 SDK 요청에 빈 스크립트(대체 화면) 또는
                          kakao-fake.js(가짜 SDK, kakaoSdk: "fake")를 돌려준다
docs/plans/               계획서와 결정 기록
docs/screenshots/         README 스크린샷 (진짜 지도가 뜨는 운영 사이트에서 찍음)
.github/workflows/ci.yml  GitHub Actions: push·PR마다 lint → 단위 → e2e(빌드 포함). 러너의 Google Chrome을 씀
```
앞으로 생길 폴더(`supabase/migrations/`)는 [구현 계획](docs/plans/2026-09-30-church-community.md)을 따른다.

데이터 흐름: 페이지/컴포넌트 → `src/lib/data/*.ts`의 async 함수 → 목데이터(UI 단계) 또는 Supabase(백엔드 단계). 백엔드로 바꿀 때는 이 함수 안쪽만 고치고 UI 코드는 건드리지 않는다.

## Commands
- `nvm use` — Node 22로 전환 (새 터미널마다 먼저)
- `npm install` — 의존성 설치. `prepare` 스크립트가 git hook(`.husky/`)도 연결한다
- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run lint` — ESLint
- `npm run build` — 프로덕션 빌드 + 타입 체크
- `npm run test` — 단위 테스트(`test:unit`) 다음에 Playwright 동작 테스트(`test:e2e`). e2e는 빌드 후 3100 포트에 서버를 띄워 동시에 3개씩 실행한다 (약 40초). 개발 서버를 켠 채 돌리면 부하로 클릭이 흔들리므로 끄고 돌린다. 빌드는 가짜 카카오맵 키로 하므로, 테스트 뒤 `npm run start`로 데모하려면 `npm run build`를 다시 한다
- `npm run test:unit` — Vitest 단위 테스트(`src/**/*.test.ts`)만. 1초 안팎

## Rules
- 코드나 설정을 바꾸는 요청은 먼저 `spec-check` 스킬(`.claude/skills/spec-check/`)로 영향 범위를 찾고 작음·중간·큼으로 판정한다. 작음은 바로 수정, 중간은 짧은 계획을 확인받고 진행한다. 큼은 `plan-work` 스킬로 plan mode에서 계획하고 확인 가능한 task로 나눠 승인받은 뒤, `run-plan` 스킬로 앞 task가 동작함을 확인하며 하나씩 구현한다(실패하면 고쳐서 통과시킨 뒤 다음 task). 모호한 요구사항은 먼저 질문한다.
- 테스트를 먼저 쓰고 실패(red)를 본 뒤 구현한다. `src/lib`의 순수 로직(테스트·`types.ts`·`utils.ts`·`mock/`·`data/` 제외)은 짝 `<이름>.test.ts` 없이 쓰면 PreToolUse hook(`.claude/hooks/require-test-first.sh`)이 막는다. 계획서의 task마다 "테스트 먼저(red)"를 적고 red 출력을 증거로 남긴다.
- 승인된 계획은 `docs/plans/YYYY-MM-DD-<주제>.md`로 남긴다. 기존 계획이 바뀌면 그 문서의 `## 변경 이력`에 날짜와 이유를 적는다.
- 컴포넌트는 `src/lib/mock/`이나 Supabase 클라이언트를 직접 import하지 않고, 항상 `src/lib/data/` 함수를 거친다.
- 카카오맵 키가 없어도 빌드와 화면이 깨지지 않아야 한다. 키가 없거나 SDK를 불러오지 못하면 지도 자리에 대체 화면을 보여준다. 실제 지도는 카카오 콘솔(JavaScript SDK 도메인)에 등록한 `http://localhost:3000`의 `npm run dev`와 운영 주소에서만 뜬다.
- 비밀값은 `.env.local`에만 둔다. 이 파일은 읽거나 출력하지 않는다. 새 환경변수를 추가하면 `.env.example`에 이름과 설명만 적는다.
- Next.js는 AGENTS.md대로 `node_modules/next/dist/docs/`의 문서를 먼저 읽는다. Tailwind v4, shadcn/ui, 카카오맵, Supabase는 처음 쓰는 API를 ctx7로 확인한다 (예: Tailwind v4는 `bg-gradient-*` 대신 `bg-linear-*`, Next 16은 이미지 `priority` 대신 `preload`/`fetchPriority`).
- 커밋은 사용자가 요청할 때만 한다.
- 작업 중 걸려 넘어진 함정과 해결법은 [배운 점](docs/lessons.md)에 있다. 낯선 오류를 만나면 먼저 확인하고, 새 함정을 해결하면 그 문서에 추가한다.
- [하네스 지도](https://claude.ai/artifact/925V77bde8aKNrdrCgXHke)는 하네스 파일이나 커밋이 바뀌면 Stop hook(`.claude/hooks/sync-harness-map.sh`)이 갱신을 요청한다. 점수는 진단 결과가 바뀔 때만 고친다.

## Definition of Done
- `npm run test:unit && npm run lint && npm run build` 통과. 앱 코드(`src/`, `public/`, 설정 파일)를 바꾼 응답이 끝날 때 Stop hook(`.claude/hooks/verify-on-stop.sh`)이 바뀐 로직 파일의 짝 테스트 확인과 함께 자동으로 실행하고, 실패하면 응답을 끝내지 못한다.
- `npm run test` 통과. 커밋할 때 git pre-commit hook(`.husky/pre-commit`)이 `npm run lint && npm run test`를 자동 실행하고, 실패하면 커밋이 거부된다(문서만 바뀐 커밋은 건너뜀). 실패하면 고친 뒤 새 커밋을 만들고 `--no-verify`로 우회하지 않는다. 새 화면 동작을 만들면 `e2e/`에 테스트를 함께 추가한다.
- push한 커밋의 GitHub Actions CI가 초록이다(`gh run list`로 확인). 로컬보다 느린 러너에서만 드러나는 경쟁이 있고, CI에서는 `test.only`가 `forbidOnly`로 실패한다.
- 보이는 모습(색·간격·디자인)은 `npm run dev`로 띄워 375px / 768px / 1440px 폭에서 직접 확인한다.
- 계획과 달라진 점을 계획서 변경 이력에 적었다.
