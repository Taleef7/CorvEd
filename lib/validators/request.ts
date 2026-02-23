// E4 T4.1: Zod schema for the tutoring request creation form
// Closes #27

import { z } from 'zod'

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
    .string()
    .min(10, 'Please describe your availability (at least 10 characters)'),
  preferred_start_date: z.string().optional(),
})

export type RequestFormData = z.infer<typeof requestSchema>
