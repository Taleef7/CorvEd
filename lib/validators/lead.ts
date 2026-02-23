import { z } from 'zod'

export const leadSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    whatsapp_number: z
      .string()
      .min(9, 'Enter a valid WhatsApp number')
      .regex(/^[+\d][\d\s\-()]{7,}$/, 'Enter a valid phone number')
      // Normalise to digits only (strip spaces, hyphens, parentheses) for consistent storage
      .transform((val) => val.replace(/[ \-()]/g, '')),
    role: z.enum(['student', 'parent']),
    // child_name is optional per product spec (docs/MVP.md section 10.1)
    child_name: z.string().optional(),
    level: z.enum(['o_levels', 'a_levels']),
    subject: z.enum([
      'math',
      'physics',
      'chemistry',
      'biology',
      'english',
      'cs',
      'pak_studies',
      'islamiyat',
      'urdu',
    ]),
    exam_board: z.enum(['cambridge', 'edexcel', 'other', 'not_sure']).optional(),
    availability: z.string().min(10, 'Please describe your availability (at least 10 characters)'),
    city_timezone: z.string().min(2, 'Please enter your city or timezone'),
    goals: z.string().optional(),
    preferred_package: z.enum(['8', '12', '20']).optional(),
  })

export type LeadFormData = z.infer<typeof leadSchema>
