/** 검색어 최대 길이. 넘는 부분은 버린다 */
export const MAX_QUERY_LENGTH = 50;

/**
 * 검색어를 낱말로 나눈다. 앞뒤 공백을 뺀 뒤 MAX_QUERY_LENGTH자까지만 보고, 공백으로 나누며, 영문은 소문자로 바꾼다.
 * 빈 검색어는 낱말이 없다.
 */
export function toSearchTerms(query: string): string[] {
  return query
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

/**
 * 낱말(toSearchTerms의 결과)이 모두 어느 칸엔가 들어 있으면 맞는다. 칸 안의 일부만 맞아도 되고, 영문 대소문자는 가리지 않는다.
 * 칸을 이어 붙이지 않고 칸마다 따로 보므로, 두 칸에 걸친 글자는 맞지 않는다. 낱말이 없으면 아무것도 맞지 않는다.
 */
export function matchesQuery(fields: readonly string[], terms: readonly string[]): boolean {
  if (terms.length === 0) return false;
  const lowered = fields.map((field) => field.toLowerCase());
  return terms.every((term) => lowered.some((field) => field.includes(term)));
}
