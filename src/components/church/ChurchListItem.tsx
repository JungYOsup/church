import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import type { Church } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChurchListItemProps {
  church: Church;
  selected: boolean;
  onSelect: (churchId: string) => void;
}

/**
 * 지도 페이지 목록의 한 줄. 지도 옆 좁은 칸에 여러 교회가 들어가도록 작은 사진과 핵심 정보만 둔다.
 * 줄 전체가 지도에서 그 교회를 고르는 버튼이다. 버튼 안에는 제목 요소를 둘 수 없어 이름도 span이다.
 */
export function ChurchListItem({ church, selected, onSelect }: ChurchListItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(church.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-card p-3 text-left outline-hidden transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "border-primary bg-accent hover:bg-accent",
      )}
    >
      {/* 목데이터 사진은 그 교회의 실제 모습이 아니라 장식으로 둔다. 이름은 옆 글이 알려 준다 */}
      <span className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg">
        <Image src={church.imageUrl} alt="" fill sizes="96px" className="object-cover" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 break-keep wrap-anywhere">
        <span className="font-bold text-foreground">{church.name}</span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          {church.region} {church.district}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80">
          <span>{church.pastorName} 목사</span>
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" className="size-3.5" />
            {church.memberCount.toLocaleString("ko-KR")}명
          </span>
        </span>
      </span>
    </button>
  );
}
