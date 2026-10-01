import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card px-6 py-24 text-center">
      <Construction className="size-10 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">준비 중인 페이지입니다.</p>
      <Button asChild variant="outline" size="lg">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  );
}
