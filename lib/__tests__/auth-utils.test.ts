import { describe, expect, test } from 'vitest'

import {
  buildAuthCallbackUrl,
  requiresProfileSetup,
  safeNext,
  shouldPromoteOAuthParentSignup,
} from '@/lib/auth/utils'

describe('safeNext', () => {
  test('falls back to dashboard for invalid redirect targets', () => {
    expect(safeNext(null)).toBe('/dashboard')
    expect(safeNext('dashboard')).toBe('/dashboard')
    expect(safeNext('//evil.example')).toBe('/dashboard')
  })

  test('accepts relative in-app redirects', () => {
    expect(safeNext('/dashboard/requests')).toBe('/dashboard/requests')
  })
})

describe('buildAuthCallbackUrl', () => {
  test('adds signup intent for parent google signup', () => {
    expect(
      buildAuthCallbackUrl('https://corved.test', {
        flow: 'signup',
        accountType: 'parent',
      }),
    ).toBe('https://corved.test/auth/callback?flow=signup&account_type=parent')
  })

  test('preserves next for sign-in redirects', () => {
    expect(
      buildAuthCallbackUrl('https://corved.test', {
        next: '/dashboard/sessions',
      }),
    ).toBe('https://corved.test/auth/callback?next=%2Fdashboard%2Fsessions')
  })
})

describe('shouldPromoteOAuthParentSignup', () => {
  test('promotes a fresh parent signup that still has the default student role', () => {
    expect(
      shouldPromoteOAuthParentSignup({
        flow: 'signup',
        accountType: 'parent',
        primaryRole: 'student',
        assignedRoles: ['student'],
        whatsappNumber: null,
        profileCreatedAt: '2026-04-08T11:58:00.000Z',
        now: new Date('2026-04-08T12:00:00.000Z'),
      }),
    ).toBe(true)
  })

  test('does not promote existing or already-parent profiles', () => {
    expect(
      shouldPromoteOAuthParentSignup({
        flow: 'signup',
        accountType: 'parent',
        primaryRole: 'student',
        assignedRoles: ['student'],
        whatsappNumber: null,
        profileCreatedAt: '2026-04-08T11:45:00.000Z',
        now: new Date('2026-04-08T12:00:00.000Z'),
      }),
    ).toBe(false)

    expect(
      shouldPromoteOAuthParentSignup({
        flow: 'signup',
        accountType: 'parent',
        primaryRole: 'parent',
        assignedRoles: ['parent'],
        whatsappNumber: null,
        profileCreatedAt: '2026-04-08T11:58:00.000Z',
        now: new Date('2026-04-08T12:00:00.000Z'),
      }),
    ).toBe(false)
  })
})

describe('requiresProfileSetup', () => {
  test('requires setup when an OAuth profile is missing WhatsApp or timezone', () => {
    expect(requiresProfileSetup(null)).toBe(true)
    expect(requiresProfileSetup({ whatsapp_number: null, timezone: 'Asia/Karachi' })).toBe(true)
    expect(requiresProfileSetup({ whatsapp_number: '+923001234567', timezone: '' })).toBe(true)
  })

  test('allows completed profiles to continue to the requested destination', () => {
    expect(
      requiresProfileSetup({
        whatsapp_number: '+923001234567',
        timezone: 'America/New_York',
      }),
    ).toBe(false)
  })
})
