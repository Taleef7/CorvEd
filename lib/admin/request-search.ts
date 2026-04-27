export type AdminRequestSearchRow = {
  for_student_name?: string | null
  subjects?: { name?: string | null } | null
  user_profiles?: { display_name?: string | null } | null
}

export function normalizeAdminRequestSearch(query: string | null | undefined): string {
  return (query ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function getSearchTokens(query: string | null | undefined): string[] {
  return normalizeAdminRequestSearch(query).split(' ').filter(Boolean)
}

function getSearchText(request: AdminRequestSearchRow): string {
  return [
    request.for_student_name,
    request.user_profiles?.display_name,
    request.subjects?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function filterAdminRequestsBySearch<T extends AdminRequestSearchRow>(
  requests: T[],
  query: string | null | undefined,
): T[] {
  const tokens = getSearchTokens(query)
  if (tokens.length === 0) return requests

  return requests.filter((request) => {
    const searchText = getSearchText(request)
    return tokens.every((token) => searchText.includes(token))
  })
}
