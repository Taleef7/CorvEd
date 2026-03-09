// Client component — wraps the delete-user server action with a browser confirm dialog
'use client'

import { useTransition } from 'react'

type DeleteUserButtonProps = {
  userId: string
  displayName: string
  deleteAction: (userId: string) => Promise<void>
}

export function DeleteUserButton({ userId, displayName, deleteAction }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete "${displayName}"? This permanently removes the account and all data. This cannot be undone.`)) {
      return
    }
    startTransition(async () => {
      try {
        await deleteAction(userId)
      } catch (err) {
        alert((err as Error).message ?? 'Failed to delete user.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-[#D02020] hover:underline disabled:opacity-40"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
