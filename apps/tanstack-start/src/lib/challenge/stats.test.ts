import { describe, expect, it } from "vitest";

import type { StatsInput } from "./stats";
import { computeChallengeStats } from "./stats";

// June 2026 starts on a Monday.
const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];
const MON_WED_FRI = [1, 3, 5];

function stats(overrides: Partial<StatsInput>) {
  return computeChallengeStats({
    startDate: "2026-06-01",
    endDate: null,
    scheduledDays: EVERYDAY,
    completedDates: [],
    today: "2026-06-10",
    ...overrides,
  });
}

describe("streak", () => {
  it("is zero with no completions", () => {
    expect(stats({}).streak).toBe(0);
  });

  it("counts consecutive completed days on an everyday schedule", () => {
    const result = stats({
      completedDates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    });
    expect(result.streak).toBe(3);
  });

  it("does not break when today is scheduled but not yet checked", () => {
    const result = stats({
      completedDates: ["2026-06-08", "2026-06-09"],
    });
    expect(result.streak).toBe(2);
  });

  it("breaks on a missed scheduled day", () => {
    // 2026-06-09 missed → only today's completion counts.
    const result = stats({
      completedDates: ["2026-06-07", "2026-06-08", "2026-06-10"],
    });
    expect(result.streak).toBe(1);
  });

  it("resets to zero when the last scheduled day was missed", () => {
    const result = stats({
      completedDates: ["2026-06-07", "2026-06-08"],
    });
    expect(result.streak).toBe(0);
  });

  it("skips non-scheduled days without breaking", () => {
    // Mon/Wed/Fri challenge checked Mon and Wed, viewed on Thursday.
    const result = stats({
      scheduledDays: MON_WED_FRI,
      completedDates: ["2026-06-01", "2026-06-03"],
      today: "2026-06-04",
    });
    expect(result.streak).toBe(2);
  });

  it("spans weekends on a weekday-only schedule", () => {
    // Mon-Fri schedule: Fri 5th + Mon 8th completed, viewed Tue 9th unchecked.
    const result = stats({
      scheduledDays: [1, 2, 3, 4, 5],
      completedDates: ["2026-06-04", "2026-06-05", "2026-06-08"],
      today: "2026-06-09",
    });
    expect(result.streak).toBe(3);
  });

  it("walks back from the end date for an already-ended challenge", () => {
    const result = stats({
      endDate: "2026-06-05",
      completedDates: ["2026-06-04", "2026-06-05"],
      today: "2026-06-10",
    });
    expect(result.streak).toBe(2);
  });

  it("is zero before the challenge starts", () => {
    const result = stats({ startDate: "2026-07-01" });
    expect(result.streak).toBe(0);
  });

  it("stops counting at the start date", () => {
    const result = stats({
      startDate: "2026-06-09",
      completedDates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    });
    expect(result.streak).toBe(2);
  });
});

describe("progress stats", () => {
  it("counts completed vs elapsed scheduled days", () => {
    const result = stats({
      scheduledDays: MON_WED_FRI,
      completedDates: ["2026-06-01", "2026-06-05"],
      today: "2026-06-10", // Mon 1, Wed 3, Fri 5, Mon 8, Wed 10 elapsed
    });
    expect(result.completedCount).toBe(2);
    expect(result.elapsedScheduled).toBe(5);
  });

  it("ignores completions outside the period or off-schedule", () => {
    const result = stats({
      scheduledDays: MON_WED_FRI,
      startDate: "2026-06-03",
      completedDates: ["2026-06-01", "2026-06-02", "2026-06-03"],
    });
    expect(result.completedCount).toBe(1);
  });

  it("has no total or percent when open-ended", () => {
    const result = stats({ completedDates: ["2026-06-01"] });
    expect(result.totalScheduled).toBeNull();
    expect(result.percentComplete).toBeNull();
  });

  it("computes total and percent when an end date is set", () => {
    const result = stats({
      endDate: "2026-06-10",
      completedDates: ["2026-06-01", "2026-06-02", "2026-06-03"],
    });
    expect(result.totalScheduled).toBe(10);
    expect(result.percentComplete).toBe(30);
  });

  it("caps elapsed at the end date for an ended challenge", () => {
    const result = stats({
      endDate: "2026-06-05",
      today: "2026-06-10",
    });
    expect(result.elapsedScheduled).toBe(5);
    expect(result.totalScheduled).toBe(5);
  });

  it("reports zero elapsed before the start date", () => {
    const result = stats({ startDate: "2026-07-01" });
    expect(result.elapsedScheduled).toBe(0);
  });
});
