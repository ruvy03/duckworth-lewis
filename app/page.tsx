import Calculator from "@/components/dls/Calculator";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Duckworth/Lewis Calculator
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Revised targets and par scores for rain-interrupted limited-overs cricket, using the official D/L
            Standard Edition method.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Calculator />
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500 sm:px-6">
          <p>
            Implements the Duckworth/Lewis &quot;Standard Edition&quot; (2002), the ICC&apos;s own published backup
            method. Not affiliated with the ICC, Frank Duckworth, or Tony Lewis, and not a substitute for the
            official DLS software in a sanctioned match.
          </p>
        </div>
      </footer>
    </div>
  );
}
