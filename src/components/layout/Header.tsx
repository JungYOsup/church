import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";
import { getCurrentUser } from "@/lib/data/user";
import { formatRelativeTime } from "@/lib/datetime";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { NotificationMenu } from "./NotificationMenu";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const [user, notifications, unreadCount] = await Promise.all([
    getCurrentUser(),
    getNotifications(),
    getUnreadNotificationCount(),
  ]);
  // "N시간 전"은 서버가 한 번 계산해 넘긴다. 클라이언트에서 다시 계산하면 시각이 달라 hydration이 어긋난다.
  // 페이지가 요청마다 그려지므로 요청 시각 기준이다. 정적으로 남은 404 페이지만 빌드 시각 기준이다
  const now = new Date();
  const notificationItems = notifications.map((notification) => ({
    ...notification,
    timeLabel: formatRelativeTime(notification.createdAt, now),
  }));

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 lg:h-[72px] lg:px-6">
        <MobileNav />
        <Logo />
        <div className="flex h-full flex-1 justify-center">
          <MainNav />
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon-lg">
            <Link href="/search" aria-label="검색">
              <Search className="size-5" />
            </Link>
          </Button>
          <NotificationMenu notifications={notificationItems} unreadCount={unreadCount} />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
