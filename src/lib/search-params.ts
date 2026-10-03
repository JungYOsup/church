/**
 * 주소의 검색어 값(`?tag=`, `?category=` 등)에서 값 하나를 꺼낸다. 같은 이름이 여러 번 오면(?tag=a&tag=b)
 * 첫 값을 쓰고, 값이 없거나 비어 있으면 null(전체)이다.
 */
export function parseSearchParam(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : null;
}
