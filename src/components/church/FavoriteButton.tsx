"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/** 관심 교회 토글. 저장은 백엔드 단계(favorites)에서 붙이고, 지금은 화면에서만 바뀐다 */
export function FavoriteButton({
  churchName,
  className,
}: {
  churchName: string;
  className?: string;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${churchName} 관심 교회`}
      onClick={() => setPressed((current) => !current)}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm outline-hidden transition-colors hover:text-favorite focus-visible:ring-3 focus-visible:ring-ring/50",
        pressed && "text-favorite",
        className,
      )}
    >
      <Heart aria-hidden="true" className={cn("size-4", pressed && "fill-current")} />
    </button>
  );
}
