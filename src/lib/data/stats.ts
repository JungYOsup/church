import { mockStats } from "@/lib/mock/stats";
import type { Stats } from "@/lib/types";

export async function getStats(): Promise<Stats> {
  return mockStats;
}
