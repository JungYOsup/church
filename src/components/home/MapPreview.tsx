import { MapPin } from "lucide-react";
import { SectionCard } from "@/components/home/SectionCard";
import { ChurchMap } from "@/components/map/ChurchMap";
import { getChurches } from "@/lib/data/churches";

/** 홈의 교회 지도 칸. 키가 없거나 SDK를 불러오지 못하면 ChurchMap이 같은 자리에 대체 화면을 보여 준다 */
export async function MapPreview() {
  const churches = await getChurches();

  return (
    <SectionCard
      titleId="map-preview-title"
      title="우리 지역 교회 지도"
      icon={MapPin}
      link={{ href: "/map", label: "전체 지도 보기" }}
      contentClassName="flex flex-1 flex-col"
    >
      <ChurchMap churches={churches} showCount className="min-h-60 flex-1" />
    </SectionCard>
  );
}
