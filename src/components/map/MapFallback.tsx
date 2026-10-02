import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** 카카오맵을 띄울 수 없을 때(키가 없을 때) 지도 자리에 보여 준다 */
export function MapFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent px-6 py-10 text-center break-keep",
        className,
      )}
    >
      {/* 옅은 격자로 지도 자리임을 알린다 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[28px_28px]"
      />
      <span
        aria-hidden="true"
        className="relative mb-1 flex size-12 items-center justify-center rounded-full bg-card text-primary shadow-sm"
      >
        <MapPin className="size-6" />
      </span>
      <p className="relative font-semibold text-foreground">지도를 표시할 수 없습니다</p>
      <p className="relative text-sm text-muted-foreground">
        교회 지도에서 지역별 교회를 찾아볼 수 있습니다.
      </p>
    </div>
  );
}
