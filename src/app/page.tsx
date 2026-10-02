import { HeroBanner } from "@/components/home/HeroBanner";
import { MapPreview } from "@/components/home/MapPreview";
import { RecommendedChurches } from "@/components/home/RecommendedChurches";
import { RepRegisterCta } from "@/components/home/RepRegisterCta";
import { StatCards } from "@/components/home/StatCards";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <HeroBanner />
      <StatCards />
      {/* 1280px 미만은 한 열로 쌓아 화면 순서와 읽는 순서를 맞추고, 그 이상에서 목업처럼 세 칸.
          추천 칸은 카드 3장이 들어가므로 목업 비율보다 조금 넓게 준다 */}
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,0.75fr)]">
        <MapPreview />
        <RecommendedChurches />
        <RepRegisterCta />
      </div>
      <UpcomingEvents />
    </div>
  );
}
