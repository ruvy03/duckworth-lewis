import { oversBallsToTotalBalls, resourcePercent, totalBallsToOversBalls } from "./resourceTable";
import type {
  InningsInput,
  InningsResourceResult,
  MatchOutcome,
  MatchResult,
  OversBalls,
  ResourceStep,
  TargetSnapshot,
} from "./types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function toBalls(ob: OversBalls): number {
  return oversBallsToTotalBalls(ob.overs, ob.balls);
}

function ob(totalBalls: number): OversBalls {
  return totalBallsToOversBalls(totalBalls);
}

/**
 * Walks the chronological list of interruptions for one innings and applies
 * ICC D/L Standard Edition clauses 3 (resource lost per suspension) and 5.2 /
 * 5.5 (accumulating those losses against the innings' starting resource).
 */
export function computeInningsResource(innings: InningsInput): InningsResourceResult {
  const startingResourcePercent = resourcePercent(toBalls(innings.initialAllocationOvers), 0);

  let currentAllocationBalls = toBalls(innings.initialAllocationOvers);
  let totalResourceLost = 0;
  let terminated = false;
  const steps: ResourceStep[] = [];

  for (const event of innings.events) {
    if (terminated) break;

    const bowledBalls = toBalls(event.oversBowledSoFar);
    const oversLeftAtStopBalls = Math.max(0, currentAllocationBalls - bowledBalls);
    const resourceAtStop = resourcePercent(oversLeftAtStopBalls, event.wicketsLostSoFar);

    let resourceAtResume: number;
    let oversLeftAtResume: OversBalls | null;
    let newAllocationBalls: number;

    if (event.newAllocationOvers === null) {
      resourceAtResume = 0;
      oversLeftAtResume = null;
      newAllocationBalls = bowledBalls;
      terminated = true;
    } else {
      newAllocationBalls = toBalls(event.newAllocationOvers);
      const oversLeftAtResumeBalls = Math.max(0, newAllocationBalls - bowledBalls);
      resourceAtResume = resourcePercent(oversLeftAtResumeBalls, event.wicketsLostSoFar);
      oversLeftAtResume = ob(oversLeftAtResumeBalls);
    }

    const resourceLost = round1(resourceAtStop - resourceAtResume);
    totalResourceLost = round1(totalResourceLost + resourceLost);

    steps.push({
      eventId: event.id,
      oversLeftAtStop: ob(oversLeftAtStopBalls),
      wicketsLostAtStop: event.wicketsLostSoFar,
      resourceAtStop,
      oversLeftAtResume,
      resourceAtResume,
      resourceLost,
      terminatesInnings: event.newAllocationOvers === null,
    });

    currentAllocationBalls = newAllocationBalls;
  }

  const availableResourcePercent = round1(startingResourcePercent - totalResourceLost);

  return {
    startingResourcePercent,
    totalResourceLost,
    availableResourcePercent,
    finalAllocationOvers: ob(currentAllocationBalls),
    terminated,
    steps,
  };
}

/** ICC D/L Standard Edition clause 5.6. Returns the winning target (includes the +1). */
export function computeTarget(score: number, r1: number, r2: number, g50: number): number {
  if (r2 === r1) return score + 1;
  if (r2 < r1) return Math.floor((score * r2) / r1) + 1;
  return score + Math.floor(((r2 - r1) * g50) / 100) + 1;
}

/** Same formula as computeTarget but without the +1, used as the "par score" for a curtailed match. */
export function computePar(score: number, r1: number, r2: number, g50: number): number {
  if (r2 === r1) return score;
  if (r2 < r1) return Math.floor((score * r2) / r1);
  return score + Math.floor(((r2 - r1) * g50) / 100);
}

/**
 * Runs the full match: Team 1's resource usage, then Team 2's resource usage
 * event-by-event, producing a target/par snapshot after every interruption
 * (mirroring the ICC worked examples, which recompute the target after each
 * new stoppage during the chase).
 */
export function computeMatch(
  g50: number,
  team1Score: number,
  team1: InningsInput,
  team2: InningsInput,
): MatchResult {
  const r1Result = computeInningsResource(team1);
  const r1 = r1Result.availableResourcePercent;

  const snapshots: TargetSnapshot[] = [];
  const initialR2 = resourcePercent(toBalls(team2.initialAllocationOvers), 0);
  snapshots.push({
    afterEventId: null,
    r1,
    r2: initialR2,
    target: computeTarget(team1Score, r1, initialR2, g50),
    par: computePar(team1Score, r1, initialR2, g50),
  });

  // Recompute R2 after each successive prefix of team2's events so callers can
  // show how the target evolved through the innings.
  for (let i = 0; i < team2.events.length; i++) {
    const prefix: InningsInput = {
      initialAllocationOvers: team2.initialAllocationOvers,
      events: team2.events.slice(0, i + 1),
    };
    const partial = computeInningsResource(prefix);
    snapshots.push({
      afterEventId: team2.events[i].id,
      r1,
      r2: partial.availableResourcePercent,
      target: computeTarget(team1Score, r1, partial.availableResourcePercent, g50),
      par: computePar(team1Score, r1, partial.availableResourcePercent, g50),
    });
  }

  const r2Result = computeInningsResource(team2);
  const r2 = r2Result.availableResourcePercent;

  return {
    r1: r1Result,
    r2: r2Result,
    target: computeTarget(team1Score, r1, r2, g50),
    par: computePar(team1Score, r1, r2, g50),
    snapshots,
    dlsApplied: r1Result.totalResourceLost > 0 || r2Result.totalResourceLost > 0 || r1 !== r2,
  };
}

export interface OutcomeInput {
  team2Score: number;
  team2Wickets: number;
  target: number;
  par: number;
  team2InningsCompleted: boolean; // true = played out (all out / overs used / reached target)
  team2InningsCurtailed: boolean; // true = abandoned before completion
}

export function determineOutcome(input: OutcomeInput): MatchOutcome {
  const { team2Score, team2Wickets, target, par, team2InningsCompleted, team2InningsCurtailed } = input;

  if (team2InningsCurtailed) {
    if (team2Score > par) return { kind: "team2-win", marginWickets: 10 - team2Wickets };
    if (team2Score === par) return { kind: "tie", byCurtailment: true };
    return { kind: "team1-win", marginRuns: par - team2Score, byCurtailment: true };
  }

  if (!team2InningsCompleted) return { kind: "in-progress" };

  if (team2Score >= target) return { kind: "team2-win", marginWickets: 10 - team2Wickets };
  if (team2Score === target - 1) return { kind: "tie", byCurtailment: false };
  return { kind: "team1-win", marginRuns: target - 1 - team2Score, byCurtailment: false };
}
