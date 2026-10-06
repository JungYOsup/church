"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ChurchListItem } from "@/components/church/ChurchListItem";
import { ChurchMap } from "@/components/map/ChurchMap";
import { filterWithinBounds, type MapBounds } from "@/lib/geo";
import type { Church } from "@/lib/types";

/**
 * 지도 페이지의 교회 목록과 지도. 지도가 멈출 때마다 그 범위 안의 교회만 목록에 남긴다.
 * 지도를 쓸 수 없으면(범위가 없으면) 받은 교회를 모두 보여 준다.
 * 핀이나 목록 줄로 교회를 하나 고르고, 고른 것을 다시 누르면 고르기를 푼다.
 */
export function ChurchMapExplorer({ churches }: { churches: Church[] }) {
  // 받은 교회를 id로 이은 값. 지역 칩으로 받은 교회가 바뀌었는지 가린다
  const churchKey = churches.map((church) => church.id).join(",");
  // 지도가 알려 준 범위와, 그 범위를 잴 때의 교회. 지역을 바꾸면 지도가 새 교회 모두에 다시 맞추므로,
  // 그 전까지는 앞 지역의 범위로 거르지 않고 새 교회를 모두 보인다
  const [view, setView] = useState<{ bounds: MapBounds; churchKey: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectionKey, setSelectionKey] = useState(churchKey);
  const listRef = useRef<HTMLUListElement>(null);

  // 지역을 바꿔 고른 교회가 빠지면 고르기를 푼다. 그리지 않고 숨기기만 하면 전체로 돌아왔을 때 되살아난다
  if (selectionKey !== churchKey) {
    setSelectionKey(churchKey);
    if (selected !== null && !churches.some((church) => church.id === selected)) setSelected(null);
  }

  const mapIsLive = view !== null;
  const visibleChurches =
    view !== null && view.churchKey === churchKey ? filterWithinBounds(churches, view.bounds) : churches;

  const toggleSelected = (churchId: string) => setSelected((current) => (current === churchId ? null : churchId));

  // 핀으로 고른 교회가 목록 칸 밖에 있으면 보이게 굴린다. 목록이 혼자 스크롤되는 폭(데스크톱)에서만 하고,
  // 모바일에서는 페이지가 지도에서 목록으로 내려가지 않게 둔다
  useEffect(() => {
    const list = listRef.current;
    if (selected === null || !list || list.scrollHeight <= list.clientHeight) return;
    list.querySelector(`[data-church-id="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    // 읽는 순서는 목록이 먼저다. 키보드로 핀 15개를 지나지 않고 목록에 닿게 하기 위함이고,
    // 1024px 미만에서만 화면에서 지도를 위로 올린다
    <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100dvh-15rem)] lg:min-h-[560px] lg:grid-cols-[360px_minmax(0,1fr)]">
      <section aria-labelledby="church-list-title" className="order-last flex min-h-0 flex-col gap-3 lg:order-none">
        <div className="flex items-baseline gap-2">
          <h2 id="church-list-title" className="text-lg font-bold text-foreground">
            교회 목록
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {mapIsLive ? `현재 지도 범위 내 교회 ${visibleChurches.length}개` : `교회 ${visibleChurches.length}개`}
          </p>
        </div>

        {visibleChurches.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-muted-foreground break-keep">
            지도 범위 안에 교회가 없습니다. 지도를 옮기거나 축소해 보세요.
          </p>
        ) : (
          <ul ref={listRef} role="list" className="flex min-h-0 flex-col gap-2 lg:overflow-y-auto lg:pr-1">
            {visibleChurches.map((church) => (
              <li key={church.id} data-church-id={church.id} className="flex flex-col gap-1">
                <ChurchListItem church={church} selected={church.id === selected} onSelect={toggleSelected} />
                {/* 줄 전체가 고르기 버튼이라 링크를 그 안에 둘 수 없어, 고른 줄 아래에 따로 둔다 */}
                {church.id === selected && (
                  <Link
                    href={`/churches/${church.id}`}
                    aria-label={`${church.name} 자세히 보기`}
                    className="inline-flex items-center gap-0.5 self-end rounded-md px-1 text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    자세히 보기
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ChurchMap
        churches={churches}
        selectedId={selected}
        onSelect={toggleSelected}
        onBoundsChange={(bounds) => setView({ bounds, churchKey })}
        className="h-[55svh] min-h-80 lg:h-full"
      />
    </div>
  );
}
