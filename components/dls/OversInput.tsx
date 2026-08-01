"use client";

import type { OversBalls } from "@/lib/dls/types";

interface OversInputProps {
  label: string;
  value: OversBalls;
  onChange: (value: OversBalls) => void;
  maxOvers?: number;
  id: string;
}

export default function OversInput({ label, value, onChange, maxOvers = 50, id }: OversInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${id}-overs`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id={`${id}-overs`}
          type="number"
          inputMode="numeric"
          min={0}
          max={maxOvers}
          value={value.overs}
          onChange={(e) => {
            const overs = clampInt(e.target.valueAsNumber, 0, maxOvers);
            onChange({ ...value, overs });
          }}
          className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label={`${label} - overs`}
        />
        <span className="text-sm text-zinc-500 dark:text-zinc-400">.</span>
        <select
          id={`${id}-balls`}
          value={value.balls}
          onChange={(e) => onChange({ ...value, balls: Number(e.target.value) })}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label={`${label} - balls`}
        >
          {[0, 1, 2, 3, 4, 5].map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-400">overs.balls</span>
      </div>
    </div>
  );
}

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
