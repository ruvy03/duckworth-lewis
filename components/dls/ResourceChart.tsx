"use client";

import { useMemo, useState } from "react";
import { WHOLE_OVER_TABLE } from "@/lib/dls/resourceTable";
import type { InningsResourceResult, OversBalls } from "@/lib/dls/types";

interface ResourceChartProps {
  team1Allocation: OversBalls;
  team2Allocation: OversBalls;
  r1: InningsResourceResult;
  r2: InningsResourceResult;
}

const WIDTH = 640;
const HEIGHT = 280;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 40 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function seriesFor(finalAllocationOvers: OversBalls) {
  const maxOvers = finalAllocationOvers.overs + (finalAllocationOvers.balls > 0 ? 1 : 0);
  const points: { overs: number; resource: number }[] = [];
  for (let overs = 0; overs <= maxOvers; overs++) {
    const oversLeft = Math.max(0, finalAllocationOvers.overs - overs);
    points.push({ overs, resource: WHOLE_OVER_TABLE[Math.min(50, oversLeft)][0] });
  }
  return points;
}

export default function ResourceChart({ team1Allocation, team2Allocation, r1, r2 }: ResourceChartProps) {
  const [hoverOvers, setHoverOvers] = useState<number | null>(null);

  const team1Points = useMemo(() => seriesFor(r1.finalAllocationOvers), [r1.finalAllocationOvers]);
  const team2Points = useMemo(() => seriesFor(r2.finalAllocationOvers), [r2.finalAllocationOvers]);
  const maxOversAxis = Math.max(team1Allocation.overs, team2Allocation.overs, 1);

  const xScale = (overs: number) => (overs / maxOversAxis) * PLOT_W;
  const yScale = (resource: number) => PLOT_H - (resource / 100) * PLOT_H;

  const linePath = (points: { overs: number; resource: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.overs).toFixed(2)} ${yScale(p.resource).toFixed(2)}`).join(" ");

  const areaPath = (points: { overs: number; resource: number }[]) => {
    if (points.length === 0) return "";
    const line = linePath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${xScale(last.overs).toFixed(2)} ${PLOT_H} L ${xScale(first.overs).toFixed(2)} ${PLOT_H} Z`;
  };

  function valueAt(points: { overs: number; resource: number }[], overs: number) {
    if (overs <= 0) return points[0]?.resource ?? 0;
    if (overs >= points.length - 1) return points[points.length - 1]?.resource ?? 0;
    const lower = points[Math.floor(overs)];
    const upper = points[Math.ceil(overs)];
    if (!upper || lower.overs === upper.overs) return lower?.resource ?? 0;
    const t = overs - lower.overs;
    return lower.resource + t * (upper.resource - lower.resource);
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH - MARGIN.left;
    const overs = Math.max(0, Math.min(maxOversAxis, (x / PLOT_W) * maxOversAxis));
    setHoverOvers(overs);
  }

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resource remaining by overs used</h2>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full bg-[#2a78d6] dark:bg-[#3987e5]" />
            Team 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded-full bg-[#eb6834] dark:bg-[#d95926]" />
            Team 2
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Line chart of resource percentage remaining as overs are used, for Team 1 and Team 2"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverOvers(null)}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {gridLines.map((g) => (
            <g key={g}>
              <line
                x1={0}
                x2={PLOT_W}
                y1={yScale(g)}
                y2={yScale(g)}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
              />
              <text x={-8} y={yScale(g)} textAnchor="end" dominantBaseline="middle" className="fill-zinc-400 text-[10px]">
                {g}%
              </text>
            </g>
          ))}
          <line x1={0} x2={PLOT_W} y1={PLOT_H} y2={PLOT_H} className="stroke-zinc-300 dark:stroke-zinc-700" strokeWidth={1} />
          <text x={PLOT_W / 2} y={PLOT_H + 24} textAnchor="middle" className="fill-zinc-400 text-[10px]">
            Overs used
          </text>

          <path d={areaPath(team1Points)} fill="#2a78d6" fillOpacity={0.1} className="dark:fill-[#3987e5]" />
          <path d={areaPath(team2Points)} fill="#eb6834" fillOpacity={0.1} className="dark:fill-[#d95926]" />

          <path d={linePath(team1Points)} fill="none" stroke="#2a78d6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="dark:stroke-[#3987e5]" />
          <path d={linePath(team2Points)} fill="none" stroke="#eb6834" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" className="dark:stroke-[#d95926]" />

          {hoverOvers !== null && (
            <g>
              <line
                x1={xScale(hoverOvers)}
                x2={xScale(hoverOvers)}
                y1={0}
                y2={PLOT_H}
                className="stroke-zinc-300 dark:stroke-zinc-600"
                strokeWidth={1}
              />
              <circle
                cx={xScale(hoverOvers)}
                cy={yScale(valueAt(team1Points, hoverOvers))}
                r={4}
                fill="#2a78d6"
                stroke="var(--chart-surface, white)"
                strokeWidth={2}
                className="dark:fill-[#3987e5]"
              />
              <circle
                cx={xScale(hoverOvers)}
                cy={yScale(valueAt(team2Points, hoverOvers))}
                r={4}
                fill="#eb6834"
                stroke="var(--chart-surface, white)"
                strokeWidth={2}
                className="dark:fill-[#d95926]"
              />
            </g>
          )}
        </g>
      </svg>

      {hoverOvers !== null ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          At <span className="font-semibold tabular-nums">{hoverOvers.toFixed(1)}</span> overs used: Team 1 had{" "}
          <span className="font-semibold tabular-nums">{valueAt(team1Points, hoverOvers).toFixed(1)}%</span>, Team 2
          had <span className="font-semibold tabular-nums">{valueAt(team2Points, hoverOvers).toFixed(1)}%</span>{" "}
          resource remaining (both assuming no wickets lost, for shape comparison only).
        </p>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hover the chart to compare resource remaining at any point in the innings. Curves assume no wickets lost —
          they show how each side&apos;s overs allocation alone shapes the resources available.
        </p>
      )}
    </section>
  );
}
