// E3 S3.1: sign-in page (email/password + Google OAuth)
// Closes #18 #20

import { Suspense } from 'react'
import { SignInForm } from './SignInForm'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-md dark:bg-zinc-900">
        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}

function SignInSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded bg-indigo-100 dark:bg-indigo-900/30" />
    </div>
  )
}
