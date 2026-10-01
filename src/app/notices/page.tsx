import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";

export const metadata: Metadata = { title: "공지" };

export default function NoticesPage() {
  return <ComingSoon title="공지" />;
}
