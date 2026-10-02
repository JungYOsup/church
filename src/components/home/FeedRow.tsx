import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

/** 최근 공지·커뮤니티 목록의 한 줄: 썸네일, 제목 한 줄, 날짜·교회 줄, 분류 배지 */
export function FeedRow({
  imageUrl,
  title,
  meta,
  category,
  categoryClassName,
}: {
  imageUrl: string;
  title: string;
  meta: ReactNode;
  category: string;
  /** globals.css의 태그 토큰 클래스 (예: "bg-tag-blue-soft text-tag-blue") */
  categoryClassName: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {/* 썸네일은 교회·행사 사진을 다시 쓰는 장식이라 alt를 비운다 */}
        <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        {/* 칸이 좁으면 제목을 한 줄로 자르고, 마우스를 올리면 전체 제목을 보여 준다 */}
        <p title={title} className="truncate text-sm font-medium text-foreground">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <Badge className={categoryClassName}>{category}</Badge>
    </li>
  );
}
