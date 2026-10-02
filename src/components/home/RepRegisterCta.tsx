import Link from "next/link";
import { Church, CircleCheck, CirclePlus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  "교회 정보와 사역을 소개할 수 있습니다.",
  "교회 행사와 소식을 공유할 수 있습니다.",
  "지역의 다른 교회와 협력할 수 있습니다.",
];

export function RepRegisterCta() {
  return (
    <section
      aria-labelledby="rep-register-title"
      className="relative flex min-w-0 flex-col items-start gap-4 overflow-hidden rounded-xl bg-linear-to-br from-accent to-card p-5 shadow-sm ring-1 ring-foreground/10 break-keep"
    >
      <Church
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 bottom-14 size-36 text-primary/10"
      />
      <Badge className="relative bg-card text-primary">
        <ShieldCheck data-icon="inline-start" aria-hidden="true" />
        교회 대표자 전용
      </Badge>
      <h2
        id="rep-register-title"
        className="relative text-xl leading-snug font-bold text-foreground"
      >
        우리 교회를 등록하고
        <br />
        더 많은 성도들과 연결하세요
      </h2>
      <ul role="list" className="relative flex flex-col gap-2 text-sm text-foreground/80">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            {benefit}
          </li>
        ))}
      </ul>
      <Button asChild size="lg" className="relative mt-auto h-12 w-full text-base">
        <Link href="/admin">
          <CirclePlus className="size-5" />
          우리 교회 등록하기
        </Link>
      </Button>
    </section>
  );
}
