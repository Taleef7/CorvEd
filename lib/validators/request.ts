// E4 T4.1: Zod schema for the tutoring request creation form
// Closes #27

import { z } from 'zod'

export const availabilityWindowSchema = z.object({
  day: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
})

export type AvailabilityWindow = z.infer<typeof availabilityWindowSchema>

export const requestSchema = z.object({
  requester_role: z.enum(['student', 'parent']),
  for_student_name: z.string().optional(),
  level: z.enum(['o_levels', 'a_levels']),
  subject_id: z.number().int().positive('Please select a subject'),
  exam_board: z
    .enum(['cambridge', 'edexcel', 'other', 'unspecified'])
    .optional(),
  goals: z.string().optional(),
  timezone: z.string().min(1, 'Please select a timezone'),
  availability_windows: z
    .array(availabilityWindowSchema)
    .min(1, 'Please select at least one availability slot'),
  preferred_package_tier: z
    .union([z.literal(8), z.literal(12), z.literal(20)])
    .optional(),
  preferred_start_date: z.string().optional(),
})

export type RequestFormData = z.infer<typeof requestSchema>
