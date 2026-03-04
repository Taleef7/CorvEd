type BannerVariant = 'info' | 'warning' | 'success' | 'neutral'

interface StatusBannerProps {
  message: string
  variant: BannerVariant
}

const variantStyles: Record<BannerVariant, string> = {
  info: 'border-l-[#1040C0] bg-[#1040C0]/5 text-[#1040C0]',
  warning: 'border-l-[#F0C020] bg-[#F0C020]/10 text-[#121212]',
  success: 'border-l-[#1040C0] bg-[#1040C0]/5 text-[#1040C0]',
  neutral: 'border-l-[#121212]/40 bg-[#121212]/5 text-[#121212]/70',
}

export function StatusBanner({ message, variant }: StatusBannerProps) {
  return (
    <div className={`border-l-4 px-4 py-3 ${variantStyles[variant]}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

export function getRequestStatusBanner(status: string): { message: string; variant: BannerVariant } | null {
  switch (status) {
    case 'payment_pending':
      return {
        message: 'Your payment is being verified. We\'ll confirm within 24 hours.',
        variant: 'warning',
      }
    case 'ready_to_match':
      return {
        message: 'We\'re finding the perfect tutor for you. This usually takes 1-2 days.',
        variant: 'info',
      }
    case 'matched':
      return {
        message: 'You\'ve been matched with a tutor! Your schedule is being finalized.',
        variant: 'success',
      }
    case 'paused':
      return {
        message: 'Your sessions are currently paused. Contact us on WhatsApp to resume.',
        variant: 'warning',
      }
    case 'ended':
      return {
        message: 'This request has ended. Start a new request for more sessions.',
        variant: 'neutral',
      }
    default:
      return null
  }
}
