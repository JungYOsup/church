import { Bell } from "lucide-react";
import { FeedRow } from "@/components/home/FeedRow";
import { SectionCard } from "@/components/home/SectionCard";
import { NOTICE_CATEGORY_TONES } from "@/components/notice/categoryTones";
import { getRecentNotices } from "@/lib/data/notices";
import { formatDate } from "@/lib/datetime";

const NOTICE_COUNT = 4;

export async function RecentNotices() {
  const notices = await getRecentNotices({ limit: NOTICE_COUNT });

  return (
    <SectionCard
      titleId="recent-notices-title"
      title="최근 공지"
      icon={Bell}
      description="교회들의 중요한 소식을 확인해보세요."
      link={{ href: "/notices" }}
    >
      {notices.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">등록된 공지가 없습니다.</p>
      ) : (
        <ul role="list" className="flex flex-col gap-3">
          {notices.map((notice) => (
            <FeedRow
              key={notice.id}
              imageUrl={notice.church.imageUrl}
              title={notice.title}
              category={notice.category}
              categoryClassName={NOTICE_CATEGORY_TONES[notice.category]}
              meta={
                <>
                  <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
                  <span aria-hidden="true"> · </span>
                  {notice.church.name}
                </>
              }
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
