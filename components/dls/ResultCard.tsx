"use client";

import { computePar } from "@/lib/dls/engine";
import { oversBallsToTotalBalls, formatOvers } from "@/lib/dls/resourceTable";
import type { InningsResourceResult, MatchOutcome, MatchResult, OversBalls } from "@/lib/dls/types";

interface ResultCardProps {
  match: MatchResult;
  outcome: MatchOutcome;
  livePreview: InningsResourceResult | null;
  team1Score: number;
  team2Score: number;
  team2OversFaced: OversBalls;
  g50: number;
  curtailedByEvent: boolean;
}

export default function ResultCard({
  match,
  outcome,
  livePreview,
  team1Score,
  team2Score,
  team2OversFaced,
  g50,
  curtailedByEvent,
}: ResultCardProps) {
  const dlsTag = match.dlsApplied ? " (D/L method)" : "";

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Result</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Target for Team 2 to win" value={match.target} sub={`i.e. ${match.target} runs to win`} />
        <Stat
          label="Par score"
          value={match.par}
          sub="score Team 2 needs to be level with right now if the match is curtailed"
        />
      </div>

      <OutcomeBanner outcome={outcome} dlsTag={dlsTag} />

      {!curtailedByEvent && outcome.kind === "in-progress" && livePreview && (
        <LivePreview
          livePreview={livePreview}
          match={match}
          team1Score={team1Score}
          team2Score={team2Score}
          team2OversFaced={team2OversFaced}
          g50={g50}
        />
      )}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-lg bg-white/70 p-3 dark:bg-zinc-900/40">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>
    </div>
  );
}

function OutcomeBanner({ outcome, dlsTag }: { outcome: MatchOutcome; dlsTag: string }) {
  if (outcome.kind === "in-progress") {
    return (
      <p className="rounded-md bg-white/70 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
        Match in progress.
      </p>
    );
  }
  if (outcome.kind === "team2-win") {
    return (
      <p className="rounded-md bg-white px-3 py-2 text-base font-semibold text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400">
        Team 2 win by {outcome.marginWickets} wicket{outcome.marginWickets === 1 ? "" : "s"}
        {dlsTag}
      </p>
    );
  }
  if (outcome.kind === "tie") {
    return (
      <p className="rounded-md bg-white px-3 py-2 text-base font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        Match tied{dlsTag}
        {outcome.byCurtailment ? " (decided on par score after curtailment)" : ""}
      </p>
    );
  }
  return (
    <p className="rounded-md bg-white px-3 py-2 text-base font-semibold text-emerald-700 dark:bg-zinc-900 dark:text-emerald-400">
      Team 1 win by {outcome.marginRuns} run{outcome.marginRuns === 1 ? "" : "s"}
      {dlsTag}
      {outcome.byCurtailment ? " (match curtailed)" : ""}
    </p>
  );
}

function LivePreview({
  livePreview,
  match,
  team1Score,
  team2Score,
  team2OversFaced,
  g50,
}: {
  livePreview: InningsResourceResult;
  match: MatchResult;
  team1Score: number;
  team2Score: number;
  team2OversFaced: OversBalls;
  g50: number;
}) {
  const remainingBalls = Math.max(
    0,
    oversBallsToTotalBalls(match.r2.finalAllocationOvers.overs, match.r2.finalAllocationOvers.balls) -
      oversBallsToTotalBalls(team2OversFaced.overs, team2OversFaced.balls),
  );
  const runsNeeded = match.target - team2Score;
  const requiredRunRate = remainingBalls > 0 ? (runsNeeded / (remainingBalls / 6)).toFixed(2) : "-";

  const previewPar = computePar(team1Score, match.r1.availableResourcePercent, livePreview.availableResourcePercent, g50);
  const diff = team2Score - previewPar;

  return (
    <div className="flex flex-col gap-1 rounded-md bg-white/70 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
      <p>
        Need <span className="font-semibold">{Math.max(0, runsNeeded)}</span> more run
        {runsNeeded === 1 ? "" : "s"} to win
        {remainingBalls > 0 && (
          <>
            {" "}
            at a required rate of <span className="font-semibold">{requiredRunRate}</span> runs/over (
            {formatOvers(remainingBalls)} overs left)
          </>
        )}
        .
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        If play stopped right now: Team 2 would be{" "}
        <span className="font-semibold">
          {diff === 0
            ? "level with"
            : diff > 0
              ? `${diff} run${diff === 1 ? "" : "s"} ahead of`
              : `${-diff} run${-diff === 1 ? "" : "s"} behind`}
        </span>{" "}
        the D/L par score ({previewPar}).
      </p>
    </div>
  );
}
