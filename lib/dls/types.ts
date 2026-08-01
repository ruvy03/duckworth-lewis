export interface OversBalls {
  overs: number;
  balls: number; // 0-5
}

/**
 * One stoppage in an innings. Because no deliveries are bowled while play is
 * suspended, the point in the innings (overs bowled, wickets down) is the same
 * at both the start and the end of the stoppage - the only thing a stoppage
 * can change is the innings' total overs allocation going forward.
 */
export interface InterruptionEvent {
  id: string;
  oversBowledSoFar: OversBalls;
  wicketsLostSoFar: number; // 0-9
  /** Revised total overs allocation once play resumes, or null if the innings ends here. */
  newAllocationOvers: OversBalls | null;
  note?: string;
}

export interface InningsInput {
  initialAllocationOvers: OversBalls;
  events: InterruptionEvent[];
}

export interface ResourceStep {
  eventId: string;
  oversLeftAtStop: OversBalls;
  wicketsLostAtStop: number;
  resourceAtStop: number;
  oversLeftAtResume: OversBalls | null;
  resourceAtResume: number;
  resourceLost: number;
  terminatesInnings: boolean;
}

export interface InningsResourceResult {
  startingResourcePercent: number;
  totalResourceLost: number;
  availableResourcePercent: number;
  finalAllocationOvers: OversBalls;
  terminated: boolean;
  steps: ResourceStep[];
}

export type G50Preset = "full-member" | "lower-level" | "custom";

export interface MatchInput {
  g50: number;
  team1: InningsInput;
  team1Score: number;
  team2: InningsInput;
}

export interface TargetSnapshot {
  afterEventId: string | null; // null = initial (no interruptions yet)
  r1: number;
  r2: number;
  target: number;
  par: number;
}

export type MatchOutcome =
  | { kind: "in-progress" }
  | { kind: "team2-win"; marginWickets: number }
  | { kind: "team1-win"; marginRuns: number; byCurtailment: boolean }
  | { kind: "tie"; byCurtailment: boolean };

export interface MatchResult {
  r1: InningsResourceResult;
  r2: InningsResourceResult;
  target: number;
  par: number;
  snapshots: TargetSnapshot[];
  dlsApplied: boolean;
}
