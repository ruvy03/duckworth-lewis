import { describe, expect, it } from "vitest";
import { MAX_OVERS, MAX_WICKETS, WHOLE_OVER_TABLE, resourcePercent } from "../resourceTable";

describe("official whole-over resource table", () => {
  it("has 51 rows (0-50 overs) and 10 columns (0-9 wickets)", () => {
    expect(WHOLE_OVER_TABLE).toHaveLength(51);
    for (const row of WHOLE_OVER_TABLE) {
      expect(row).toHaveLength(10);
    }
  });

  it("is 100% with a full allocation and no wickets down", () => {
    expect(WHOLE_OVER_TABLE[50][0]).toBe(100.0);
  });

  it("is 0% with no overs left, regardless of wickets", () => {
    for (let w = 0; w <= MAX_WICKETS; w++) {
      expect(WHOLE_OVER_TABLE[0][w]).toBe(0);
    }
  });

  it("is non-increasing as overs left decreases, for every wicket column", () => {
    for (let w = 0; w <= MAX_WICKETS; w++) {
      for (let overs = 1; overs <= MAX_OVERS; overs++) {
        expect(WHOLE_OVER_TABLE[overs][w]).toBeGreaterThanOrEqual(WHOLE_OVER_TABLE[overs - 1][w]);
      }
    }
  });

  it("is non-increasing as wickets lost increases, for every overs-left row", () => {
    for (let overs = 0; overs <= MAX_OVERS; overs++) {
      for (let w = 1; w <= MAX_WICKETS; w++) {
        expect(WHOLE_OVER_TABLE[overs][w]).toBeLessThanOrEqual(WHOLE_OVER_TABLE[overs][w - 1]);
      }
    }
  });

  it("matches known reference points from the ICC-published table", () => {
    expect(WHOLE_OVER_TABLE[50]).toEqual([100.0, 93.4, 85.1, 74.9, 62.7, 49.0, 34.9, 22.0, 11.9, 4.7]);
    expect(WHOLE_OVER_TABLE[25][5]).toBe(42.2);
    expect(WHOLE_OVER_TABLE[1]).toEqual([3.6, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.2, 2.5]);
  });
});

describe("resourcePercent (whole overs)", () => {
  it("matches the table exactly for every whole-over, whole-wicket combination", () => {
    for (let overs = 0; overs <= MAX_OVERS; overs++) {
      for (let w = 0; w <= MAX_WICKETS; w++) {
        expect(resourcePercent(overs * 6, w)).toBe(WHOLE_OVER_TABLE[overs][w]);
      }
    }
  });

  it("treats 10 wickets down as 0% resource regardless of overs left", () => {
    expect(resourcePercent(300, 10)).toBe(0);
    expect(resourcePercent(1, 10)).toBe(0);
  });
});

describe("resourcePercent (ball-level interpolation)", () => {
  it("stays between the bracketing whole-over values", () => {
    for (let balls = 1; balls < 300; balls++) {
      const wholeOvers = Math.floor(balls / 6);
      if (balls % 6 === 0) continue;
      for (let w = 0; w <= MAX_WICKETS; w++) {
        const value = resourcePercent(balls, w);
        const low = WHOLE_OVER_TABLE[wholeOvers][w];
        const high = WHOLE_OVER_TABLE[wholeOvers + 1][w];
        expect(value).toBeGreaterThanOrEqual(low - 0.001);
        expect(value).toBeLessThanOrEqual(high + 0.001);
      }
    }
  });

  // ICC methodology PDF, Example 5: India v Pakistan, Singapore, April 1996.
  // "Resource percentage remaining at termination (2.5 overs left [2 overs, 5
  // balls], 8 wickets lost) = 6.9%". Our value is reconstructed by curve
  // fitting rather than transcribed from the (unpublished-to-us) exact
  // ball-by-ball sheet, so it is allowed a small tolerance - see the
  // FITTED_DECAY_PARAMS doc comment in resourceTable.ts for why this is safe.
  it("reproduces the ICC's own worked ball-level example within tolerance", () => {
    const oversLeftBalls = 2 * 6 + 5; // 2 overs, 5 balls left
    expect(Math.abs(resourcePercent(oversLeftBalls, 8) - 6.9)).toBeLessThanOrEqual(0.15);
  });

  // Example 4: "termination at 7.4 overs left [7 overs, 4 balls], 6 wickets
  // lost, remaining resource = 19.4%"
  it("reproduces a second ball-level example within tolerance", () => {
    const oversLeftBalls = 7 * 6 + 4;
    expect(Math.abs(resourcePercent(oversLeftBalls, 6) - 19.4)).toBeLessThanOrEqual(0.15);
  });
});
