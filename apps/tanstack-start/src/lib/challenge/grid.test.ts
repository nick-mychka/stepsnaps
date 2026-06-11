import { describe, expect, it } from "vitest";

import type { GridInput, GridMonth } from "./grid";
import { buildGrid } from "./grid";

// June 2026 starts on a Monday, which keeps expectations easy to read.
const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const MON_WED_FRI = [1, 3, 5];

function grid(overrides: Partial<GridInput>): GridMonth[] {
  return buildGrid({
    startDate: "2026-06-01",
    endDate: null,
    scheduledDays: EVERYDAY,
    completedDates: [],
    today: "2026-06-10",
    ...overrides,
  });
}

function cells(months: GridMonth[]) {
  return months.flatMap((m) => m.weeks.flat()).filter((c) => c !== null);
}

function stateOf(months: GridMonth[], date: string) {
  return cells(months).find((c) => c.date === date)?.state;
}

describe("buildGrid", () => {
  it("renders an open-ended challenge from start through today", () => {
    const months = grid({});
    const all = cells(months);
    expect(all[0]?.date).toBe("2026-06-01");
    expect(all[all.length - 1]?.date).toBe("2026-06-10");
    expect(all).toHaveLength(10);
  });

  it("renders a bounded challenge through its end date", () => {
    const months = grid({ endDate: "2026-06-30" });
    const all = cells(months);
    expect(all[all.length - 1]?.date).toBe("2026-06-30");
    expect(all).toHaveLength(30);
  });

  it("starts weeks on Monday with leading blanks before the start date", () => {
    // 2026-06-03 is a Wednesday → two leading blanks (Mon, Tue).
    const months = grid({ startDate: "2026-06-03", today: "2026-06-03" });
    const firstWeek = months[0]?.weeks[0];
    expect(firstWeek?.slice(0, 2)).toEqual([null, null]);
    expect(firstWeek?.[2]?.date).toBe("2026-06-03");
  });

  it("pads every week to exactly 7 slots", () => {
    const months = grid({ startDate: "2026-05-28", endDate: "2026-07-15" });
    for (const month of months) {
      for (const week of month.weeks) {
        expect(week).toHaveLength(7);
      }
    }
  });

  it("separates months, restarting weeks at the month boundary", () => {
    // Thu 2026-05-28 → Tue 2026-06-02 crosses a month edge mid-week.
    const months = grid({ startDate: "2026-05-28", endDate: "2026-06-02" });
    expect(months.map((m) => m.key)).toEqual(["2026-05", "2026-06"]);
    expect(months.map((m) => m.label)).toEqual(["May 2026", "June 2026"]);

    const may = months[0];
    const june = months[1];
    // May's only week: Mon-Wed blanks, Thu 28 … Sun 31.
    expect(may?.weeks).toHaveLength(1);
    expect(may?.weeks[0]?.[3]?.date).toBe("2026-05-28");
    expect(may?.weeks[0]?.[6]?.date).toBe("2026-05-31");
    // June restarts its own week: Mon 1, Tue 2, then blanks.
    expect(june?.weeks).toHaveLength(1);
    expect(june?.weeks[0]?.[0]?.date).toBe("2026-06-01");
    expect(june?.weeks[0]?.[1]?.date).toBe("2026-06-02");
    expect(june?.weeks[0]?.[2]).toBeNull();
  });

  it("derives all four cell states", () => {
    const months = grid({
      scheduledDays: MON_WED_FRI,
      endDate: "2026-06-07",
      today: "2026-06-04",
      completedDates: ["2026-06-01"],
    });
    expect(stateOf(months, "2026-06-01")).toBe("completed"); // Mon, checked
    expect(stateOf(months, "2026-06-02")).toBe("not-scheduled"); // Tue
    expect(stateOf(months, "2026-06-03")).toBe("missed"); // Wed, past, unchecked
    expect(stateOf(months, "2026-06-05")).toBe("left"); // Fri, future
  });

  it("treats today unchecked as left, not missed", () => {
    const months = grid({ today: "2026-06-05" });
    expect(stateOf(months, "2026-06-05")).toBe("left");
    expect(stateOf(months, "2026-06-04")).toBe("missed");
  });

  it("marks today completed once checked", () => {
    const months = grid({
      today: "2026-06-05",
      completedDates: ["2026-06-05"],
    });
    expect(stateOf(months, "2026-06-05")).toBe("completed");
  });

  it("renders a single-day challenge as one cell", () => {
    const months = grid({
      startDate: "2026-06-03",
      endDate: "2026-06-03",
      today: "2026-06-03",
    });
    expect(cells(months)).toHaveLength(1);
    expect(stateOf(months, "2026-06-03")).toBe("left");
  });

  it("keeps an end date on a non-scheduled day as not-scheduled", () => {
    // 2026-06-14 is a Sunday; schedule is Monday only.
    const months = grid({ scheduledDays: [1], endDate: "2026-06-14" });
    expect(stateOf(months, "2026-06-14")).toBe("not-scheduled");
  });

  it("renders only the start day for an open-ended challenge not yet started", () => {
    const months = grid({ startDate: "2026-07-06" });
    const all = cells(months);
    expect(all).toHaveLength(1);
    expect(all[0]?.date).toBe("2026-07-06");
    expect(all[0]?.state).toBe("left");
  });

  it("handles a mid-month start", () => {
    const months = grid({ startDate: "2026-04-15", today: "2026-06-10" });
    expect(months.map((m) => m.key)).toEqual(["2026-04", "2026-05", "2026-06"]);
    expect(cells(months)[0]?.date).toBe("2026-04-15");
  });

  it("shows missed days for a bounded challenge that already ended", () => {
    const months = grid({
      startDate: "2026-06-01",
      endDate: "2026-06-03",
      today: "2026-06-10",
      completedDates: ["2026-06-02"],
    });
    expect(stateOf(months, "2026-06-01")).toBe("missed");
    expect(stateOf(months, "2026-06-02")).toBe("completed");
    expect(stateOf(months, "2026-06-03")).toBe("missed");
  });
});
