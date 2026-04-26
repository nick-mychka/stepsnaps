import { Card, CardContent } from "@stepsnaps/ui/card";

export function StreakCard({ days }: { days: number }) {
  return (
    <Card className="w-fit py-4">
      <CardContent className="flex items-center gap-4 px-5">
        <span className="text-3xl" aria-hidden>
          🔥
        </span>
        <div className="flex flex-col">
          <span className="text-3xl leading-none font-bold text-orange-400">
            {days}
          </span>
          <span className="text-muted-foreground text-sm">day streak</span>
        </div>
      </CardContent>
    </Card>
  );
}
