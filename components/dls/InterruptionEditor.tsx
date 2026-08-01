"use client";

import type { InterruptionEvent, OversBalls } from "@/lib/dls/types";
import OversInput from "./OversInput";

interface InterruptionEditorProps {
  idPrefix: string;
  events: InterruptionEvent[];
  onChange: (events: InterruptionEvent[]) => void;
  maxOvers: number;
}

function newEvent(id: string): InterruptionEvent {
  return {
    id,
    oversBowledSoFar: { overs: 0, balls: 0 },
    wicketsLostSoFar: 0,
    newAllocationOvers: { overs: 0, balls: 0 },
  };
}

export default function InterruptionEditor({ idPrefix, events, onChange, maxOvers }: InterruptionEditorProps) {
  function update(id: string, patch: Partial<InterruptionEvent>) {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    onChange(events.filter((e) => e.id !== id));
  }

  function add() {
    onChange([...events, newEvent(`${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`)]);
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event, index) => {
        const isAbandoned = event.newAllocationOvers === null;
        return (
          <div
            key={event.id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Stoppage {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(event.id)}
                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <OversInput
                id={`${event.id}-bowled`}
                label="Overs bowled when play stopped"
                maxOvers={maxOvers}
                value={event.oversBowledSoFar}
                onChange={(v) => update(event.id, { oversBowledSoFar: v })}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor={`${event.id}-wkts`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Wickets down
                </label>
                <input
                  id={`${event.id}-wkts`}
                  type="number"
                  min={0}
                  max={9}
                  value={event.wicketsLostSoFar}
                  onChange={(e) =>
                    update(event.id, { wicketsLostSoFar: clampInt(e.target.valueAsNumber, 0, 9) })
                  }
                  className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={`${event.id}-mode`}
                    checked={!isAbandoned}
                    onChange={() => update(event.id, { newAllocationOvers: { overs: maxOvers, balls: 0 } })}
                  />
                  Play resumes
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={`${event.id}-mode`}
                    checked={isAbandoned}
                    onChange={() => update(event.id, { newAllocationOvers: null })}
                  />
                  Innings ends here (abandoned)
                </label>
              </div>

              {!isAbandoned && (
                <OversInput
                  id={`${event.id}-resume`}
                  label="Revised overs allocation on resumption"
                  maxOvers={maxOvers}
                  value={event.newAllocationOvers as OversBalls}
                  onChange={(v) => update(event.id, { newAllocationOvers: v })}
                />
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="self-start rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        + Add stoppage
      </button>
    </div>
  );
}

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
