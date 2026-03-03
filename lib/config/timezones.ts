/**
 * Common IANA timezone list — single source of truth.
 * Used in sign-up, profile-setup, new-request, tutor profile forms.
 */
export const TIMEZONE_OPTIONS = [
  { value: "Asia/Karachi", label: "Pakistan (PKT, UTC+5)" },
  { value: "Asia/Dubai", label: "UAE / Gulf (GST, UTC+4)" },
  { value: "Asia/Riyadh", label: "Saudi Arabia (AST, UTC+3)" },
  { value: "Europe/London", label: "United Kingdom (GMT/BST)" },
  { value: "America/New_York", label: "US Eastern (EST/EDT)" },
  { value: "America/Chicago", label: "US Central (CST/CDT)" },
  { value: "America/Los_Angeles", label: "US Pacific (PST/PDT)" },
  { value: "America/Toronto", label: "Canada Eastern (EST/EDT)" },
  { value: "Europe/Berlin", label: "Central Europe (CET/CEST)" },
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Asia/Dhaka", label: "Bangladesh (BST, UTC+6)" },
  { value: "Australia/Sydney", label: "Australia Eastern (AEST/AEDT)" },
  { value: "Asia/Shanghai", label: "China (CST, UTC+8)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Japan (JST, UTC+9)" },
  { value: "Pacific/Auckland", label: "New Zealand (NZST/NZDT)" },
  { value: "UTC", label: "UTC" },
] as const;

export type TimezoneValue = (typeof TIMEZONE_OPTIONS)[number]["value"];
