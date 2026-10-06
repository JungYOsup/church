import Image from "next/image";
import Link from "next/link";
import { CirclePlus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-2xl bg-slate-200 shadow-sm"
    >
      <Image
        src="/images/hero-seoul.jpg"
        alt=""
        fill
        sizes="(min-width: 1600px) 1600px, 100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover object-[60%_40%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-white/95 via-white/85 to-white/55 sm:from-white sm:from-25% sm:via-white/75 sm:via-50% sm:to-white/5 lg:via-white/55 lg:via-45% lg:to-transparent lg:to-70%"
      />

      <div className="relative flex min-h-[340px] flex-col justify-center gap-5 px-5 py-10 break-keep sm:px-10 lg:px-16">
        <h1
          id="hero-title"
          className="text-2xl leading-tight font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[44px]"
        >
          지역의 교회가 함께 연결되는
          <br />
          <span className="text-primary">지도 기반 커뮤니티</span>
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-foreground/80 sm:text-lg">
          우리 지역의 교회 정보를 함께 나누고, 행사와 소식을 공유하며
          <br className="hidden sm:block" /> 더 큰 사랑의 연합을 만들어갑니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link href="/map">
              <MapPin className="size-5" />
              교회 찾기
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 border-primary bg-white/80 px-7 text-base text-primary hover:bg-white hover:text-primary"
          >
            <Link href="/admin?tab=register">
              <CirclePlus className="size-5" />
              우리 교회 등록
            </Link>
          </Button>
        </div>
      </div>

      <figure className="absolute top-7 right-8 hidden max-w-xs rounded-xl bg-slate-900/35 px-5 py-3 text-right text-white backdrop-blur-[2px] [text-shadow:0_1px_4px_rgb(0_0_0/0.35)] lg:block">
        <blockquote className="text-lg leading-relaxed font-medium">
          “서로 돌아보아
          <br />
          사랑과 선행을 격려하며”
        </blockquote>
        <figcaption className="mt-1 text-sm text-white/85">히브리서 10:24</figcaption>
      </figure>
    </section>
  );
}
