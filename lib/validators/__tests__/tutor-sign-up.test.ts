import { describe, expect, test } from 'vitest'

import { tutorSignUpSchema } from '@/lib/validators/tutor-sign-up'

const validTutorSignUp = {
  display_name: 'Sara Ahmed',
  email: 'sara@example.com',
  password: 'supersecret',
  confirm_password: 'supersecret',
  timezone: 'Asia/Karachi',
  bio: 'I have taught O Level mathematics for several years with a focus on exam preparation.',
  experience_years: '5',
  education: 'BSc Mathematics',
  teaching_approach: 'Build concepts first, then exam technique.',
  conductAcknowledged: true,
}

describe('tutorSignUpSchema', () => {
  test('requires tutor code of conduct acknowledgement', () => {
    const result = tutorSignUpSchema.safeParse({
      ...validTutorSignUp,
      conductAcknowledged: false,
    })

    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.conductAcknowledged).toContain(
      'You must read and agree to the CorvEd Tutor Code of Conduct',
    )
  })

  test('accepts a complete tutor application with conduct acknowledgement', () => {
    const result = tutorSignUpSchema.safeParse(validTutorSignUp)

    expect(result.success).toBe(true)
  })
})
