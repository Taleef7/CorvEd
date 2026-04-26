import { z } from 'zod'

export const tutorSignUpSchema = z
  .object({
    display_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    timezone: z.string().min(1, 'Please select a timezone'),
    bio: z
      .string()
      .min(30, 'Please write at least 30 characters about yourself')
      .max(600, 'Keep bio under 600 characters'),
    experience_years: z.string().min(1, 'Please select your experience level'),
    education: z.string().min(3, 'Please enter your highest qualification'),
    teaching_approach: z.string().optional(),
    conductAcknowledged: z.boolean().refine((value) => value, {
      message: 'You must read and agree to the CorvEd Tutor Code of Conduct',
    }),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type TutorSignUpData = z.infer<typeof tutorSignUpSchema>
