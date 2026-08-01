import { describe, expect, it } from "vitest";
import { computeInningsResource, computeMatch, computePar, computeTarget, determineOutcome } from "../engine";
import type { InningsInput } from "../types";

const FULL_MEMBER_G50 = 245;

function ob(overs: number, balls = 0) {
  return { overs, balls };
}

// Every scenario below is taken verbatim from the ICC's own methodology
// document ("Duckworth-Lewis Methodology for Re-Calculating the Target Score
// in an Interrupted Match", section 6, Examples 1-6) and cross-checked against
// the official resource table so the expected numbers are the ICC's, not ours.

describe("Example 1 - suspension during Team 1's innings", () => {
  const team1: InningsInput = {
    initialAllocationOvers: ob(50),
    events: [{ id: "e1", oversBowledSoFar: ob(20), wicketsLostSoFar: 3, newAllocationOvers: ob(40) }],
  };
  const team2: InningsInput = { initialAllocationOvers: ob(40), events: [] };

  it("R1 = 87.5%, target = 185", () => {
    const r1 = computeInningsResource(team1);
    expect(r1.availableResourcePercent).toBe(87.5);

    const match = computeMatch(FULL_MEMBER_G50, 180, team1, team2);
    expect(match.r2.availableResourcePercent).toBe(89.3);
    expect(match.target).toBe(185);
  });
});

describe("Example 2 - delay to the start of Team 2's innings", () => {
  it("R1 = 95.0%, R2 = 82.7%, target = 185", () => {
    const team1: InningsInput = { initialAllocationOvers: ob(45), events: [] };
    const team2: InningsInput = { initialAllocationOvers: ob(35), events: [] };

    const match = computeMatch(FULL_MEMBER_G50, 212, team1, team2);
    expect(match.r1.availableResourcePercent).toBe(95.0);
    expect(match.r2.availableResourcePercent).toBe(82.7);
    expect(match.target).toBe(185);
  });
});

describe("Example 3 - suspension during Team 2's innings", () => {
  // Team 1: 250, uninterrupted. Team 2: 98/1 after 12 overs, then 10 overs lost.
  const team1: InningsInput = { initialAllocationOvers: ob(50), events: [] };
  const team2: InningsInput = {
    initialAllocationOvers: ob(50),
    events: [{ id: "sus1", oversBowledSoFar: ob(12), wicketsLostSoFar: 1, newAllocationOvers: ob(40) }],
  };

  it("resource lost = 13.2%, R2 = 86.8%, target = 218", () => {
    const r2 = computeInningsResource(team2);
    expect(r2.steps[0].resourceAtStop).toBe(82.0);
    expect(r2.steps[0].resourceAtResume).toBe(68.8);
    expect(r2.totalResourceLost).toBe(13.2);
    expect(r2.availableResourcePercent).toBe(86.8);

    const match = computeMatch(FULL_MEMBER_G50, 250, team1, team2);
    expect(match.target).toBe(218);
  });
});

describe("Example 4 - multiple suspensions and abandonment (continues Example 3)", () => {
  const team1: InningsInput = { initialAllocationOvers: ob(50), events: [] };
  const team2: InningsInput = {
    initialAllocationOvers: ob(50),
    events: [
      { id: "sus1", oversBowledSoFar: ob(12), wicketsLostSoFar: 1, newAllocationOvers: ob(40) },
      { id: "sus2", oversBowledSoFar: ob(22), wicketsLostSoFar: 3, newAllocationOvers: ob(38) },
      { id: "abandon", oversBowledSoFar: ob(30, 2), wicketsLostSoFar: 6, newAllocationOvers: null },
    ],
  };

  it("R2 progresses 86.8% -> 83.2% -> 63.8% and the match is a 5-run Team 1 win on par score", () => {
    const match = computeMatch(FULL_MEMBER_G50, 250, team1, team2);

    expect(match.snapshots[1].r2).toBe(86.8);
    expect(match.snapshots[1].target).toBe(218);

    expect(match.snapshots[2].r2).toBe(83.2);
    expect(match.snapshots[2].target).toBe(209);

    expect(match.r2.availableResourcePercent).toBe(63.8);
    expect(match.par).toBe(159);

    const outcome = determineOutcome({
      team2Score: 154,
      team2Wickets: 6,
      target: match.target,
      par: match.par,
      team2InningsCompleted: false,
      team2InningsCurtailed: true,
    });
    expect(outcome).toEqual({ kind: "team1-win", marginRuns: 5, byCurtailment: true });
  });
});

describe("Examples 5 & 6 - India v Pakistan, Singapore, April 1996", () => {
  const team1: InningsInput = {
    initialAllocationOvers: ob(50),
    events: [{ id: "rain", oversBowledSoFar: ob(47, 1), wicketsLostSoFar: 8, newAllocationOvers: null }],
  };

  it("Example 5: R1 ~= 93.1% (mid-over, ball-level), R2 = 79.8%, target = 194", () => {
    const team2: InningsInput = { initialAllocationOvers: ob(33), events: [] };
    const match = computeMatch(FULL_MEMBER_G50, 226, team1, team2);

    // Team 1's termination happens mid-over (47.1 overs bowled out of 50), so
    // R1 depends on the ball-level interpolation, which is a close curve-fit
    // reconstruction rather than an exact transcription - allow it a small
    // tolerance rather than pinning the ICC's own published 93.1% exactly.
    expect(Math.abs(match.r1.availableResourcePercent - 93.1)).toBeLessThanOrEqual(0.15);
    expect(match.r2.availableResourcePercent).toBe(79.8);
    expect(match.target).toBe(194);
  });

  it("Example 6: a further stoppage drops R2 to 64.7% and the target to 158", () => {
    const team2: InningsInput = {
      initialAllocationOvers: ob(33),
      events: [{ id: "sus", oversBowledSoFar: ob(25), wicketsLostSoFar: 2, newAllocationOvers: ob(28) }],
    };
    const match = computeMatch(FULL_MEMBER_G50, 226, team1, team2);

    const r2 = computeInningsResource(team2);
    expect(r2.steps[0].resourceAtStop).toBe(25.5);
    expect(r2.steps[0].resourceAtResume).toBe(10.4);
    expect(match.r2.availableResourcePercent).toBe(64.7);
    expect(match.target).toBe(158);
  });
});

describe("computeTarget / computePar formula cases", () => {
  it("target is score + 1 when resources are equal", () => {
    expect(computeTarget(150, 80, 80, 245)).toBe(151);
    expect(computePar(150, 80, 80, 245)).toBe(150);
  });

  it("floors the intermediate product before adding 1 when R2 < R1", () => {
    // 199 * 99.9/100 = 198.801 -> floor 198 -> +1 = 199
    expect(computeTarget(199, 100, 99.9, 245)).toBe(199);
  });

  it("floors the excess-resource runs before adding 1 when R2 > R1", () => {
    expect(computeTarget(180, 87.5, 89.3, 245)).toBe(185);
  });
});

describe("determineOutcome", () => {
  it("declares Team 2 the winner once they pass the target", () => {
    expect(
      determineOutcome({
        team2Score: 190,
        team2Wickets: 4,
        target: 185,
        par: 184,
        team2InningsCompleted: true,
        team2InningsCurtailed: false,
      }),
    ).toEqual({ kind: "team2-win", marginWickets: 6 });
  });

  it("declares a tie when Team 2 finishes exactly one short of the target", () => {
    expect(
      determineOutcome({
        team2Score: 184,
        team2Wickets: 9,
        target: 185,
        par: 184,
        team2InningsCompleted: true,
        team2InningsCurtailed: false,
      }),
    ).toEqual({ kind: "tie", byCurtailment: false });
  });

  it("gives Team 1 the win by the run margin below target - 1", () => {
    expect(
      determineOutcome({
        team2Score: 180,
        team2Wickets: 10,
        target: 185,
        par: 184,
        team2InningsCompleted: true,
        team2InningsCurtailed: false,
      }),
    ).toEqual({ kind: "team1-win", marginRuns: 4, byCurtailment: false });
  });
});
