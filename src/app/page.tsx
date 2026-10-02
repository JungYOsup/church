import { HeroBanner } from "@/components/home/HeroBanner";
import { StatCards } from "@/components/home/StatCards";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <HeroBanner />
      <StatCards />
    </div>
  );
}
