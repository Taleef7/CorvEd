// E6 T6.1: Zod schema for tutor profile / application form
// E12 T12.2: Added conductAcknowledged field (required before submit)
// Closes #40 #79

import { z } from 'zod'

export const tutorProfileSchema = z.object({
  bio: z.string().min(50, 'Please write at least 50 characters about your experience'),
  timezone: z.string().min(1, 'Please select a timezone'),
  // subjects: array of { subject_id, level } combinations
  subjects: z
    .array(
      z.object({
        subject_id: z.number().int().positive(),
        level: z.enum(['o_levels', 'a_levels']),
      })
    )
    .min(1, 'Please select at least one subject and level'),
  // availability: array of { day (0=Sun…6=Sat), start "HH:MM", end "HH:MM" }
  availability: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
        end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
      })
    )
    .min(1, 'Please add at least one availability window'),
  // E12 T12.2: tutor must acknowledge the code of conduct before submitting
  conductAcknowledged: z
    .boolean()
    .refine((v) => v, {
      message: 'You must read and agree to the CorvEd Tutor Code of Conduct',
    }),
})

export type TutorProfileFormData = z.infer<typeof tutorProfileSchema>
