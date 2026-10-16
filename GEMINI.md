# Gemini PR 리뷰 지침

PR을 열거나 `@gemini-cli /review` 댓글을 달면 GitHub Actions의 Gemini 리뷰(`.github/workflows/gemini-review.yml`)가 이 파일을 읽는다.

- 리뷰 요약과 줄별 코멘트는 모두 한국어로 쓴다. 코드, 파일 경로, 식별자는 원문 그대로 둔다.
- 아래에 불러온 `CLAUDE.md`가 이 프로젝트의 규칙이다. Architecture(폴더별 역할, 데이터 흐름)와 Rules를 위반 판단 기준으로 쓴다.
  예: 컴포넌트가 `src/lib/mock/`이나 Supabase 클라이언트를 `src/lib/data/` 없이 직접 import함, `src/lib`의 순수 로직에 짝 `<이름>.test.ts`가 없음,
  PR 설명과 관계없는 변경이 섞임, 비밀값이 코드에 들어감.
- `CLAUDE.md`의 작업 절차(스킬, hook, 커밋·merge 방법)는 코드를 쓰는 Claude에게 주는 지시다. PR이 그 절차를 따랐는지는 리뷰하지 않는다.
- lint, 단위 테스트, e2e, 빌드는 CI가 돌린다. 형식이나 lint 수준의 지적은 하지 않는다.

@./CLAUDE.md
