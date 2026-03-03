// E4 T4.3: Request status helpers (labels, badge colours)
// E5: LEVEL_LABELS shared constant
// Closes #29

export const LEVEL_LABELS: Record<string, string> = {
  o_levels: "O Levels",
  a_levels: "A Levels",
};

/** Returns a human-readable level label, falling back to the raw value or '—'. */
export function getLevelLabel(level: string | null | undefined): string {
  if (!level) return "—";
  return LEVEL_LABELS[level] ?? level;
}

export type RequestStatus =
  | "new"
  | "payment_pending"
  | "ready_to_match"
  | "matched"
  | "active"
  | "paused"
  | "ended";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  payment_pending: "Payment Pending",
  ready_to_match: "Ready to Match",
  matched: "Matched",
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

export const STATUS_COLOURS: Record<RequestStatus, string> = {
  new: "border-2 border-[#121212] bg-[#E0E0E0] text-[#121212]",
  payment_pending: "border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]",
  ready_to_match: "border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]",
  matched: "border-2 border-[#1040C0] bg-[#1040C0] text-white",
  active: "border-2 border-[#121212] bg-[#121212] text-white",
  paused: "border-2 border-[#F0C020] bg-[#F0C020]/40 text-[#121212]",
  ended: "border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]",
};

// ── Availability formatting ──────────────────────────────────────────
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AvailWindow = { day: number; start: string; end: string };

/** Convert an HH:MM 24-h time string to a short 12-h label, e.g. "8 AM". */
function shortTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const m = Number(mStr ?? 0);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return m ? `${h}:${String(m).padStart(2, "0")} ${ampm}` : `${h} ${ampm}`;
}

/**
 * Formats an availability_windows JSONB value into a human-readable string.
 *
 * Example output:
 *   Mon 8 AM – 12 PM, 4 PM – 8 PM
 *   Tue 8 AM – 12 PM
 *   Fri 12 PM – 4 PM, 8 PM – 11 PM
 */
export function formatAvailabilityWindows(
  windows: unknown,
): string {
  if (!windows) return "—";
  if (typeof windows === "string") return windows;
  if (!Array.isArray(windows) || windows.length === 0) return "—";

  // Group windows by day
  const byDay = new Map<number, AvailWindow[]>();
  for (const w of windows as AvailWindow[]) {
    if (w.day == null || !w.start || !w.end) continue;
    const d = Number(w.day);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(w);
  }

  // Sort days Mon→Sun (1,2,3,4,5,6,0)
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const lines: string[] = [];

  for (const d of dayOrder) {
    const slots = byDay.get(d);
    if (!slots || slots.length === 0) continue;
    // Sort slots by start time
    slots.sort((a, b) => a.start.localeCompare(b.start));
    const ranges = slots.map((s) => `${shortTime(s.start)}–${shortTime(s.end)}`);
    lines.push(`${DAY_NAMES[d]} ${ranges.join(", ")}`);
  }

  return lines.length > 0 ? lines.join("\n") : "—";
}
