import type { Church } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 교회 정보 목록: 담임목사, 지역, 주소, 교인 수. 교회 상세와 대표자 관리가 같이 쓴다 */
export function ChurchFacts({ church, className }: { church: Church; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", className)}>
      <dt className="text-muted-foreground">담임목사</dt>
      <dd>{church.pastorName} 목사</dd>
      <dt className="text-muted-foreground">지역</dt>
      <dd>
        {church.region} {church.district}
      </dd>
      <dt className="text-muted-foreground">주소</dt>
      <dd>{church.address}</dd>
      <dt className="text-muted-foreground">교인 수</dt>
      <dd>{church.memberCount.toLocaleString("ko-KR")}명</dd>
    </dl>
  );
}
