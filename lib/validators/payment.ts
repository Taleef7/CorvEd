import { z } from "zod";

export const paymentSubmitSchema = z.object({
  packageId: z.string().uuid(),
  proofFileKey: z.string().min(1, "Payment proof is required"),
});

export type PaymentSubmitInput = z.infer<typeof paymentSubmitSchema>;

export const markPaidSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID"),
  packageId: z.string().uuid("Invalid package ID"),
  requestId: z.string().uuid("Invalid request ID"),
});

export type MarkPaidInput = z.infer<typeof markPaidSchema>;

export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID"),
  rejectionNote: z.string().min(1, "Rejection reason is required").max(500, "Rejection note too long"),
});

export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
