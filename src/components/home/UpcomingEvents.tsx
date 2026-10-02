import { CalendarDays } from "lucide-react";
import { HorizontalScroller } from "@/components/common/HorizontalScroller";
import { EventCard } from "@/components/event/EventCard";
import { SectionCard } from "@/components/home/SectionCard";
import { getUpcomingEvents } from "@/lib/data/events";

const EVENT_COUNT = 6;
// 모바일은 한 장이 칸의 3/4, 640px부터 한 번에 3장, 1280px부터는 세 번째 행의 왼쪽 칸이라 장당 약 200px
const CARD_IMAGE_SIZES = "(min-width: 1280px) 200px, (min-width: 640px) 33vw, 75vw";

export async function UpcomingEvents({ className }: { className?: string }) {
  const events = await getUpcomingEvents(EVENT_COUNT);

  return (
    <SectionCard
      className={className}
      titleId="upcoming-events-title"
      title="다가오는 행사"
      icon={CalendarDays}
      description="지역 교회의 다양한 행사에 참여해보세요."
      link={{ href: "/events" }}
    >
      {events.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">예정된 행사가 없습니다.</p>
      ) : (
        <HorizontalScroller itemLabel="행사">
          {events.map((event) => (
            <li key={event.id} className="w-3/4 shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)]">
              <EventCard event={event} imageSizes={CARD_IMAGE_SIZES} />
            </li>
          ))}
        </HorizontalScroller>
      )}
    </SectionCard>
  );
}
