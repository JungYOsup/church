import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AdminTabs, type AdminTab } from "@/components/admin/AdminTabs";
import { ChurchRegisterForm } from "@/components/admin/ChurchRegisterForm";
import { MyChurchPanel } from "@/components/admin/MyChurchPanel";
import { getCurrentUser } from "@/lib/data/user";
import { parseSearchParam } from "@/lib/search-params";

// 탭 제목은 고른 탭과 상관없이 고정한다. 검색어에 따라 바뀌는 제목은 Link 기본 미리 불러오기에서 어긋난다
// (docs/lessons.md)
export const metadata: Metadata = { title: "대표자 관리" };

// searchParams를 읽으므로 요청마다 그려진다
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  // 모르는 값은 기본 탭(내 교회)으로 본다
  const tab: AdminTab = parseSearchParam((await searchParams).tab) === "register" ? "register" : "church";
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldCheck aria-hidden="true" className="size-6 text-primary" />
          대표자 관리
        </h1>
        <p className="text-muted-foreground">
          {user.churchName} 대표자 {user.name} {user.title}님, 교회 정보와 소식을 관리해 보세요.
        </p>
      </header>

      <AdminTabs current={tab} />

      {tab === "register" ? (
        <section aria-labelledby="register-title" className="flex max-w-3xl flex-col gap-4 break-keep">
          <div className="flex flex-col gap-1">
            <h2 id="register-title" className="text-lg font-bold text-foreground">
              교회 등록·인증 신청
            </h2>
            <p className="text-muted-foreground">
              교회를 등록하고 대표자 인증을 신청하면, 관리자가 증빙 서류를 확인한 뒤 승인합니다.
            </p>
          </div>
          <ChurchRegisterForm titleId="register-title" applicantName={user.name} applicantTitle={user.title} />
        </section>
      ) : (
        <MyChurchPanel user={user} />
      )}
    </div>
  );
}
