export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center dark:bg-zinc-950">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        CorvEd
      </h1>
      <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
        Structured tutoring for O Levels &amp; A Levels
      </p>
      <p className="mt-8 max-w-sm text-sm text-zinc-400 dark:text-zinc-500">
        Platform is under active development. Auth, dashboards, and all
        features are coming soon.
      </p>
    </div>
  );
}
