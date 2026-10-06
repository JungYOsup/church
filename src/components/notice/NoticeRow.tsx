import { ArticleRow } from "@/components/common/ArticleRow";
import { NOTICE_CATEGORY_TONES } from "@/components/notice/categoryTones";
import { formatDate } from "@/lib/datetime";
import type { Notice, WithChurch } from "@/lib/types";

/** 공지 한 줄. 공지 페이지와 검색 결과가 같이 쓴다 */
export function NoticeRow({ notice }: { notice: WithChurch<Notice> }) {
  return (
    // 공지는 따로 사진이 없어 그 교회 사진을 썸네일로 쓴다
    <ArticleRow
      imageUrl={notice.church.imageUrl}
      title={notice.title}
      category={notice.category}
      categoryClassName={NOTICE_CATEGORY_TONES[notice.category]}
      excerpt={notice.summary}
      meta={
        <>
          <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {notice.church.name}
        </>
      }
    />
  );
}
