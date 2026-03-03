export { templates } from "@/lib/whatsapp/templates";
export { buildWaLink } from "@/lib/whatsapp/buildLink";

/**
 * Normalize a Pakistani phone number to international format.
 * Handles: 03001234567 → +923001234567, 923001234567 → +923001234567
 */
export function normalizePkPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  if (digits.startsWith("92")) return `+${digits}`;
  return phone;
}
