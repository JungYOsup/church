import { Bell } from "lucide-react";
import { FeedRow } from "@/components/home/FeedRow";
import { SectionCard } from "@/components/home/SectionCard";
import { getRecentNotices } from "@/lib/data/notices";
import { formatDate } from "@/lib/datetime";
import type { NoticeCategory } from "@/lib/types";

const NOTICE_COUNT = 4;

// globals.css의 태그 토큰. Tailwind가 클래스를 찾을 수 있게 완성된 문자열로 적는다.
const CATEGORY_TONES: Record<NoticeCategory, string> = {
  행사안내: "bg-tag-blue-soft text-tag-blue",
  일정변경: "bg-tag-violet-soft text-tag-violet",
  모집안내: "bg-tag-green-soft text-tag-green",
  일반공지: "bg-tag-gray-soft text-tag-gray",
};

export async function RecentNotices() {
  const notices = await getRecentNotices(NOTICE_COUNT);

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
              categoryClassName={CATEGORY_TONES[notice.category]}
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
