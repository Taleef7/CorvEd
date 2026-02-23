// Matches index — placeholder until E8 (match creation + session generation) is implemented.
// Closes the 404 produced by the Admin Dashboard nav card linking to /admin/matches.

export default function AdminMatchesPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Matches</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Match management (assign tutor, set schedule, generate sessions) is implemented in Epic E8.
        Individual match detail pages are available at{' '}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          /admin/matches/[id]
        </code>
        .
      </p>
    </div>
  )
}
