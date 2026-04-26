import { z } from 'zod'

export const leadStatusValues = ['new', 'contacted', 'qualified', 'disqualified'] as const

export const leadStatusUpdateSchema = z.object({
  leadId: z.string().uuid('Invalid lead id'),
  status: z.enum(leadStatusValues),
  admin_notes: z.string().max(1000, 'Admin notes must be under 1000 characters').optional(),
})

export type LeadStatusUpdateData = z.infer<typeof leadStatusUpdateSchema>
