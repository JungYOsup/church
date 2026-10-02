import { Badge } from "@/components/ui/badge";

// globals.css의 태그 토큰. Tailwind가 클래스를 찾을 수 있게 완성된 문자열로 적는다.
const TAG_TONES = [
  "bg-tag-blue-soft text-tag-blue",
  "bg-tag-green-soft text-tag-green",
  "bg-tag-violet-soft text-tag-violet",
];

/** 태그 이름으로 색을 정해, 같은 태그는 교회 카드든 행사 카드든 같은 색이 되게 한다 */
function tagToneClassName(tag: string) {
  const sum = [...tag].reduce((total, char) => total + (char.codePointAt(0) ?? 0), 0);
  return TAG_TONES[sum % TAG_TONES.length];
}

/** 파스텔 태그 배지 목록 */
export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul role="list" className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge className={tagToneClassName(tag)}>{tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
