import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getUnreadNotificationCount } from "@/lib/data/user";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const [user, unreadCount] = await Promise.all([
    getCurrentUser(),
    getUnreadNotificationCount(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 lg:h-[72px] lg:px-6">
        <MobileNav />
        <Logo />
        <div className="flex h-full flex-1 justify-center">
          <MainNav />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-lg" aria-label="검색">
            <Search className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative"
            aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500"
                aria-hidden="true"
              />
            )}
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
