import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { FilterChips } from "@/components/common/FilterChips";
import { ChurchMapExplorer } from "@/components/map/ChurchMapExplorer";
import { getChurchRegions, getChurches } from "@/lib/data/churches";
import { parseSearchParam } from "@/lib/search-params";

// 탭 제목에 고른 지역을 넣지 않는다(행사 페이지와 같은 이유: Link 기본 미리 불러오기가 검색어별 제목을 구분하지 않음).
// 바뀐 결과는 목록 머리의 role="status" 개수 문구로 알린다
export const metadata: Metadata = { title: "교회 지도" };

// searchParams를 읽으므로 요청마다 그려진다
export default async function MapPage({ searchParams }: PageProps<"/map">) {
  const region = parseSearchParam((await searchParams).region);
  const [churches, regions] = await Promise.all([getChurches({ region }), getChurchRegions()]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <MapPin aria-hidden="true" className="size-6 text-primary" />
          교회 지도
        </h1>
        <p className="text-muted-foreground">지도에서 우리 지역 교회를 찾아보세요.</p>
      </header>

      {regions.length > 0 && (
        <FilterChips label="지역 필터" basePath="/map" param="region" options={regions} selected={region} />
      )}

      {churches.length === 0 ? (
        // 칩에는 교회가 있는 지역만 있으므로, 여기는 주소로 다른 지역이 들어온 경우다.
        // 그 글자는 주소에서 온 아무 문구일 수 있어 화면에 다시 적지 않는다
        <section aria-labelledby="church-list-title" className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <h2 id="church-list-title" className="text-lg font-bold text-foreground">
              교회 목록
            </h2>
            <p role="status" className="text-sm text-muted-foreground">
              맞는 교회 0개
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-16 text-center break-keep">
            <p className="text-muted-foreground">
              {region ? "고른 지역의 교회가 없습니다." : "등록된 교회가 없습니다."}
            </p>
            {region && (
              <Link
                href="/map"
                className="rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                전체 교회 보기
              </Link>
            )}
          </div>
        </section>
      ) : (
        <ChurchMapExplorer churches={churches} />
      )}
    </div>
  );
}
