export default function FormulaExplainer() {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">How the calculation works</h2>

      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          A team&apos;s ability to score runs depends on two things: how many overs it has left, and how many wickets
          it has in hand. The Duckworth/Lewis method calls this combined ability a team&apos;s{" "}
          <strong>resource</strong>, expressed as a percentage of the resource available to a team that faces a full,
          uninterrupted innings with all ten wickets standing.
        </p>
        <p>
          Every combination of overs left and wickets lost maps to a resource percentage, published by Frank
          Duckworth and Tony Lewis as a table (the &quot;Standard Edition&quot;). This is the exact table this app
          uses for whole-over lookups.
        </p>
      </div>

      <div className="rounded-lg bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Resource lost to a stoppage</p>
        <p className="text-zinc-900 dark:text-zinc-50">
          Resource lost = Resource(overs left, wickets) at stoppage − Resource(overs left, wickets) at resumption
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          <strong>R1</strong> is the total resource Team 1 had available (100%, minus anything lost to stoppages
          during its innings). <strong>R2</strong> is the same for Team 2 — which can differ from R1 if the two teams
          didn&apos;t get the same overs, or if Team 2&apos;s innings was also interrupted.
        </p>
        <p>
          Let <strong>S</strong> be Team 1&apos;s score and <strong>G50</strong> be the average total scored in an
          uninterrupted 50-over innings for this level of cricket (245 for full ODIs, 200 for lower levels). Team
          2&apos;s target <strong>T</strong> is then:
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-zinc-50 p-4 font-mono text-sm dark:bg-zinc-950">
        <div>
          <p className="text-zinc-500 dark:text-zinc-400">if R2 = R1 (resources are equal)</p>
          <p className="text-zinc-900 dark:text-zinc-50">T = S + 1</p>
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400">if R2 &lt; R1 (Team 2 has less resource)</p>
          <p className="text-zinc-900 dark:text-zinc-50">T = ⌊S × R2 / R1⌋ + 1</p>
        </div>
        <div>
          <p className="text-zinc-500 dark:text-zinc-400">if R2 &gt; R1 (Team 2 has more resource)</p>
          <p className="text-zinc-900 dark:text-zinc-50">T = S + ⌊(R2 − R1) × G50 / 100⌋ + 1</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        (⌊x⌋ means &quot;round down to a whole number&quot;.) If a match can&apos;t be finished, the same three cases
        decide the result using the <strong>par score</strong> — the same formula without the final +1 — compared
        against Team 2&apos;s actual score at the moment of abandonment.
      </p>

      <details className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-50">
          Which edition is this, and how accurate is it?
        </summary>
        <div className="mt-2 flex flex-col gap-2 leading-relaxed">
          <p>
            This app implements the <strong>D/L Standard Edition</strong> (2002 update) — the version Duckworth and
            Lewis published in full, including the resource table. It is also the method the ICC&apos;s own playing
            regulations mandate as the backup whenever the proprietary DLS (&quot;Stern Edition&quot;) software used
            in international cricket today is unavailable. The Stern Edition&apos;s adjusted tables are commercial
            and not public, so no independent calculator (this one included) can reproduce it exactly.
          </p>
          <p>
            Every whole-over resource value in this app is taken verbatim from the official published table.
            Mid-over (ball-by-ball) values, needed when a stoppage happens mid-over, are reconstructed by fitting
            Duckworth &amp; Lewis&apos;s own published exponential curve to that table and validated against the ICC&apos;s
            worked examples — accurate to within about 0.1 percentage points of resource, which only very rarely
            could shift a rounded target by a single run. See this project&apos;s README for the full derivation and
            source citations.
          </p>
        </div>
      </details>
    </section>
  );
}
