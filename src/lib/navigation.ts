export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "교회 지도", href: "/map" },
  { label: "행사", href: "/events" },
  { label: "공지", href: "/notices" },
  { label: "커뮤니티", href: "/community" },
  { label: "대표자 관리", href: "/admin" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
