import { SimpleCard } from "~/components/simple-card";

export function StreakCard({ days }: { days: number }) {
  return (
    <SimpleCard
      className="w-fit py-4"
      contentClassName="flex items-center gap-4 px-5"
    >
      <span className="text-3xl" aria-hidden>
        🔥
      </span>
      <div className="flex flex-col">
        <span className="text-3xl leading-none font-bold text-orange-400">
          {days}
        </span>
        <span className="text-muted-foreground text-sm">day streak</span>
      </div>
    </SimpleCard>
  );
}
