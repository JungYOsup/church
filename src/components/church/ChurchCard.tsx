import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { FavoriteButton } from "@/components/church/FavoriteButton";
import { TagList } from "@/components/common/TagList";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Church } from "@/lib/types";

export function ChurchCard({ church, imageSizes }: { church: Church; imageSizes: string }) {
  return (
    <Card size="sm" className="h-full pt-0 shadow-xs">
      <div className="relative aspect-16/10">
        {/* 목데이터 사진은 그 교회의 실제 모습이 아니라 장식으로 둔다. 이름은 아래 제목이 알려 준다 */}
        <Image src={church.imageUrl} alt="" fill sizes={imageSizes} className="object-cover" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
          <MapPin aria-hidden="true" className="size-3" />
          {church.region} {church.district}
        </span>
        <FavoriteButton churchName={church.name} className="absolute top-2 right-2" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-(--card-spacing) break-keep">
        <h3 className="text-base font-bold text-foreground">{church.name}</h3>
        {/* 카드가 나란히 놓이는 폭에서는 소개가 한 줄이어도 두 줄 자리를 잡아 목사 줄 높이를 맞춘다 */}
        <p className="line-clamp-2 text-muted-foreground sm:min-h-[2lh]">{church.slogan}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Avatar size="sm">
              <AvatarFallback className="bg-accent font-semibold text-primary">
                {church.pastorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {church.pastorName} 목사
          </span>
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" className="size-3.5" />
            {church.memberCount.toLocaleString("ko-KR")}명
          </span>
        </p>
        <TagList tags={church.tags} />
      </div>
    </Card>
  );
}
