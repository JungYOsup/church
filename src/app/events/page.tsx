import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";

export const metadata: Metadata = { title: "행사" };

export default function EventsPage() {
  return <ComingSoon title="행사" />;
}
