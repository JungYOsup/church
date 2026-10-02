import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { MapFallback } from "@/components/map/MapFallback";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 카카오맵 작업에서 키가 있으면 지도를, 없으면 MapFallback을 그리도록 바꾼다
export function MapPreview() {
  return (
    <section aria-labelledby="map-preview-title" className="min-w-0">
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle>
            <h2
              id="map-preview-title"
              className="flex items-center gap-2 text-lg font-bold text-foreground"
            >
              <MapPin aria-hidden="true" className="size-5 text-primary" />
              우리 지역 교회 지도
            </h2>
          </CardTitle>
          <CardAction>
            <Link
              href="/map"
              className="inline-flex items-center gap-0.5 rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              전체 지도 보기
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <MapFallback className="min-h-60 flex-1" />
        </CardContent>
      </Card>
    </section>
  );
}
