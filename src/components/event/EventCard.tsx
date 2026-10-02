import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { TagList } from "@/components/common/TagList";
import { Card } from "@/components/ui/card";
import { formatEventBadge, formatEventDateTime } from "@/lib/datetime";
import type { ChurchEvent, WithChurch } from "@/lib/types";

export function EventCard({
  event,
  imageSizes,
}: {
  event: WithChurch<ChurchEvent>;
  imageSizes: string;
}) {
  const badge = formatEventBadge(event.startsAt);

  return (
    <Card size="sm" className="h-full pt-0 shadow-xs">
      <div className="relative aspect-video">
        {/* 행사 사진은 주제를 보여 주는 장식이라 alt를 비운다. 제목은 아래에 있다 */}
        <Image src={event.imageUrl} alt="" fill sizes={imageSizes} className="object-cover" />
        {/* 아래 일시 줄이 같은 날짜를 읽어 주므로 배지는 화면 읽기에서 뺀다 */}
        <span
          aria-hidden="true"
          className="absolute top-2 left-2 flex min-w-11 flex-col items-center rounded-lg bg-card/95 px-2 py-1 leading-tight shadow-sm"
        >
          <span className="text-sm font-bold text-foreground tabular-nums">{badge.monthDay}</span>
          <span className="text-xs text-muted-foreground">({badge.weekday})</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-(--card-spacing) break-keep">
        <h3 className="text-base font-bold text-foreground">{event.title}</h3>
        <p className="flex items-start gap-1 text-xs text-foreground/80">
          <MapPin aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          {event.church.name}
        </p>
        <p className="flex items-start gap-1 text-xs text-foreground/80">
          <Clock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          <time dateTime={event.startsAt}>{formatEventDateTime(event.startsAt)}</time>
        </p>
        <TagList tags={event.tags} />
      </div>
    </Card>
  );
}
