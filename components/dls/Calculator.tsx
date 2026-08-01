"use client";

import { useMemo, useState } from "react";
import { computeInningsResource, computeMatch, determineOutcome } from "@/lib/dls/engine";
import { G50_PRESETS, type G50PresetId } from "@/lib/dls/g50";
import { MAX_OVERS } from "@/lib/dls/resourceTable";
import type { InterruptionEvent, MatchOutcome, OversBalls } from "@/lib/dls/types";
import { validateInnings } from "@/lib/dls/validate";
import FormulaExplainer from "./FormulaExplainer";
import InterruptionEditor from "./InterruptionEditor";
import OversInput from "./OversInput";
import ResultCard from "./ResultCard";
import ResourceChart from "./ResourceChart";
import Worksheet from "./Worksheet";

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export default function Calculator() {
  const [matchOvers, setMatchOvers] = useState<OversBalls>({ overs: 50, balls: 0 });
  const [g50Preset, setG50Preset] = useState<G50PresetId>("full-member");
  const [customG50, setCustomG50] = useState(245);
  const g50 = g50Preset === "custom" ? customG50 : (G50_PRESETS.find((p) => p.id === g50Preset)?.value ?? 245);

  const [team1Score, setTeam1Score] = useState(0);
  const [team1Events, setTeam1Events] = useState<InterruptionEvent[]>([]);

  const [team2Allocation, setTeam2Allocation] = useState<OversBalls>({ overs: 50, balls: 0 });
  const [team2Events, setTeam2Events] = useState<InterruptionEvent[]>([]);
  const [team2Score, setTeam2Score] = useState(0);
  const [team2Wickets, setTeam2Wickets] = useState(0);
  const [team2OversFaced, setTeam2OversFaced] = useState<OversBalls>({ overs: 0, balls: 0 });
  const [inningsEnded, setInningsEnded] = useState(false);

  const team1 = useMemo(
    () => ({ initialAllocationOvers: matchOvers, events: team1Events }),
    [matchOvers, team1Events],
  );
  const team2 = useMemo(
    () => ({ initialAllocationOvers: team2Allocation, events: team2Events }),
    [team2Allocation, team2Events],
  );

  const match = useMemo(() => computeMatch(g50, team1Score, team1, team2), [g50, team1Score, team1, team2]);

  const curtailedByEvent = match.r2.terminated;

  // Hypothetical "if play stopped right now" preview, only meaningful while
  // the innings is still in progress and hasn't already been curtailed by a
  // real event. Reuses the exact same engine path as a genuine abandonment.
  const livePreview = useMemo(() => {
    if (inningsEnded || curtailedByEvent) return null;
    const previewInnings = {
      initialAllocationOvers: team2Allocation,
      events: [
        ...team2Events,
        {
          id: "__live-preview__",
          oversBowledSoFar: team2OversFaced,
          wicketsLostSoFar: team2Wickets,
          newAllocationOvers: null,
        },
      ],
    };
    return computeInningsResource(previewInnings);
  }, [inningsEnded, curtailedByEvent, team2Allocation, team2Events, team2OversFaced, team2Wickets]);

  const outcome: MatchOutcome = useMemo(() => {
    if (curtailedByEvent) {
      return determineOutcome({
        team2Score,
        team2Wickets,
        target: match.target,
        par: match.par,
        team2InningsCompleted: false,
        team2InningsCurtailed: true,
      });
    }
    if (inningsEnded) {
      return determineOutcome({
        team2Score,
        team2Wickets,
        target: match.target,
        par: match.par,
        team2InningsCompleted: true,
        team2InningsCurtailed: false,
      });
    }
    return { kind: "in-progress" };
  }, [curtailedByEvent, inningsEnded, team2Score, team2Wickets, match.target, match.par]);

  const warnings = useMemo(
    () => [...validateInnings(team1, "Team 1"), ...validateInnings(team2, "Team 2")],
    [team1, team2],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
        <OversInput
          id="match-overs"
          label="Overs per side (scheduled)"
          value={matchOvers}
          maxOvers={MAX_OVERS}
          onChange={setMatchOvers}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Average 50-over score (G50)</label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={g50Preset}
              onChange={(e) => setG50Preset(e.target.value as G50PresetId)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {G50_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {g50Preset === "custom" && (
              <input
                type="number"
                min={100}
                max={400}
                value={customG50}
                onChange={(e) => setCustomG50(clampInt(e.target.valueAsNumber, 100, 400))}
                className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {G50_PRESETS.find((p) => p.id === g50Preset)?.description}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team 1 (batting first)</h2>
          <div className="flex flex-col gap-1">
            <label htmlFor="team1-score" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Final score
            </label>
            <input
              id="team1-score"
              type="number"
              min={0}
              value={team1Score}
              onChange={(e) => setTeam1Score(clampInt(e.target.valueAsNumber, 0, 100000))}
              className="w-28 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Stoppages during Team 1&apos;s innings</h3>
            <InterruptionEditor
              idPrefix="t1"
              events={team1Events}
              onChange={setTeam1Events}
              maxOvers={matchOvers.overs}
            />
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Resource available to Team 1 (R1):{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {match.r1.availableResourcePercent}%
            </span>
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Team 2 (chasing)</h2>
          <OversInput
            id="team2-allocation"
            label="Overs allocated at start of innings"
            value={team2Allocation}
            maxOvers={MAX_OVERS}
            onChange={setTeam2Allocation}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Stoppages during Team 2&apos;s innings</h3>
            <InterruptionEditor
              idPrefix="t2"
              events={team2Events}
              onChange={setTeam2Events}
              maxOvers={team2Allocation.overs}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="team2-score" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Score
              </label>
              <input
                id="team2-score"
                type="number"
                min={0}
                value={team2Score}
                onChange={(e) => setTeam2Score(clampInt(e.target.valueAsNumber, 0, 100000))}
                className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="team2-wickets" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Wickets
              </label>
              <input
                id="team2-wickets"
                type="number"
                min={0}
                max={10}
                value={team2Wickets}
                onChange={(e) => setTeam2Wickets(clampInt(e.target.valueAsNumber, 0, 10))}
                className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {!curtailedByEvent && (
              <OversInput
                id="team2-faced"
                label={inningsEnded ? "Overs faced" : "Overs faced (now)"}
                value={team2OversFaced}
                maxOvers={MAX_OVERS}
                onChange={setTeam2OversFaced}
              />
            )}
          </div>

          {!curtailedByEvent && (
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={inningsEnded} onChange={(e) => setInningsEnded(e.target.checked)} />
              Team 2&apos;s innings is complete (all out / overs used / target reached)
            </label>
          )}
          {curtailedByEvent && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              The last stoppage above ends Team 2&apos;s innings, so the match result is decided on the par score.
            </p>
          )}

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Resource available to Team 2 (R2):{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {match.r2.availableResourcePercent}%
            </span>
          </p>
        </section>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <p className="mb-1 font-semibold">Check these inputs:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <ResultCard
        match={match}
        outcome={outcome}
        livePreview={livePreview}
        team1Score={team1Score}
        team2Score={team2Score}
        team2OversFaced={team2OversFaced}
        g50={g50}
        curtailedByEvent={curtailedByEvent}
      />

      <ResourceChart team1Allocation={matchOvers} team2Allocation={team2Allocation} r1={match.r1} r2={match.r2} />

      <Worksheet g50={g50} team1Score={team1Score} match={match} />

      <FormulaExplainer />
    </div>
  );
}
