import { Church as ChurchIcon } from "lucide-react";
import { ChurchCard } from "@/components/church/ChurchCard";
import { SectionCard } from "@/components/home/SectionCard";
import { getRecommendedChurches } from "@/lib/data/churches";

// 640px부터 한 줄에 3장, 1280px부터는 홈 두 번째 행의 가운데 칸이라 장당 155~200px
const CARD_IMAGE_SIZES = "(min-width: 1280px) 200px, (min-width: 640px) 33vw, 100vw";

export async function RecommendedChurches() {
  const churches = await getRecommendedChurches();

  return (
    <SectionCard
      titleId="recommended-churches-title"
      title="추천 교회"
      icon={ChurchIcon}
      description="지역을 섬기는 다양한 교회를 만나보세요."
      link={{ href: "/map" }}
    >
      <ul role="list" className="grid gap-3 sm:grid-cols-3">
        {churches.map((church) => (
          <li key={church.id}>
            <ChurchCard church={church} imageSizes={CARD_IMAGE_SIZES} />
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
