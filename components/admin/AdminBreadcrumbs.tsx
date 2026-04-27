import Link from 'next/link'

export type AdminBreadcrumbItem = {
  label: string
  href?: string
}

export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav aria-label="Admin breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-[#121212]/50">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-bold text-[#1040C0] underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-semibold text-[#121212]' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
