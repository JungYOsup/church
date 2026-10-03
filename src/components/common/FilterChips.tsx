import Link from "next/link";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  /** nav의 이름 (예: "태그 필터") */
  label: string;
  /** 칩이 거르는 페이지 경로 (예: "/events") */
  basePath: string;
  /** 고른 값을 담는 주소 검색어 이름 (예: "tag") */
  param: string;
  options: string[];
  selected: string | null;
}

/**
 * 목록 페이지의 칩 필터. "전체"와 options 중 하나를 고른다.
 * 고른 값은 주소(?<param>=)에 두어 공유·뒤로 가기에도 같은 결과가 나오게 한다.
 * 고른 칩을 다시 누르면 전체로 돌아간다.
 */
export function FilterChips({ label, basePath, param, options, selected }: FilterChipsProps) {
  // key는 "전체"라는 이름의 값이 생겨도 겹치지 않게 칩 종류를 붙인다
  const chips = [
    { key: "all", text: "전체", href: basePath, isSelected: selected === null, togglesOff: false },
    ...options.map((option) => ({
      key: `option:${option}`,
      text: option,
      href: option === selected ? basePath : { pathname: basePath, query: { [param]: option } },
      isSelected: option === selected,
      togglesOff: option === selected,
    })),
  ];

  return (
    <nav aria-label={label}>
      <ul role="list" className="flex flex-wrap gap-2">
        {chips.map(({ key, text, href, isSelected, togglesOff }) => (
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
              {text}
              {/* 고른 칩은 다시 누르면 해제된다는 것을 화면 읽기 프로그램에 알린다 */}
              {togglesOff && <span className="sr-only"> 선택 해제</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
