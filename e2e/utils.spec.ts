import { test, expect } from "@playwright/test";
import {
  formatAvailabilityWindows,
  getLevelLabel,
} from "../lib/utils/request";

test.describe("formatAvailabilityWindows", () => {
  test("returns dash for null/undefined", () => {
    expect(formatAvailabilityWindows(null)).toBe("—");
    expect(formatAvailabilityWindows(undefined)).toBe("—");
  });

  test("returns dash for empty array", () => {
    expect(formatAvailabilityWindows([])).toBe("—");
  });

  test("returns string as-is", () => {
    expect(formatAvailabilityWindows("Mon 8 AM–12 PM")).toBe(
      "Mon 8 AM–12 PM",
    );
  });

  test("formats a single window", () => {
    const windows = [{ day: 1, start: "08:00", end: "12:00" }];
    expect(formatAvailabilityWindows(windows)).toBe("Mon 8 AM–12 PM");
  });

  test("formats multiple windows on the same day", () => {
    const windows = [
      { day: 1, start: "08:00", end: "12:00" },
      { day: 1, start: "16:00", end: "20:00" },
    ];
    expect(formatAvailabilityWindows(windows)).toBe(
      "Mon 8 AM–12 PM, 4 PM–8 PM",
    );
  });

  test("formats windows across multiple days", () => {
    const windows = [
      { day: 1, start: "08:00", end: "12:00" },
      { day: 3, start: "14:00", end: "18:00" },
      { day: 5, start: "09:00", end: "11:00" },
    ];
    const result = formatAvailabilityWindows(windows);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Mon 8 AM–12 PM");
    expect(lines[1]).toBe("Wed 2 PM–6 PM");
    expect(lines[2]).toBe("Fri 9 AM–11 AM");
  });

  test("sorts days Mon→Sun", () => {
    // Sunday (0) should appear last
    const windows = [
      { day: 0, start: "10:00", end: "14:00" },
      { day: 1, start: "08:00", end: "12:00" },
    ];
    const result = formatAvailabilityWindows(windows);
    const lines = result.split("\n");
    expect(lines[0]).toContain("Mon");
    expect(lines[1]).toContain("Sun");
  });

  test("handles midnight and noon correctly", () => {
    const windows = [
      { day: 2, start: "00:00", end: "12:00" },
      { day: 2, start: "12:00", end: "23:00" },
    ];
    const result = formatAvailabilityWindows(windows);
    expect(result).toBe("Tue 12 AM–12 PM, 12 PM–11 PM");
  });

  test("handles times with minutes", () => {
    const windows = [{ day: 4, start: "09:30", end: "11:45" }];
    expect(formatAvailabilityWindows(windows)).toBe("Thu 9:30 AM–11:45 AM");
  });

  test("skips malformed entries", () => {
    const windows = [
      { day: 1, start: "08:00", end: "12:00" },
      { day: null, start: "08:00", end: "12:00" },
      { day: 2, start: "", end: "12:00" },
    ];
    expect(formatAvailabilityWindows(windows)).toBe("Mon 8 AM–12 PM");
  });
});

test.describe("getLevelLabel", () => {
  test("returns O Levels for o_levels", () => {
    expect(getLevelLabel("o_levels")).toBe("O Levels");
  });

  test("returns A Levels for a_levels", () => {
    expect(getLevelLabel("a_levels")).toBe("A Levels");
  });

  test("returns dash for null", () => {
    expect(getLevelLabel(null)).toBe("—");
  });

  test("returns dash for undefined", () => {
    expect(getLevelLabel(undefined)).toBe("—");
  });

  test("returns raw value for unknown level", () => {
    expect(getLevelLabel("other_level")).toBe("other_level");
  });
});
