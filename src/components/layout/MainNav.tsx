"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "@/lib/navigation";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주 메뉴" className="hidden h-full lg:block">
      <ul className="flex h-full items-stretch xl:gap-4">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center px-4 text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary",
                  active &&
                    "font-semibold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-primary",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
