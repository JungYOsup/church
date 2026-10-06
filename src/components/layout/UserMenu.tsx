"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile, UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  member: "성도",
  church_rep: "대표자",
  admin: "관리자",
};

export function UserMenu({ user }: { user: UserProfile }) {
  const displayName = `${user.name} ${user.title}님`;
  const affiliation = `${user.churchName} ${ROLE_LABELS[user.role]}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`${displayName} 메뉴`}
      >
        <Avatar size="lg">
          <AvatarFallback className="bg-accent font-semibold text-primary">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden flex-col leading-tight lg:flex">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">{affiliation}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground lg:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="lg:hidden">
          <span className="block text-sm font-semibold text-foreground">{displayName}</span>
          <span className="block text-xs font-normal text-muted-foreground">{affiliation}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="lg:hidden" />
        <DropdownMenuItem asChild>
          <Link href="/admin">우리 교회 관리</Link>
        </DropdownMenuItem>
        {/* 로그인이 있어야 뜻이 있는 항목은 끈 채로 보여 주고, 언제 열리는지 아래에 적는다(대표자 관리의 끈 버튼과 같은 방식) */}
        <DropdownMenuItem disabled>내 정보</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>로그아웃</DropdownMenuItem>
        <p className="px-1.5 pt-1 pb-1.5 text-xs text-muted-foreground break-keep">
          내 정보와 로그아웃은 로그인 기능과 함께 열립니다.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
