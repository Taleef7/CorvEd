// E3 S3.1: email verification instructions page
// Closes #18 #20

import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 text-center shadow-md dark:bg-zinc-900">
        {/* Email icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
          <svg
            className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Check your inbox
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          We&apos;ve sent a confirmation link to your email address. Click the
          link to verify your account and access your dashboard.
        </p>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Didn&apos;t receive the email?
          </p>
          <ul className="mt-1 list-disc pl-4 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
            <li>The link expires after 1 hour</li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Wrong email?{' '}
          <Link
            href="/auth/sign-up"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Go back and sign up again
          </Link>
        </p>
      </div>
    </div>
  )
}
