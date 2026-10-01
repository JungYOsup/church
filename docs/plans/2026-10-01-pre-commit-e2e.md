# 커밋할 때 e2e 자동 실행: git pre-commit hook (husky)

## Context
- 지금 e2e(`npm run test`, Playwright 17개)는 CLAUDE.md DoD의 "커밋 전 통과"라는 **약속**입니다. Claude가 기억해서 돌려야 하고, 놓쳐도 막는 장치가 없습니다. 실제로 직전 커밋(`b1edd99`)도 커밋 직전에 다시 돌리지 않았습니다.
- `git commit`이 실행되는 순간 테스트를 돌리고, 실패하면 커밋을 거부하는 **git pre-commit hook**으로 바꿉니다. Claude의 커밋과 사용자가 직접 하는 커밋 모두에 적용됩니다.
- 6축으로는 검증 축(테스트 자동 실행)과 실행 축(DoD 강제)입니다. lint·build를 Stop hook으로 강제한 것과 같은 흐름입니다.

## 확인한 사실
- **기존 git hook:** 전역·로컬·시스템 모두 `core.hooksPath`가 없고 `.git/hooks`에도 활성 hook이 없어 충돌하지 않습니다.
- **팀 관례:** 팀 워크플로(sizl-workflow)는 git hook을 **husky**(`.husky/pre-commit`)로 관리합니다. 같은 도구를 쓰면 나중에 팀 hook(커밋 메시지 마커 검사 등)을 같은 폴더에 붙이기 쉽습니다.
- **husky v9(공식 문서):**
  - `package.json`에 `"prepare": "husky"`를 두면 `npm install` 때 hook이 연결됩니다.
  - hook은 `.husky/pre-commit`에 셸 명령으로 적습니다.
  - nvm 같은 버전 관리자는 hook 안에서 직접 불러와야 합니다.
- **우회 방지:** `git commit --no-verify`(hook 우회)와 `--amend`는 이미 `.claude/settings.json`의 확인(ask) 규칙에 있어, Claude가 우회하려면 사용자 승인이 필요합니다.

## 만들 것

### 1. husky 설치
- `npm i -D husky`
- `package.json`에 `"prepare": "husky"`를 추가합니다. `npx husky init`은 기본 hook 내용을 덮어쓰므로 쓰지 않고, 직접 설정합니다.
- `npm run prepare`를 한 번 실행해 지금 저장소에 연결합니다. `git config core.hooksPath`가 `.husky/_`가 됩니다.

### 2. `.husky/pre-commit`
```sh
# 앱·테스트 코드가 바뀐 커밋이면 lint와 동작 테스트를 실행하고, 실패하면 커밋을 거부한다.
# 문서만 바뀐 커밋(docs/, CLAUDE.md 등)은 건너뛴다.
```
1. **대상 확인:** `git diff --cached --name-only`로 이번 커밋에 들어갈 파일을 봅니다. `src/`, `public/`, `e2e/`, `package.json`, `package-lock.json`, 설정 파일(`tsconfig.json`, `next.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`)이 하나도 없으면 바로 통과합니다.
2. **Node 22:** nvm을 불러와 `.nvmrc` 버전으로 바꿉니다.
3. **실행:** `npm run lint && npm run test`
   - e2e를 요청하셨지만 lint를 함께 넣습니다. 약 3초면 끝나고, 사용자가 직접 커밋할 때는 Stop hook이 돌지 않아 lint가 빠지기 때문입니다.
   - build는 `npm run test`가 서버를 띄우기 전에 실행하므로 타입 검사도 포함됩니다.
   - 결과적으로 **커밋 시점에 DoD 전체(lint + build + e2e)**를 확인합니다.
4. 실패하면 0이 아닌 값으로 끝나 git이 커밋을 거부하고, 테스트 출력이 그대로 보입니다.

### 3. 하네스 반영
- **`CLAUDE.md` DoD:** "`npm run test` 통과 (커밋 전…)" 줄을 다음처럼 바꿉니다. "커밋할 때 git pre-commit hook(`.husky/pre-commit`)이 `npm run lint && npm run test`를 자동 실행하고, 실패하면 커밋이 거부된다. 실패하면 고친 뒤 새 커밋을 만들고 `--no-verify`로 우회하지 않는다. 문서만 바뀐 커밋은 건너뛴다."
- **`CLAUDE.md` Commands:** `npm install`이 git hook도 연결한다는 점(`prepare`)을 한 줄 추가합니다.
- **`.claude/hooks/sync-harness-map.sh`:** 감시 경로(`HARNESS_PATHS`)에 `.husky`를 추가합니다. git hook이 바뀌어도 지도 갱신을 요청하게 하기 위함입니다.
- 이 계획을 `docs/plans/2026-10-01-pre-commit-e2e.md`로 저장합니다.
- 응답을 끝낼 때 지도 반영 hook이 요청하면, 지도에 `.husky/pre-commit`(실행·검증 축)과 DoD 설명을 반영합니다. 점수와 체크 상태는 그대로 둡니다.

## 검증
진짜 staging 영역을 건드리지 않도록 **임시 index 파일**(`GIT_INDEX_FILE`)로 커밋 대상을 흉내 내서 hook을 직접 실행합니다.
1. **문서만 커밋:** 임시 index에 `docs/plans/...md`만 올림 → hook이 테스트 없이 즉시 통과
2. **앱 코드 커밋, 테스트 통과:** 임시 index에 `src/lib/navigation.ts`를 올림 → lint와 test 실행 → 통과
3. **앱 코드 커밋, 테스트 실패:** 메뉴 "행사"를 "행사안내"로 바꾸고 임시 index에 올림 → hook이 실패로 끝남(커밋 거부에 해당) → 되돌림
4. **연결 확인:** `git config core.hooksPath`가 `.husky/_`인지 확인합니다.
5. **실제 커밋:** 이번 작업을 커밋할 때(요청 시) `package.json`이 포함되므로 hook이 실제로 lint와 test를 돌리는 것을 직접 확인합니다.
6. DoD lint·build는 Stop hook이 확인합니다.

## 알아 둘 한계
- **테스트 대상:** hook은 staging된 내용이 아니라 **작업 폴더의 현재 상태**를 테스트합니다. 파일 일부만 골라 커밋하면 커밋 내용과 테스트한 내용이 다를 수 있습니다. 혼자 작업하고 보통 전체를 커밋하므로 지금은 감수합니다.
- **커밋 시간:** 앱 코드가 포함된 커밋은 약 20초 더 걸립니다.

## 범위 밖
- 팀의 커밋 메시지 마커 검사 hook(`sizl-commit-msg`): 필요하면 같은 `.husky/` 폴더에 따로 추가합니다.
- CI(GitHub Actions): 배포할 때 추가합니다.

## 검증 결과 (2026-10-01)
- `npm run prepare`로 연결: `core.hooksPath=.husky/_`. husky는 hook을 `sh -e`로 실행하므로 같은 방식(`.husky/_/pre-commit`)으로 시험
- 임시 index(`GIT_INDEX_FILE`)로 진짜 staging 영역을 건드리지 않고 시험
  - 문서만 커밋: 테스트 없이 0초 통과
  - `package.json` 포함: lint + 테스트 17개 통과, 약 20초
  - 메뉴 "행사"를 "행사안내"로 바꾼 `src/lib/navigation.ts` 포함: 테스트 1개 실패, `husky - pre-commit script failed (code 1)`로 거부. 되돌림
