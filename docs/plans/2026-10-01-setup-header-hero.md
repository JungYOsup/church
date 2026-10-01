# 첫 작업: Next.js 세팅 + 헤더 + 홈 히어로

## Context
- 하네스 6축 사이클의 첫 바퀴입니다. 1~2번에서 계획서, CLAUDE.md, 권한 규칙을 갖췄습니다(`master` 브랜치에 push 완료). 이번에는 **작은 기능 하나로 계획 → 실행 → 검증**을 실제로 돌려 봅니다.
- 범위는 **프로젝트 세팅, 헤더, 홈 히어로**까지입니다. 통계 카드, 지도, 행사·공지·커뮤니티 목록은 다음 사이클에서 합니다.
- 기준 디자인: `~/Downloads/ChatGPT 이미지 2026년 9월 30일 오후 03_36_59-1.png`의 상단 두 영역입니다.
  - **헤더:** 로고(산+십자가) "함께하는 교회 / 지역의 교회가 함께 세상을 아름답게", 메뉴 6개(홈 활성 시 파란 밑줄), 검색, 알림(빨간 점), 프로필(아바타, "김은혜 집사님 / 서연교회 대표자", 펼침 화살표)
  - **히어로:** 둥근 카드 배너. 배경은 교회와 도시 사진이고 왼쪽은 흰 그라데이션입니다. 제목 "지역의 교회가 함께 연결되는 / **지도 기반 커뮤니티**(파랑)", 설명 2줄, 버튼 [교회 찾기(채움)] [우리 교회 등록(외곽선)], 오른쪽 위에 히브리서 10:24 인용구가 있습니다.

## 조사로 확인한 사실 (구현 방식에 영향)
1. **`create-next-app`은 이 폴더에서 바로 실행할 수 없습니다.** 허용 목록 밖의 파일(`CLAUDE.md`, `README.md`, `.harness/`, `.nvmrc`)이 있으면 충돌로 중단합니다. `is-folder-empty.ts`에서 확인했습니다.
   → **임시 폴더(scratchpad)에 생성한 뒤 필요한 파일만 복사**합니다.
2. **Next.js 16.2의 `create-next-app`은 기본으로 `AGENTS.md`와 `CLAUDE.md`(`@AGENTS.md` 한 줄)를 만듭니다.** `AGENTS.md`는 "Next.js 작업 전에 `node_modules/next/dist/docs/`의 버전에 맞는 문서를 읽어라"라는 규칙입니다.
   → `AGENTS.md`만 가져오고, 우리 CLAUDE.md 맨 위에 `@AGENTS.md`를 추가합니다. Next.js는 ctx7보다 설치된 버전의 문서가 더 정확합니다.
3. **shadcn/ui** CLI는 `npx shadcn@latest init`입니다. 옵션은 `-t next`, `-b radix|base|aria`, `-p preset`입니다. 정확한 옵션은 실행 시점에 `--help`로 확인합니다.
4. **화면 확인 도구:** Playwright 브라우저(chromium-1228)와 Google Chrome이 이미 설치되어 있어, 추가 다운로드 없이 스크린샷을 찍을 수 있습니다.

## 구현 순서

### 0. 계획 기록
- 이 계획을 `docs/plans/2026-10-01-setup-header-hero.md`로 저장합니다.
- `docs/plans/2026-09-30-church-community.md`의 `## 변경 이력`에 다음을 추가합니다.
  - 첫 작업 범위를 세팅, 헤더, 히어로로 좁힘
  - 임시 폴더에서 생성하는 방식
  - AGENTS.md 채택

### 1. 프로젝트 세팅
1. `nvm use`로 Node 22.14에서 진행합니다.
2. 임시 폴더에서 다음을 실행합니다.
   `npx create-next-app@16 scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install`
3. 프로젝트로 복사할 것: `package.json`(name을 `church`로), `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/`, `AGENTS.md`
   - 복사하지 않을 것: 기본 `README.md`, 기본 `CLAUDE.md`, `public/`의 기본 svg 아이콘들
   - 템플릿의 `.gitignore` 항목(node_modules, .next, next-env.d.ts 등)은 기존 `.gitignore`에 합칩니다.
4. `npm install`을 실행합니다.
5. shadcn을 설정합니다: `npx shadcn@latest init`(Next 템플릿, Radix 기반, CSS 변수) → `npx shadcn@latest add button sheet dropdown-menu avatar`
6. 폰트와 아이콘을 설치합니다: `npm i pretendard lucide-react`(이미 설치된 것은 건너뜀)

### 2. 기반 파일
| 파일 | 내용 |
|---|---|
| `src/app/globals.css` | shadcn 변수를 브랜드 색으로 조정합니다. primary는 파랑(이미지 기준 약 `#1F5EFF`), 배경은 연회색, 카드는 흰색, 둥근 모서리는 약 0.75rem입니다. `--font-sans`를 Pretendard로 지정합니다. |
| `src/app/layout.tsx` | `lang="ko"`, Pretendard(`next/font/local`, `pretendard` 패키지의 variable woff2), `<Header />`, 본문 컨테이너(`max-w-[1600px] mx-auto px-4`), metadata(제목 "함께하는 교회") |
| `src/lib/types.ts` | `UserProfile { id, name, title(직분), churchName, role: 'member' \| 'church_rep' \| 'admin' }` |
| `src/lib/mock/user.ts` | 김은혜 집사 / 서연교회 / `church_rep`, 안 읽은 알림 3개 |
| `src/lib/data/user.ts` | `getCurrentUser()`, `getUnreadNotificationCount()`. 목데이터를 반환하는 async 함수입니다. **CLAUDE.md의 "데이터는 `src/lib/data/`로만" 규칙을 첫 기능부터 적용합니다.** |
| `src/lib/navigation.ts` | 메뉴 6개 `{ label, href }` 목록. 데스크톱 메뉴와 모바일 메뉴가 같은 목록을 씁니다. |

### 3. 헤더 (`src/components/layout/`)
- `Header.tsx` (서버 컴포넌트): 사용자와 알림 수를 `src/lib/data`에서 받아 아래 컴포넌트에 넘깁니다. 화면 위에 고정(sticky)되고 흰 배경입니다.
- `Logo.tsx`: 산(초록·파랑)과 십자가를 inline SVG로 그리고, 제목과 부제를 붙입니다. 부제는 `sm` 미만에서 숨깁니다.
- `MainNav.tsx` (client): `usePathname`으로 현재 메뉴에 파란 글자와 밑줄을 표시합니다. `lg`(1024px) 이상에서만 보입니다.
- `MobileNav.tsx` (client): `lg` 미만에서 햄버거 버튼을 누르면 shadcn `Sheet`로 메뉴가 열립니다.
- `UserMenu.tsx` (client): `Avatar`(이니셜 "김")와 이름, 소속을 보여줍니다. 이름과 소속은 `lg` 이상에서만 보입니다. 누르면 `DropdownMenu`가 열리고 항목은 내 정보 / 우리 교회 관리 / 로그아웃입니다. 각 항목은 아직 동작 없이 표시만 합니다.
- 검색·알림 버튼: 아이콘 버튼으로 두고 `aria-label`을 붙입니다. 알림 수가 0보다 크면 빨간 점을 표시합니다. 실제 기능은 다음 사이클에서 만듭니다.

### 4. 홈 히어로 (`src/components/home/HeroBanner.tsx`, `src/app/page.tsx`)
- 배경 사진: Unsplash 무료 사진(현대식 교회 또는 도시 풍경)을 `public/images/hero-church.jpg`로 저장하고 `next/image`로 표시합니다. 로컬에 두므로 빌드가 네트워크에 의존하지 않습니다. 사진 출처 URL은 변경 이력에 적습니다. 나중에 다른 사진으로 바꾸기 쉽습니다.
- 왼쪽에서 오른쪽으로 흰색이 투명해지는 그라데이션 위에 텍스트를 올립니다.
- 버튼: "교회 찾기"(채움, `MapPin` 아이콘)는 `/map`으로, "우리 교회 등록"(외곽선, `CirclePlus` 아이콘)은 `/admin`으로 연결합니다.
- 인용구는 `lg` 이상에서 오른쪽 위에 표시합니다.
- 이미지의 슬라이드 점(●○○○)은 넣지 않습니다. 동작하지 않는 UI가 되기 때문입니다. 슬라이드가 필요하면 다음에 추가합니다.
- 반응형:
  - 데스크톱: 높이 약 340px, 텍스트는 왼쪽 절반
  - 모바일: 높이는 내용에 맞추고, 그라데이션을 더 진하게 해서 텍스트를 읽기 쉽게 하며, 버튼은 세로로 쌓습니다.

### 5. 메뉴 대상 페이지 (깨진 링크 방지)
- `src/components/common/ComingSoon.tsx`: "준비 중인 페이지입니다" 문구와 홈으로 돌아가는 링크
- `src/app/{map,events,notices,community,admin}/page.tsx`: 각 페이지는 `ComingSoon`과 페이지 제목만 렌더링합니다.

### 6. 하네스 갱신
- `CLAUDE.md`
  - 맨 위에 `@AGENTS.md`를 추가합니다.
  - Architecture 절의 "앱 코드는 아직 없다" 문장을 지우고 실제 구조로 고칩니다(`components/layout`, `components/home`, `components/common`, `lib/navigation.ts`).
  - ctx7 규칙을 나눕니다. Next.js는 AGENTS.md대로 설치된 문서를 보고, Tailwind v4·shadcn/ui·카카오맵·Supabase는 ctx7로 확인합니다.
- 작업 중 하네스에서 불편했던 점을 메모해 두었다가 4번(개선) 단계에서 반영합니다.

## 검증 (DoD)
1. `nvm use && npm run lint && npm run build`가 통과하는지 확인합니다.
2. `npm run dev`를 띄우고, Playwright(설치된 Chrome 사용)로 375 / 768 / 1440px 폭의 스크린샷을 scratchpad에 찍습니다. 참고 이미지의 헤더·히어로와 나란히 비교합니다(섹션 구성, 색, 간격, 글자 크기).
3. 동작 확인(Playwright 스크립트):
   - 메뉴를 클릭하면 각 페이지로 이동하고 밑줄이 따라 움직이는지
   - 375px에서 햄버거 버튼으로 Sheet가 열리는지
   - 프로필 드롭다운이 열리는지
   - 히어로 버튼이 `/map`, `/admin`으로 이동하는지
4. **독립 리뷰(VF-05):** 구현이 끝나면 `/code-review` 스킬로 변경 사항을 리뷰하고, 검증된 지적만 반영합니다.
5. 결과를 스크린샷과 함께 보고합니다. 커밋은 요청을 받으면 합니다.

## 범위 밖 (다음 사이클)
- 통계 카드, 지도 미리보기, 추천 교회, 행사·공지·커뮤니티 목록
- 검색과 알림 기능, 로그인
- 슬라이드 히어로
