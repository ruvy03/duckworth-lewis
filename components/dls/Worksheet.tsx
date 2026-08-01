"use client";

import { useState } from "react";
import { formatOvers, oversBallsToTotalBalls } from "@/lib/dls/resourceTable";
import type { MatchResult, ResourceStep } from "@/lib/dls/types";

interface WorksheetProps {
  g50: number;
  team1Score: number;
  match: MatchResult;
}

function StepRow({ step, index }: { step: ResourceStep; index: number }) {
  const stopOvers = formatOvers(oversBallsToTotalBalls(step.oversLeftAtStop.overs, step.oversLeftAtStop.balls));
  return (
    <li className="flex flex-col gap-0.5 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Stoppage {index + 1}</span>
      <span>
        Resource remaining at stoppage ({stopOvers} overs left, {step.wicketsLostAtStop} wkt
        {step.wicketsLostAtStop === 1 ? "" : "s"} lost) = {step.resourceAtStop}%
      </span>
      {step.terminatesInnings ? (
        <span>Innings ends here, so all {step.resourceAtStop}% of the remaining resource is lost.</span>
      ) : (
        <span>
          Resource remaining on resumption (
          {step.oversLeftAtResume ? formatOvers(oversBallsToTotalBalls(step.oversLeftAtResume.overs, step.oversLeftAtResume.balls)) : "0.0"}{" "}
          overs left, same wickets) = {step.resourceAtResume}%
        </span>
      )}
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        Resource lost = {step.resourceAtStop}% − {step.resourceAtResume}% = {step.resourceLost}%
      </span>
    </li>
  );
}

export default function Worksheet({ g50, team1Score, match }: WorksheetProps) {
  const [open, setOpen] = useState(false);
  const r1 = match.r1.availableResourcePercent;
  const r2 = match.r2.availableResourcePercent;

  let targetFormula: string;
  if (r2 === r1) {
    targetFormula = `R2 equals R1, so T = S + 1 = ${team1Score} + 1 = ${match.target}`;
  } else if (r2 < r1) {
    targetFormula = `R2 is less than R1, so T = (S × R2 / R1) + 1 = (${team1Score} × ${r2} / ${r1}) + 1 = ${match.target} (fraction rounded down before adding 1)`;
  } else {
    targetFormula = `R2 is greater than R1, so T = S + (R2 − R1) × G50/100 + 1 = ${team1Score} + (${r2} − ${r1}) × ${g50}/100 + 1 = ${match.target} (fraction rounded down before adding 1)`;
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Show full working</h2>
        <span className="text-zinc-500 dark:text-zinc-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-zinc-200 px-5 py-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Team 1</h3>
            <p>
              Starting resource (at {match.r1.startingResourcePercent === 100 ? "a full" : "its"} allocation, 0
              wickets) = {match.r1.startingResourcePercent}%
            </p>
            {match.r1.steps.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-2">
                {match.r1.steps.map((s, i) => (
                  <StepRow key={s.eventId} step={s} index={i} />
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">No stoppages recorded.</p>
            )}
            <p className="mt-2 font-medium text-zinc-800 dark:text-zinc-200">
              R1 = {match.r1.startingResourcePercent}% − {match.r1.totalResourceLost}% = {r1}%
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Team 2</h3>
            <p>Starting resource (at its allocation, 0 wickets) = {match.r2.startingResourcePercent}%</p>
            {match.r2.steps.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-2">
                {match.r2.steps.map((s, i) => (
                  <StepRow key={s.eventId} step={s} index={i} />
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">No stoppages recorded.</p>
            )}
            <p className="mt-2 font-medium text-zinc-800 dark:text-zinc-200">
              R2 = {match.r2.startingResourcePercent}% − {match.r2.totalResourceLost}% = {r2}%
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Target</h3>
            <p>{targetFormula}</p>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Par score (same formula, without the +1, used if the match is curtailed) = {match.par}
            </p>
          </div>

          {match.snapshots.length > 1 && (
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">Target after each stoppage in Team 2&apos;s innings</h3>
              <ul className="flex flex-col gap-1">
                {match.snapshots.map((s, i) => (
                  <li key={s.afterEventId ?? "start"}>
                    {i === 0 ? "At the start of the innings" : `After stoppage ${i}`}: R2 = {s.r2}% → target = {s.target}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
