import Link from "next/link";
import { ChevronRight, Church as ChurchIcon } from "lucide-react";
import { ChurchCard } from "@/components/church/ChurchCard";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecommendedChurches } from "@/lib/data/churches";

// 640px부터 한 줄에 3장, 1280px부터는 홈 두 번째 행의 가운데 칸이라 장당 155~200px
const CARD_IMAGE_SIZES = "(min-width: 1280px) 200px, (min-width: 640px) 33vw, 100vw";

export async function RecommendedChurches() {
  const churches = await getRecommendedChurches();

  return (
    <section aria-labelledby="recommended-churches-title" className="min-w-0">
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle>
            <h2
              id="recommended-churches-title"
              className="flex items-center gap-2 text-lg font-bold text-foreground"
            >
              <ChurchIcon aria-hidden="true" className="size-5 text-primary" />
              추천 교회
            </h2>
          </CardTitle>
          <CardDescription>지역을 섬기는 다양한 교회를 만나보세요.</CardDescription>
          <CardAction>
            <Link
              href="/map"
              className="inline-flex items-center gap-0.5 rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="sr-only">추천 교회 </span>더보기
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ul role="list" className="grid gap-3 sm:grid-cols-3">
            {churches.map((church) => (
              <li key={church.id}>
                <ChurchCard church={church} imageSizes={CARD_IMAGE_SIZES} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
