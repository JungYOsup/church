"use client";

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
        <DropdownMenuItem>내 정보</DropdownMenuItem>
        <DropdownMenuItem>우리 교회 관리</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
