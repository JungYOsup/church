"use client";

import Link from "next/link";
import { BadgeCheck, Bell, CalendarDays, Church, Megaphone, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationKind, UserNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  event: CalendarDays,
  notice: Megaphone,
  church: Church,
  verification: BadgeCheck,
};

/** 알림 하나와 화면에 적을 시각 글자("2시간 전"). 시각 글자는 서버(Header)가 계산해 넘긴다 */
export type NotificationItem = UserNotification & { timeLabel: string };

/**
 * 헤더의 알림 버튼과 알림 목록. 항목 전체가 관련 화면으로 가는 링크다.
 * 1단계에서는 읽음 상태를 바꾸지 않는다(2단계 notifications 테이블에서 함)
 */
export function NotificationMenu({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative"
          aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* 좁은 화면에서도 화면 가장자리에서 16px 떨어지게 한다 */}
      <DropdownMenuContent align="end" collisionPadding={16} className="w-80">
        <DropdownMenuLabel className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">알림</span>
          <span className="font-normal">{unreadCount > 0 ? `새 알림 ${unreadCount}개` : "새 알림 없음"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">받은 알림이 없습니다.</p>
        ) : (
          notifications.map((notification) => {
            const Icon = KIND_ICONS[notification.kind];
            return (
              <DropdownMenuItem key={notification.id} asChild className="items-start gap-3 px-2 py-2.5">
                <Link href={notification.href}>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      notification.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-keep">
                    {/* 파란 점은 눈으로만 보이므로, 화면 읽기에는 안 읽은 알림을 글자로 알린다 */}
                    {!notification.read && <span className="sr-only">새 알림</span>}
                    <span className={notification.read ? "text-foreground/80" : "font-medium text-foreground"}>
                      {notification.message}
                    </span>
                    <time dateTime={notification.createdAt} className="text-xs text-muted-foreground">
                      {notification.timeLabel}
                    </time>
                  </span>
                  {!notification.read && (
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
