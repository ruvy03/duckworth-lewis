import { MAX_OVERS, oversBallsToTotalBalls } from "./resourceTable";
import type { InningsInput, OversBalls } from "./types";

export function isValidOversBalls(ob: OversBalls): boolean {
  return (
    Number.isInteger(ob.overs) &&
    Number.isInteger(ob.balls) &&
    ob.overs >= 0 &&
    ob.overs <= MAX_OVERS &&
    ob.balls >= 0 &&
    ob.balls <= 5
  );
}

/**
 * Non-blocking sanity checks on an innings' interruption timeline: overs
 * bowled and wickets lost should never go backwards, an event can't claim
 * more overs bowled than the allocation in force at the time, and a revised
 * allocation can't be set below what has already been bowled. Returns
 * human-readable warnings; the calculator still computes a result even if
 * warnings are present, since the maths itself is well-defined regardless.
 */
export function validateInnings(innings: InningsInput, label: string): string[] {
  const warnings: string[] = [];

  if (!isValidOversBalls(innings.initialAllocationOvers)) {
    warnings.push(`${label}: initial overs allocation is invalid.`);
  }

  let currentAllocationBalls = oversBallsToTotalBalls(
    innings.initialAllocationOvers.overs,
    innings.initialAllocationOvers.balls,
  );
  let lastBowledBalls = -1;
  let lastWickets = -1;

  innings.events.forEach((event, index) => {
    const n = index + 1;
    if (!isValidOversBalls(event.oversBowledSoFar)) {
      warnings.push(`${label}, stoppage ${n}: overs bowled is invalid.`);
    }
    if (!Number.isInteger(event.wicketsLostSoFar) || event.wicketsLostSoFar < 0 || event.wicketsLostSoFar > 9) {
      warnings.push(`${label}, stoppage ${n}: wickets lost must be between 0 and 9.`);
    }

    const bowledBalls = oversBallsToTotalBalls(event.oversBowledSoFar.overs, event.oversBowledSoFar.balls);

    if (bowledBalls < lastBowledBalls) {
      warnings.push(`${label}, stoppage ${n}: overs bowled is earlier than the previous stoppage.`);
    }
    if (event.wicketsLostSoFar < lastWickets) {
      warnings.push(`${label}, stoppage ${n}: wickets lost is lower than the previous stoppage.`);
    }
    if (bowledBalls > currentAllocationBalls) {
      warnings.push(`${label}, stoppage ${n}: overs bowled exceeds the overs allocated at that point.`);
    }

    if (event.newAllocationOvers !== null) {
      if (!isValidOversBalls(event.newAllocationOvers)) {
        warnings.push(`${label}, stoppage ${n}: revised allocation is invalid.`);
      } else {
        const newAllocationBalls = oversBallsToTotalBalls(
          event.newAllocationOvers.overs,
          event.newAllocationOvers.balls,
        );
        if (newAllocationBalls < bowledBalls) {
          warnings.push(`${label}, stoppage ${n}: revised allocation is less than overs already bowled.`);
        }
        if (newAllocationBalls > currentAllocationBalls) {
          warnings.push(`${label}, stoppage ${n}: revised allocation increases the overs available, which is unusual.`);
        }
        currentAllocationBalls = newAllocationBalls;
      }
    }

    lastBowledBalls = bowledBalls;
    lastWickets = event.wicketsLostSoFar;
  });

  return warnings;
}
