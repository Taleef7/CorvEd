/**
 * Bauhaus UI Primitives
 * ─────────────────────
 * Shared atoms for the CorvEd Bauhaus design system.
 * Design tokens:
 *   Canvas:  #F0F0F0   (off-white)
 *   Ink:     #121212   (stark black — all borders, text)
 *   Red:     #D02020   (Bauhaus primary CTA / error)
 *   Blue:    #1040C0   (Bauhaus accent / links)
 *   Yellow:  #F0C020   (Bauhaus highlight / tutor)
 */

import React from 'react'

// ── Typography ───────────────────────────────────────────────────────────────

export function BauhausLabel({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#121212]"
    >
      {children}
      {required && <span className="ml-1 text-[#D02020]" aria-hidden="true">*</span>}
    </label>
  )
}

// ── Form Controls ─────────────────────────────────────────────────────────────

export function BauhausInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean },
) {
  const { hasError, className, ...rest } = props
  return (
    <input
      {...rest}
      className={[
        'w-full border-2 bg-white px-3 py-2.5 text-sm text-[#121212]',
        'placeholder:text-[#121212]/35 focus:outline-none',
        'focus:ring-2 focus:ring-[#1040C0] focus:ring-offset-1',
        'transition disabled:opacity-50',
        hasError ? 'border-[#D02020]' : 'border-[#121212]',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    />
  )
}

export function BauhausSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode
    hasError?: boolean
  },
) {
  const { hasError, className, children, ...rest } = props
  return (
    <select
      {...rest}
      className={[
        'w-full border-2 bg-white px-3 py-2.5 text-sm text-[#121212]',
        'focus:outline-none focus:ring-2 focus:ring-[#1040C0] focus:ring-offset-1',
        'transition disabled:opacity-50',
        hasError ? 'border-[#D02020]' : 'border-[#121212]',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </select>
  )
}

export function BauhausFieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-bold uppercase tracking-wide text-[#D02020]">
      {message}
    </p>
  )
}

export function BauhausServerError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 border-2 border-[#D02020] bg-[#D02020]/10 px-4 py-3"
    >
      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-[#D02020]" aria-hidden="true" />
      <p className="text-sm font-medium text-[#D02020]">{message}</p>
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'red' | 'blue' | 'yellow' | 'outline' | 'ghost'

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: React.ReactNode
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  red: 'bg-[#D02020] text-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:bg-[#D02020]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  blue: 'bg-[#1040C0] text-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:bg-[#1040C0]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  yellow:
    'bg-[#F0C020] text-[#121212] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:bg-[#F0C020]/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  outline:
    'bg-white text-[#121212] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:bg-[#F0F0F0] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
  ghost: 'bg-transparent text-[#121212] border-2 border-transparent hover:border-[#121212] hover:bg-[#F0F0F0]',
}

export function BauhausButton({
  variant = 'red',
  fullWidth,
  children,
  className,
  ...props
}: BauhausButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center gap-2',
        'px-5 py-2.5 text-sm font-bold uppercase tracking-wider',
        'transition-all duration-100 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        'min-h-[44px]', // touch target
        BUTTON_VARIANTS[variant],
        fullWidth ? 'w-full' : '',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {children}
    </button>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

type CardAccent = 'red' | 'blue' | 'yellow' | 'none'

const CARD_ACCENTS: Record<CardAccent, string> = {
  red: 'bg-[#D02020]',
  blue: 'bg-[#1040C0]',
  yellow: 'bg-[#F0C020]',
  none: '',
}

export function BauhausCard({
  children,
  accent = 'none',
  className,
  hover = false,
}: {
  children: React.ReactNode
  accent?: CardAccent
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={[
        'relative bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212]',
        hover ? 'transition-transform hover:-translate-y-1 cursor-pointer' : '',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {/* Geometric corner decoration */}
      {accent !== 'none' && (
        <span
          aria-hidden="true"
          className={`absolute top-3 right-3 h-3 w-3 ${CARD_ACCENTS[accent]}`}
        />
      )}
      {children}
    </div>
  )
}

// ── Status Badges ──────────────────────────────────────────────────────────────

export function BauhausBadge({
  children,
  color = 'blue',
}: {
  children: React.ReactNode
  color?: 'red' | 'blue' | 'yellow' | 'black'
}) {
  const colorMap = {
    red: 'bg-[#D02020] text-white border-[#D02020]',
    blue: 'bg-[#1040C0] text-white border-[#1040C0]',
    yellow: 'bg-[#F0C020] text-[#121212] border-[#F0C020]',
    black: 'bg-[#121212] text-white border-[#121212]',
  }
  return (
    <span
      className={`inline-flex items-center border-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${colorMap[color]}`}
    >
      {children}
    </span>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function BauhausDivider({ label }: { label?: string }) {
  if (!label) return <div className="my-5 h-[2px] bg-[#121212]/15" />
  return (
    <div className="relative my-5 flex items-center gap-3">
      <div className="h-[2px] flex-1 bg-[#121212]/15" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#121212]/40">{label}</span>
      <div className="h-[2px] flex-1 bg-[#121212]/15" />
    </div>
  )
}

// ── Info panel (e.g. tips, notes) ─────────────────────────────────────────────

export function BauhausInfoPanel({
  children,
  accent = 'blue',
}: {
  children: React.ReactNode
  accent?: 'red' | 'blue' | 'yellow'
}) {
  const bg = { red: 'bg-[#D02020]/10 border-[#D02020]', blue: 'bg-[#1040C0]/10 border-[#1040C0]', yellow: 'bg-[#F0C020]/40 border-[#F0C020]' }
  return (
    <div className={`border-l-4 px-4 py-3 ${bg[accent]}`}>
      {children}
    </div>
  )
}

// ── Google SVG logo (reused across auth forms) ────────────────────────────────

export function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ── Bauhaus geometric Logo mark ───────────────────────────────────────────────

export function BauhausLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  const txt = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
  return (
    <div className="flex items-center gap-2">
      {/* Three geometric shapes: circle, square, triangle */}
      <div className="flex items-center gap-1" aria-hidden="true">
        <div className={`${dim} rounded-full bg-[#D02020]`} />
        <div className={`${dim} bg-[#F0C020]`} />
        <div
          className={`${dim}`}
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#1040C0' }}
        />
      </div>
      <span className={`font-black uppercase tracking-tighter text-[#121212] ${txt}`}>
        CorvEd
      </span>
    </div>
  )
}

// ── Auth layout panel (geometric right panel) ─────────────────────────────────

export function BauhausGeometricPanel({ bg = '#1040C0' }: { bg?: string }) {
  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:min-h-screen"
      style={{ background: bg }}
      aria-hidden="true"
    >
      {/* dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* floating shapes */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Large circle */}
        <div className="h-32 w-32 rounded-full border-4 border-white opacity-80" />
        {/* Rotated square */}
        <div
          className="h-24 w-24 border-4 border-white opacity-70"
          style={{ transform: 'rotate(45deg)' }}
        />
        {/* Triangle */}
        <div
          className="h-16 w-16"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'rgba(255,255,255,0.6)' }}
        />
      </div>
      {/* Corner decoration */}
      <div className="absolute bottom-8 right-8 h-16 w-16 rounded-full bg-white opacity-20" />
      <div className="absolute top-8 left-8 h-10 w-10 bg-white opacity-10" />
    </div>
  )
}
