import { MapPin } from "lucide-react";
import { SectionCard } from "@/components/home/SectionCard";
import { MapFallback } from "@/components/map/MapFallback";

// 카카오맵 작업에서 키가 있으면 지도를, 없으면 MapFallback을 그리도록 바꾼다
export function MapPreview() {
  return (
    <SectionCard
      titleId="map-preview-title"
      title="우리 지역 교회 지도"
      icon={MapPin}
      link={{ href: "/map", label: "전체 지도 보기" }}
      contentClassName="flex flex-1 flex-col"
    >
      <MapFallback className="min-h-60 flex-1" />
    </SectionCard>
  );
}
