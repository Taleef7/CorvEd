import Link from 'next/link'

const PAGE_SIZE = 25

export { PAGE_SIZE }

export function AdminPagination({
  currentPage,
  totalCount,
  baseHref,
  pageSize = PAGE_SIZE,
}: {
  currentPage: number
  totalCount: number
  baseHref: string
  pageSize?: number
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const separator = baseHref.includes('?') ? '&' : '?'

  return (
    <div className="flex items-center justify-between border-t-2 border-[#121212] pt-4">
      <p className="text-xs text-[#121212]/50">
        Page {currentPage} of {totalPages} · {totalCount} total
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage - 1}`}
            className="border-2 border-[#121212] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#121212] transition hover:bg-[#F0F0F0]"
          >
            ← Prev
          </Link>
        ) : (
          <span className="border-2 border-[#D0D0D0] bg-[#F0F0F0] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#121212]/30">
            ← Prev
          </span>
        )}
        {hasNext ? (
          <Link
            href={`${baseHref}${separator}page=${currentPage + 1}`}
            className="border-2 border-[#121212] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#121212] transition hover:bg-[#F0F0F0]"
          >
            Next →
          </Link>
        ) : (
          <span className="border-2 border-[#D0D0D0] bg-[#F0F0F0] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#121212]/30">
            Next →
          </span>
        )}
      </div>
    </div>
  )
}
