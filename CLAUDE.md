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
앱 코드는 아직 없다. 첫 세팅 작업에서 아래 구조로 만들고, 실제 구조가 달라지면 이 절을 고친다.

```
src/app/              라우트: 홈, map, churches/[id], events, notices, community, admin
src/components/       layout/ home/ church/ event/ map/ ui/(shadcn)
src/lib/types.ts      도메인 타입 (Church, ChurchEvent, Notice, Post, Stats, UserProfile)
src/lib/data/         데이터 접근 함수. 컴포넌트가 데이터를 얻는 유일한 통로
src/lib/mock/         목데이터 (UI 단계 전용)
supabase/migrations/  DB 스키마 (백엔드 단계)
docs/plans/           계획서와 결정 기록
```

데이터 흐름: 페이지/컴포넌트 → `src/lib/data/*.ts`의 async 함수 → 목데이터(UI 단계) 또는 Supabase(백엔드 단계). 백엔드로 바꿀 때는 이 함수 안쪽만 고치고 UI 코드는 건드리지 않는다.

## Commands
- `nvm use` — Node 22로 전환 (새 터미널마다 먼저)
- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run lint` — ESLint
- `npm run build` — 프로덕션 빌드 + 타입 체크

## Rules
- 여러 파일을 바꾸는 작업은 plan mode로 계획을 세우고, 모호한 요구사항은 먼저 질문한 뒤, 승인 후 구현한다.
- 승인된 계획은 `docs/plans/YYYY-MM-DD-<주제>.md`로 남긴다. 기존 계획이 바뀌면 그 문서의 `## 변경 이력`에 날짜와 이유를 적는다.
- 컴포넌트는 `src/lib/mock/`이나 Supabase 클라이언트를 직접 import하지 않고, 항상 `src/lib/data/` 함수를 거친다.
- 카카오맵 키가 없어도 빌드와 화면이 깨지지 않아야 한다. 키가 없으면 지도 자리에 대체 화면을 보여준다.
- 비밀값은 `.env.local`에만 둔다. 이 파일은 읽거나 출력하지 않는다. 새 환경변수를 추가하면 `.env.example`에 이름과 설명만 적는다.
- Next.js 16, Tailwind v4, shadcn/ui, 카카오맵, Supabase는 최근 버전에서 API가 크게 바뀌었다. 처음 쓰는 API는 ctx7로 현재 문서를 확인하고 쓴다.
- 커밋은 사용자가 요청할 때만 한다.

## Definition of Done
- `npm run lint && npm run build` 통과
- UI를 바꿨다면 `npm run dev`로 띄워 375px / 768px / 1440px 폭에서 화면을 확인한다.
- 계획과 달라진 점을 계획서 변경 이력에 적었다.
