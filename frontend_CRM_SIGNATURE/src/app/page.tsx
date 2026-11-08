import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-transparent">
      <h1 className="text-3xl font-semibold">
        <span className="whitespace-nowrap tracking-tight">
    Signature <span className="text-[#D4AF72]">Estates</span>
  </span>
      </h1>
      <h3 className="text-m font-medium text-neutral-700 dark:text-neutral-300">
        By Mantrix
      </h3>
      <Link
        href="/dashboard"
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
