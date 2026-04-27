import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'

import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs'

describe('AdminBreadcrumbs', () => {
  test('renders deterministic admin return links without browser history', () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminBreadcrumbs, {
        items: [
          { label: 'Admin', href: '/admin' },
          { label: 'Requests', href: '/admin/requests' },
          { label: 'Request Detail' },
        ],
      }),
    )

    expect(html).toContain('href="/admin"')
    expect(html).toContain('href="/admin/requests"')
    expect(html).toContain('Request Detail')
  })
})
