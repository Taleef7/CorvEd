// E8 T8.3: Session status helpers (labels, badge colours)
// Closes #56

export type SessionStatus =
  | "scheduled"
  | "done"
  | "rescheduled"
  | "no_show_student"
  | "no_show_tutor";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  done: "Done",
  rescheduled: "Rescheduled",
  no_show_student: "Student No-show",
  no_show_tutor: "Tutor No-show",
};

export const SESSION_STATUS_COLOURS: Record<SessionStatus, string> = {
  scheduled: "border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]",
  done: "border-2 border-[#121212] bg-[#121212] text-white",
  rescheduled: "border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]",
  no_show_student: "border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]",
  no_show_tutor: "border-2 border-[#121212] bg-[#E0E0E0] text-[#121212]",
};

/**
 * Format a UTC ISO timestamp for display in a given IANA timezone.
 * Returns a human-readable string like "Mon, Feb 23 at 07:00 PM".
 */
export function formatSessionTime(
  utcIso: string,
  userTimezone: string,
): string {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: userTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(utcIso));
}
