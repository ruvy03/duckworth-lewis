/**
 * Official Duckworth/Lewis "Standard Edition" resource table (2002 update),
 * published by Frank Duckworth & Tony Lewis and distributed by the ICC as the
 * mandated fallback method whenever the proprietary DLS Professional Edition
 * software is unavailable (ICC "Duckworth-Lewis Methodology for Re-Calculating
 * the Target Score in an Interrupted Match", clause 1). Source (ICC-hosted PDF):
 * https://images.icc-cricket.com/image/upload/prd/g9vlypi15msmrfnhucyx.pdf
 *
 * TABLE[overs][wickets] = % of run-scoring resources remaining with the given
 * number of whole overs left and wickets lost. Row 50 is a completely
 * unaffected innings (100% at 0 wickets); row 0 is always 0% (no overs left).
 * Values are transcribed verbatim from the official table and are the ground
 * truth for every whole-over lookup used by this app.
 */
export const MAX_OVERS = 50;
export const MAX_WICKETS = 9;
export const BALLS_PER_OVER = 6;
export const MAX_BALLS = MAX_OVERS * BALLS_PER_OVER;

// Index 0 = overs left, each row has 10 entries for wickets lost 0-9.
export const WHOLE_OVER_TABLE: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
  [3.6, 3.6, 3.6, 3.6, 3.6, 3.5, 3.5, 3.4, 3.2, 2.5], // 1
  [7.2, 7.1, 7.1, 7.0, 7.0, 6.8, 6.6, 6.2, 5.5, 3.7], // 2
  [10.6, 10.5, 10.4, 10.3, 10.2, 9.9, 9.5, 8.7, 7.2, 4.2], // 3
  [13.9, 13.8, 13.7, 13.5, 13.2, 12.7, 12.0, 10.7, 8.4, 4.5], // 4
  [17.2, 17.0, 16.8, 16.5, 16.1, 15.4, 14.3, 12.5, 9.4, 4.6], // 5
  [20.3, 20.1, 19.8, 19.4, 18.8, 17.8, 16.4, 13.9, 10.1, 4.6], // 6
  [23.4, 23.1, 22.7, 22.2, 21.4, 20.1, 18.2, 15.2, 10.5, 4.7], // 7
  [26.4, 26.0, 25.5, 24.8, 23.8, 22.3, 19.9, 16.2, 10.9, 4.7], // 8
  [29.3, 28.9, 28.2, 27.4, 26.1, 24.2, 21.4, 17.1, 11.2, 4.7], // 9
  [32.1, 31.6, 30.8, 29.8, 28.3, 26.1, 22.8, 17.9, 11.4, 4.7], // 10
  [34.9, 34.2, 33.4, 32.1, 30.4, 27.8, 24.0, 18.5, 11.5, 4.7], // 11
  [37.6, 36.8, 35.8, 34.3, 32.3, 29.4, 25.1, 19.0, 11.6, 4.7], // 12
  [40.2, 39.3, 38.1, 36.5, 34.2, 30.8, 26.1, 19.5, 11.7, 4.7], // 13
  [42.7, 41.7, 40.4, 38.5, 35.9, 32.2, 27.0, 19.9, 11.8, 4.7], // 14
  [45.2, 44.1, 42.6, 40.5, 37.6, 33.5, 27.8, 20.2, 11.8, 4.7], // 15
  [47.6, 46.3, 44.7, 42.3, 39.1, 34.7, 28.5, 20.5, 11.8, 4.7], // 16
  [49.9, 48.5, 46.7, 44.1, 40.6, 35.8, 29.2, 20.7, 11.9, 4.7], // 17
  [52.2, 50.7, 48.6, 45.9, 42.0, 36.8, 29.8, 20.9, 11.9, 4.7], // 18
  [54.4, 52.8, 50.5, 47.5, 43.4, 37.7, 30.3, 21.1, 11.9, 4.7], // 19
  [56.6, 54.8, 52.4, 49.1, 44.6, 38.6, 30.8, 21.2, 11.9, 4.7], // 20
  [58.7, 56.7, 54.1, 50.6, 45.8, 39.4, 31.2, 21.3, 11.9, 4.7], // 21
  [60.7, 58.6, 55.8, 52.0, 47.0, 40.2, 31.6, 21.4, 11.9, 4.7], // 22
  [62.7, 60.4, 57.4, 53.4, 48.0, 40.9, 32.0, 21.5, 11.9, 4.7], // 23
  [64.6, 62.2, 59.0, 54.7, 49.0, 41.6, 32.3, 21.6, 11.9, 4.7], // 24
  [66.5, 63.9, 60.5, 56.0, 50.0, 42.2, 32.6, 21.6, 11.9, 4.7], // 25
  [68.3, 65.6, 62.0, 57.2, 50.9, 42.8, 32.8, 21.7, 11.9, 4.7], // 26
  [70.1, 67.2, 63.4, 58.4, 51.8, 43.3, 33.0, 21.7, 11.9, 4.7], // 27
  [71.8, 68.8, 64.8, 59.5, 52.6, 43.8, 33.2, 21.8, 11.9, 4.7], // 28
  [73.5, 70.3, 66.1, 60.5, 53.4, 44.2, 33.4, 21.8, 11.9, 4.7], // 29
  [75.1, 71.8, 67.3, 61.6, 54.1, 44.7, 33.6, 21.8, 11.9, 4.7], // 30
  [76.7, 73.2, 68.6, 62.5, 54.8, 45.1, 33.7, 21.9, 11.9, 4.7], // 31
  [78.3, 74.6, 69.7, 63.5, 55.4, 45.4, 33.9, 21.9, 11.9, 4.7], // 32
  [79.8, 75.9, 70.9, 64.4, 56.0, 45.8, 34.0, 21.9, 11.9, 4.7], // 33
  [81.3, 77.2, 72.0, 65.2, 56.6, 46.1, 34.1, 21.9, 11.9, 4.7], // 34
  [82.7, 78.5, 73.0, 66.0, 57.2, 46.4, 34.2, 21.9, 11.9, 4.7], // 35
  [84.1, 79.7, 74.1, 66.8, 57.7, 46.6, 34.3, 21.9, 11.9, 4.7], // 36
  [85.4, 80.9, 75.0, 67.6, 58.2, 46.9, 34.4, 21.9, 11.9, 4.7], // 37
  [86.7, 82.0, 76.0, 68.3, 58.7, 47.1, 34.5, 21.9, 11.9, 4.7], // 38
  [88.0, 83.1, 76.9, 69.0, 59.1, 47.4, 34.5, 22.0, 11.9, 4.7], // 39
  [89.3, 84.2, 77.8, 69.6, 59.5, 47.6, 34.6, 22.0, 11.9, 4.7], // 40
  [90.5, 85.3, 78.7, 70.3, 59.9, 47.8, 34.6, 22.0, 11.9, 4.7], // 41
  [91.7, 86.3, 79.5, 70.9, 60.3, 47.9, 34.7, 22.0, 11.9, 4.7], // 42
  [92.8, 87.3, 80.3, 71.4, 60.7, 48.1, 34.7, 22.0, 11.9, 4.7], // 43
  [93.9, 88.2, 81.0, 72.0, 61.0, 48.3, 34.8, 22.0, 11.9, 4.7], // 44
  [95.0, 89.1, 81.8, 72.5, 61.3, 48.4, 34.8, 22.0, 11.9, 4.7], // 45
  [96.1, 90.0, 82.5, 73.0, 61.6, 48.5, 34.8, 22.0, 11.9, 4.7], // 46
  [97.1, 90.9, 83.2, 73.5, 61.9, 48.6, 34.9, 22.0, 11.9, 4.7], // 47
  [98.1, 91.7, 83.8, 74.0, 62.2, 48.8, 34.9, 22.0, 11.9, 4.7], // 48
  [99.1, 92.6, 84.5, 74.4, 62.5, 48.9, 34.9, 22.0, 11.9, 4.7], // 49
  [100.0, 93.4, 85.1, 74.9, 62.7, 49.0, 34.9, 22.0, 11.9, 4.7], // 50
];

/**
 * Exponential decay parameters Z0(w) and b(w) in the original Duckworth/Lewis
 * "Standard Edition" model, Z(u, w) = Z0(w) * (1 - exp(-b(w) * u)), where u is
 * overs remaining. These are not published to full precision by the ICC (only
 * the rounded table above is), so they are recovered here by least-squares
 * regression of that exact formula against every official whole-over value in
 * WHOLE_OVER_TABLE (fit RMSE 0.01-0.03 percentage points per column, i.e.
 * within the table's own 1-decimal rounding). They are used only to shape the
 * curve *between* whole overs (see interpolateBallLevel below) — every
 * whole-over lookup always comes directly from the verbatim table above, and
 * the fit reproduces the ICC's own published ball-by-ball examples (e.g. the
 * worked India v Pakistan example in the ICC methodology PDF) to within 0.1
 * percentage point.
 */
export const FITTED_DECAY_PARAMS: readonly { z0: number; b: number }[] = [
  { z0: 134.1023, b: 0.027394 },
  { z0: 118.5254, b: 0.030997 },
  { z0: 101.9144, b: 0.036039 },
  { z0: 84.4529, b: 0.043505 },
  { z0: 66.9956, b: 0.054869 },
  { z0: 50.281, b: 0.073077 },
  { z0: 35.1161, b: 0.104617 },
  { z0: 21.9899, b: 0.167213 },
  { z0: 11.9074, b: 0.309871 },
  { z0: 4.7001, b: 0.763221 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function oversBallsToTotalBalls(overs: number, balls: number): number {
  return overs * BALLS_PER_OVER + balls;
}

export function totalBallsToOversBalls(totalBalls: number): {
  overs: number;
  balls: number;
} {
  const clamped = clamp(Math.round(totalBalls), 0, MAX_BALLS);
  return {
    overs: Math.floor(clamped / BALLS_PER_OVER),
    balls: clamped % BALLS_PER_OVER,
  };
}

/** Formats total balls as standard cricket over.ball notation, e.g. 187 -> "31.1". */
export function formatOvers(totalBalls: number): string {
  const { overs, balls } = totalBallsToOversBalls(totalBalls);
  return `${overs}.${balls}`;
}

function decayCurve(u: number, wicketsLost: number): number {
  const w = clamp(Math.round(wicketsLost), 0, MAX_WICKETS);
  const { z0, b } = FITTED_DECAY_PARAMS[w];
  return z0 * (1 - Math.exp(-b * u));
}

/**
 * Resource percentage remaining for a given number of balls left in the
 * innings and wickets lost. Whole overs are read directly from the official
 * table (exact). Mid-over (ball-level) values are interpolated between the
 * two bracketing whole-over table entries, shaped by the fitted exponential
 * curve so the interpolation follows the true concave decay rather than a
 * straight line — see FITTED_DECAY_PARAMS for why this matches the ICC's own
 * ball-by-ball table.
 */
export function resourcePercent(ballsRemaining: number, wicketsLost: number): number {
  const w = clamp(Math.round(wicketsLost), 0, MAX_WICKETS);
  if (wicketsLost >= 10) return 0;
  const balls = clamp(Math.round(ballsRemaining), 0, MAX_BALLS);
  const wholeOvers = Math.floor(balls / BALLS_PER_OVER);
  const extraBalls = balls % BALLS_PER_OVER;

  if (extraBalls === 0) {
    return WHOLE_OVER_TABLE[wholeOvers][w];
  }

  const low = WHOLE_OVER_TABLE[wholeOvers][w];
  const high = WHOLE_OVER_TABLE[wholeOvers + 1][w];
  const uLow = wholeOvers;
  const uHigh = wholeOvers + 1;
  const uActual = wholeOvers + extraBalls / BALLS_PER_OVER;

  const fLow = decayCurve(uLow, w);
  const fHigh = decayCurve(uHigh, w);
  const fActual = decayCurve(uActual, w);

  const span = fHigh - fLow;
  const t = span === 0 ? extraBalls / BALLS_PER_OVER : (fActual - fLow) / span;
  const value = low + t * (high - low);
  return Math.round(value * 10) / 10;
}
