import { describe, expect, it } from "vitest";
import { addDaysToIsoDate, istCalendarDaysInclusive, istToUtc, isInNightWindow, toIstParts } from "./time";

describe("istToUtc", () => {
  it("converts IST wall-clock time to UTC", () => {
    expect(istToUtc("2026-11-01", "09:00")?.toISOString()).toBe("2026-11-01T03:30:00.000Z");
    expect(istToUtc("2026-11-01", "02:00")?.toISOString()).toBe("2026-10-31T20:30:00.000Z");
  });

  it.each([
    ["2026-02-31", "10:00"],
    ["2026-13-01", "10:00"],
    ["2026-11-01", "24:00"],
    ["2026-11-01", "9:00"],
    ["01-11-2026", "10:00"],
    ["2026-11-01T10:00", "10:00"],
  ])("rejects %s %s", (date, time) => {
    expect(istToUtc(date, time)).toBeNull();
  });

  it("round-trips through toIstParts", () => {
    const parts = toIstParts(istToUtc("2026-12-31", "23:45")!);
    expect(parts).toEqual({ date: "2026-12-31", time: "23:45", minutesOfDay: 23 * 60 + 45 });
  });
});

describe("istCalendarDaysInclusive", () => {
  it("counts days in IST, not UTC", () => {
    // 01 Nov 00:30 IST is still 31 Oct in UTC.
    expect(istCalendarDaysInclusive(istToUtc("2026-11-01", "00:30")!, istToUtc("2026-11-01", "23:30")!)).toBe(1);
    expect(istCalendarDaysInclusive(istToUtc("2026-11-01", "23:30")!, istToUtc("2026-11-02", "00:30")!)).toBe(2);
  });
});

describe("isInNightWindow", () => {
  it("handles windows that do not wrap midnight", () => {
    expect(isInNightWindow(istToUtc("2026-11-01", "01:00")!, "00:00", "05:00")).toBe(true);
    expect(isInNightWindow(istToUtc("2026-11-01", "05:00")!, "00:00", "05:00")).toBe(false);
  });

  it("treats an empty window as off", () => {
    expect(isInNightWindow(istToUtc("2026-11-01", "01:00")!, "00:00", "00:00")).toBe(false);
  });
});

describe("addDaysToIsoDate", () => {
  it("crosses month and year boundaries", () => {
    expect(addDaysToIsoDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToIsoDate("2026-03-01", -1)).toBe("2026-02-28");
  });
});
