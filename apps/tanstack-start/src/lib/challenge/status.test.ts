import { describe, expect, it } from "vitest";

import { effectiveStatus } from "./status";

describe("effectiveStatus", () => {
  it("completes an active challenge whose end date is in the past", () => {
    expect(
      effectiveStatus({
        status: "active",
        endDate: "2026-06-09",
        today: "2026-06-10",
      }),
    ).toBe("completed");
  });

  it("keeps an active challenge active on its end date", () => {
    expect(
      effectiveStatus({
        status: "active",
        endDate: "2026-06-10",
        today: "2026-06-10",
      }),
    ).toBe("active");
  });

  it("keeps an active challenge active before its end date", () => {
    expect(
      effectiveStatus({
        status: "active",
        endDate: "2026-07-01",
        today: "2026-06-10",
      }),
    ).toBe("active");
  });

  it("never auto-completes an open-ended challenge", () => {
    expect(
      effectiveStatus({
        status: "active",
        endDate: null,
        today: "2099-01-01",
      }),
    ).toBe("active");
  });

  it("leaves stopped challenges stopped, even past their end date", () => {
    expect(
      effectiveStatus({
        status: "stopped",
        endDate: "2026-06-01",
        today: "2026-06-10",
      }),
    ).toBe("stopped");
  });

  it("leaves completed challenges completed", () => {
    expect(
      effectiveStatus({
        status: "completed",
        endDate: null,
        today: "2026-06-10",
      }),
    ).toBe("completed");
  });
});
