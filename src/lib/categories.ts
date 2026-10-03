/**
 * 항목에 쓰인 분류를 order 순서대로 돌려준다. 항목이 하나도 없는 분류는 뺀다.
 * 분류는 몇 개로 정해져 있어, 많이 쓰인 순서보다 정해진 순서가 예측하기 쉽다.
 * order에 없는 분류는 돌려주지 않는다. 분류 타입(C)을 order와 같게 두어 타입 수준에서 그런 항목이 생기지 않게 한다.
 */
export function collectCategories<C extends string>(items: { category: C }[], order: readonly C[]): C[] {
  const used = new Set(items.map((item) => item.category));
  return order.filter((category) => used.has(category));
}

/**
 * 그 분류의 항목만 원래 순서대로 남긴다. category가 null이면 전부 돌려준다.
 * 이름이 정확히 같을 때만 맞는 것으로 본다.
 */
export function filterByCategory<T extends { category: string }>(items: T[], category: string | null): T[] {
  if (category === null) return [...items];
  return items.filter((item) => item.category === category);
}
