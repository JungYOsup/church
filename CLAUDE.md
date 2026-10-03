@AGENTS.md

# 함께하는 교회

여러 지역 교회를 지도 위에서 연결하는 교회 연합 커뮤니티 웹. 포트폴리오/학습용 1인 프로젝트이고, 목표는 완성도 있는 데모와 공개 URL이다.
배경, 결정 이유, 단계별 범위는 [구현 계획](docs/plans/2026-09-30-church-community.md)에 있다.

## Tech Stack
- Node 22 (`.nvmrc`). 시스템 기본 Node가 18이라 Next.js 16이 돌지 않는다. 명령을 실행하기 전에 `nvm use`로 바꾼다.
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + ESLint
- UI: shadcn/ui, lucide-react, Pretendard 폰트
- 지도: 카카오맵 JavaScript SDK
- 백엔드 (UI 완성 후): Supabase (DB, Auth, Storage, RLS)
- 배포: Vercel

## Architecture
```
src/app/                  라우트. 홈과 행사 목록(events)을 구현했고 map, notices, community, admin은 ComingSoon 자리표시 페이지
src/components/layout/    Header(서버) + Logo, MainNav, MobileNav, UserMenu(클라이언트)
src/components/home/      홈 섹션 (HeroBanner, StatCards, MapPreview, RecommendedChurches, RepRegisterCta,
                          UpcomingEvents, RecentNotices, CommunityFeed)과 칸 틀 SectionCard, 목록 한 줄 FeedRow
src/components/church/    교회 카드 (ChurchCard, FavoriteButton). 지도 페이지 목록도 같이 쓴다
src/components/event/     행사 카드 (EventCard, 홈과 행사 페이지가 같이 씀)와 행사 페이지의 태그 칩 (EventTagFilter)
src/components/map/       지도 (MapFallback: 카카오맵 키가 없을 때의 대체 화면)
src/components/common/    여러 페이지가 쓰는 컴포넌트 (ComingSoon, TagList, HorizontalScroller)
src/components/ui/        shadcn/ui 생성 컴포넌트. 직접 고치기보다 감싸서 쓴다
src/lib/navigation.ts     메뉴 목록과 활성 경로 판정. 데스크톱·모바일 메뉴가 같이 쓴다
src/lib/geo.ts, timeline.ts, datetime.ts, tags.ts
                          순수 로직: 지도 범위 거르기, 다가오는 행사·최신 글 고르기, 서울 시각 표기, 태그 모으기·거르기.
                          짝 테스트(<이름>.test.ts)가 같은 폴더에 있고 Vitest는 UTC에서 돈다
src/lib/types.ts          도메인 타입
src/lib/data/             데이터 접근 함수. 컴포넌트가 데이터를 얻는 유일한 통로
src/lib/mock/             목데이터 (UI 단계 전용)
public/images/            정적 이미지 (출처는 계획서 변경 이력에 기록)
e2e/                      Playwright 동작 테스트. 메뉴 명세는 src를 가져오지 않고 테스트에 직접 적는다
docs/plans/               계획서와 결정 기록
```
앞으로 생길 폴더(`supabase/migrations/`)는 [구현 계획](docs/plans/2026-09-30-church-community.md)을 따른다.

데이터 흐름: 페이지/컴포넌트 → `src/lib/data/*.ts`의 async 함수 → 목데이터(UI 단계) 또는 Supabase(백엔드 단계). 백엔드로 바꿀 때는 이 함수 안쪽만 고치고 UI 코드는 건드리지 않는다.

## Commands
- `nvm use` — Node 22로 전환 (새 터미널마다 먼저)
- `npm install` — 의존성 설치. `prepare` 스크립트가 git hook(`.husky/`)도 연결한다
- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run lint` — ESLint
- `npm run build` — 프로덕션 빌드 + 타입 체크
- `npm run test` — 단위 테스트(`test:unit`) 다음에 Playwright 동작 테스트(`test:e2e`). e2e는 빌드 후 3100 포트에 서버를 띄워 실행한다 (개발 서버와 같이 켜도 됨, 약 20초)
- `npm run test:unit` — Vitest 단위 테스트(`src/**/*.test.ts`)만. 1초 안팎

## Rules
- 코드나 설정을 바꾸는 요청은 먼저 `spec-check` 스킬(`.claude/skills/spec-check/`)로 영향 범위를 찾고 작음·중간·큼으로 판정한다. 작음은 바로 수정, 중간은 짧은 계획을 확인받고 진행한다. 큼은 `plan-work` 스킬로 plan mode에서 계획하고 확인 가능한 task로 나눠 승인받은 뒤, `run-plan` 스킬로 앞 task가 동작함을 확인하며 하나씩 구현한다(실패하면 고쳐서 통과시킨 뒤 다음 task). 모호한 요구사항은 먼저 질문한다.
- 테스트를 먼저 쓰고 실패(red)를 본 뒤 구현한다. `src/lib`의 순수 로직(테스트·`types.ts`·`utils.ts`·`mock/`·`data/` 제외)은 짝 `<이름>.test.ts` 없이 쓰면 PreToolUse hook(`.claude/hooks/require-test-first.sh`)이 막는다. 계획서의 task마다 "테스트 먼저(red)"를 적고 red 출력을 증거로 남긴다.
- 승인된 계획은 `docs/plans/YYYY-MM-DD-<주제>.md`로 남긴다. 기존 계획이 바뀌면 그 문서의 `## 변경 이력`에 날짜와 이유를 적는다.
- 컴포넌트는 `src/lib/mock/`이나 Supabase 클라이언트를 직접 import하지 않고, 항상 `src/lib/data/` 함수를 거친다.
- 카카오맵 키가 없어도 빌드와 화면이 깨지지 않아야 한다. 키가 없으면 지도 자리에 대체 화면을 보여준다.
- 비밀값은 `.env.local`에만 둔다. 이 파일은 읽거나 출력하지 않는다. 새 환경변수를 추가하면 `.env.example`에 이름과 설명만 적는다.
- Next.js는 AGENTS.md대로 `node_modules/next/dist/docs/`의 문서를 먼저 읽는다. Tailwind v4, shadcn/ui, 카카오맵, Supabase는 처음 쓰는 API를 ctx7로 확인한다 (예: Tailwind v4는 `bg-gradient-*` 대신 `bg-linear-*`, Next 16은 이미지 `priority` 대신 `preload`/`fetchPriority`).
- 커밋은 사용자가 요청할 때만 한다.
- 작업 중 걸려 넘어진 함정과 해결법은 [배운 점](docs/lessons.md)에 있다. 낯선 오류를 만나면 먼저 확인하고, 새 함정을 해결하면 그 문서에 추가한다.
- [하네스 지도](https://claude.ai/artifact/925V77bde8aKNrdrCgXHke)는 하네스 파일이나 커밋이 바뀌면 Stop hook(`.claude/hooks/sync-harness-map.sh`)이 갱신을 요청한다. 점수는 진단 결과가 바뀔 때만 고친다.

## Definition of Done
- `npm run test:unit && npm run lint && npm run build` 통과. 앱 코드(`src/`, `public/`, 설정 파일)를 바꾼 응답이 끝날 때 Stop hook(`.claude/hooks/verify-on-stop.sh`)이 바뀐 로직 파일의 짝 테스트 확인과 함께 자동으로 실행하고, 실패하면 응답을 끝내지 못한다.
- `npm run test` 통과. 커밋할 때 git pre-commit hook(`.husky/pre-commit`)이 `npm run lint && npm run test`를 자동 실행하고, 실패하면 커밋이 거부된다(문서만 바뀐 커밋은 건너뜀). 실패하면 고친 뒤 새 커밋을 만들고 `--no-verify`로 우회하지 않는다. 새 화면 동작을 만들면 `e2e/`에 테스트를 함께 추가한다.
- 보이는 모습(색·간격·디자인)은 `npm run dev`로 띄워 375px / 768px / 1440px 폭에서 직접 확인한다.
- 계획과 달라진 점을 계획서 변경 이력에 적었다.
