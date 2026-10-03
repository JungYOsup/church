import Link from "next/link";
import { cn } from "@/lib/utils";

const EVENTS_PATH = "/events";

/**
 * 행사 태그 칩. 고른 태그는 주소(?tag=)에 두어 공유·뒤로 가기에도 같은 결과가 나오게 한다.
 * 고른 칩을 다시 누르면 전체로 돌아간다.
 */
export function EventTagFilter({ tags, selected }: { tags: string[]; selected: string | null }) {
  // key는 "전체"라는 이름의 태그가 생겨도 겹치지 않게 칩 종류를 붙인다
  const chips = [
    { key: "all", label: "전체", href: EVENTS_PATH, isSelected: selected === null, togglesOff: false },
    ...tags.map((tag) => ({
      key: `tag:${tag}`,
      label: tag,
      href: tag === selected ? EVENTS_PATH : { pathname: EVENTS_PATH, query: { tag } },
      isSelected: tag === selected,
      togglesOff: tag === selected,
    })),
  ];

  return (
    <nav aria-label="태그 필터">
      <ul role="list" className="flex flex-wrap gap-2">
        {chips.map(({ key, label, href, isSelected, togglesOff }) => (
          <li key={key}>
            <Link
              href={href}
              scroll={false}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium outline-hidden transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card text-foreground/80 hover:bg-muted",
              )}
            >
              {label}
              {/* 고른 칩은 다시 누르면 해제된다는 것을 화면 읽기 프로그램에 알린다 */}
              {togglesOff && <span className="sr-only"> 선택 해제</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
