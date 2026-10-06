import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

/** 목록 페이지(공지·커뮤니티)의 한 줄: 썸네일, 제목과 분류 배지, 미리보기 두 줄, 날짜·교회 줄 */
export function ArticleRow({
  imageUrl,
  title,
  category,
  categoryClassName,
  excerpt,
  meta,
}: {
  imageUrl: string;
  title: string;
  category: string;
  /** globals.css의 태그 토큰 클래스 (예: "bg-tag-blue-soft text-tag-blue") */
  categoryClassName: string;
  excerpt: string;
  meta: ReactNode;
}) {
  return (
    // 위쪽 정렬: 기본(stretch)이면 썸네일이 줄 높이만큼 늘어나 4:3 비율이 깨진다
    <li className="flex items-start gap-3 py-4 sm:gap-4">
      <div className="relative aspect-4/3 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:w-24">
        {/* 썸네일은 교회·행사 사진을 다시 쓰는 장식이라 alt를 비운다 */}
        <Image src={imageUrl} alt="" fill sizes="(min-width: 640px) 96px, 64px" className="object-cover" />
      </div>
      {/* wrap-anywhere: 띄어쓰기 없는 긴 제목(주소, 긴 영단어)도 줄을 바꿔 카드 밖으로 넘치지 않게 한다 */}
      <div className="min-w-0 flex-1 break-keep wrap-anywhere">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge className={categoryClassName}>{category}</Badge>
        </div>
        {/* 넓은 화면에서도 읽는 줄이 너무 길어지지 않게 폭을 제한한다.
            max-w-prose(65ch)는 숫자 0의 폭 기준이라 한글로는 30자 남짓에서 꺾여 쓰지 않는다 */}
        <p className="mt-1 line-clamp-2 max-w-4xl text-sm text-foreground/80">{excerpt}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>
      </div>
    </li>
  );
}
