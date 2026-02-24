// E4 T4.3: Request status helpers (labels, badge colours)
// E5: LEVEL_LABELS shared constant
// Closes #29

export const LEVEL_LABELS: Record<string, string> = {
  o_levels: 'O Levels',
  a_levels: 'A Levels',
}

export type RequestStatus =
  | 'new'
  | 'payment_pending'
  | 'ready_to_match'
  | 'matched'
  | 'active'
  | 'paused'
  | 'ended'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  payment_pending: 'Payment Pending',
  ready_to_match: 'Ready to Match',
  matched: 'Matched',
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
}

export const STATUS_COLOURS: Record<RequestStatus, string> = {
  new: 'bg-gray-100 text-gray-700',
  payment_pending: 'bg-yellow-100 text-yellow-800',
  ready_to_match: 'bg-blue-100 text-blue-800',
  matched: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  ended: 'bg-red-100 text-red-800',
}
