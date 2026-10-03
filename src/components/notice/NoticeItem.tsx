import Image from "next/image";
import { NOTICE_CATEGORY_TONES } from "@/components/notice/categoryTones";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/datetime";
import type { Notice, WithChurch } from "@/lib/types";

/** 공지 페이지 목록의 한 줄: 교회 사진, 제목과 분류 배지, 요약 두 줄, 날짜·교회 */
export function NoticeItem({ notice }: { notice: WithChurch<Notice> }) {
  return (
    // 위쪽 정렬: 기본(stretch)이면 썸네일이 줄 높이만큼 늘어나 4:3 비율이 깨진다
    <li className="flex items-start gap-3 py-4 sm:gap-4">
      <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:w-24">
        {/* 썸네일은 그 교회 사진을 다시 쓰는 장식이라 alt를 비운다 */}
        <Image
          src={notice.church.imageUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 96px, 64px"
          className="object-cover"
        />
      </div>
      {/* wrap-anywhere: 띄어쓰기 없는 긴 제목(주소, 긴 영단어)도 줄을 바꿔 카드 밖으로 넘치지 않게 한다 */}
      <div className="min-w-0 flex-1 break-keep wrap-anywhere">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{notice.title}</h3>
          <Badge className={NOTICE_CATEGORY_TONES[notice.category]}>{notice.category}</Badge>
        </div>
        {/* 넓은 화면에서도 읽는 줄이 너무 길어지지 않게 폭을 제한한다.
            max-w-prose(65ch)는 숫자 0의 폭 기준이라 한글로는 30자 남짓에서 꺾여 쓰지 않는다 */}
        <p className="mt-1 line-clamp-2 max-w-4xl text-sm text-foreground/80">{notice.summary}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          <time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {notice.church.name}
        </p>
      </div>
    </li>
  );
}
