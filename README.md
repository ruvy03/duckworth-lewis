# Duckworth/Lewis Calculator

A web app for calculating revised targets and par scores in rain-interrupted
limited-overs cricket matches, implementing the **Duckworth/Lewis "Standard
Edition"** method — the same method the ICC's own playing regulations mandate
as the backup whenever the proprietary DLS software is unavailable.

Built to be correct first: every whole-over resource value is taken verbatim
from the official published table, and the calculation engine is unit-tested
against all six worked examples in the ICC's own methodology document.

## Features

- **Full target/par calculation** — R1/R2 resource percentages, the target
  score, and the par score for a curtailed match, all per the official D/L
  formula.
- **Multiple stoppages per innings** — model any number of interruptions in
  either team's innings, each revising the overs allocation or ending the
  innings outright, exactly like the ICC's own multi-stoppage examples.
- **Ball-level precision** — stoppages can occur mid-over (e.g. "2 overs and 5
  balls left"), not just on over boundaries.
- **Live par-score preview** — while Team 2 is still batting, see the target,
  the required run rate, and how far ahead/behind D/L par they are right now,
  without needing to declare an actual stoppage.
- **Configurable G50** — presets for full ODIs (245) and lower-level cricket
  (200), plus a custom value.
- **Automatic result wording** — "Team X win by N runs/wickets", ties, and
  curtailed-match results, all generated from the same formula.
- **Full worked solution** — an expandable, step-by-step breakdown of every
  resource calculation and the exact formula used, in the same style as the
  ICC's own examples.
- **Resource-remaining chart** — visualizes how each team's overs allocation
  shapes the resources available to it.
- **Input validation** — flags inconsistent stoppage timelines (wickets or
  overs going backwards, an allocation revised below overs already bowled,
  etc.) without blocking calculation.

## The maths

### Resource percentage

A team's ability to score more runs depends on two things: how many overs it
has left, and how many wickets it has in hand. Duckworth and Lewis called this
combined ability a team's **resource**, expressed as a percentage of the
resource available to a team facing a full, uninterrupted innings with all ten
wickets standing.

Every combination of overs left and wickets lost maps to a resource
percentage. Duckworth and Lewis published this mapping in full as a table (the
"Standard Edition") — see [Sources](#sources) below. This app uses that exact
table for every whole-over lookup ([`lib/dls/resourceTable.ts`](lib/dls/resourceTable.ts)).

When a stoppage happens mid-over, the two teams' resource loss is:

```
Resource lost = Resource(overs left, wickets) at the moment of the stoppage
              − Resource(overs left, wickets) at the moment play resumes
```

If a stoppage ends the innings outright, the resource remaining at that moment
is entirely lost (resume-resource is 0).

### The target formula

Let:

- **R1** — the total resource Team 1 had available for its innings (100%,
  minus anything lost to stoppages).
- **R2** — the same for Team 2 (this can differ from R1 if the two sides
  didn't get equal overs, or if Team 2's innings was also interrupted).
- **S** — Team 1's final score.
- **G50** — the average total score in an uninterrupted 50-over innings for
  this level of cricket (245 for full ODIs, 200 for lower levels).

Team 2's target **T** is then:

| Condition | Formula |
|---|---|
| R2 = R1 | `T = S + 1` |
| R2 < R1 | `T = ⌊S × R2 / R1⌋ + 1` |
| R2 > R1 | `T = S + ⌊(R2 − R1) × G50 / 100⌋ + 1` |

(`⌊x⌋` means "round down to a whole number" — the fraction is dropped
*before* the final `+1` is added.)

If the match can't be finished, the same three cases decide the result using
the **par score** — the identical formula without the final `+1` — compared
against Team 2's actual score at the moment of abandonment.

This is all implemented in [`lib/dls/engine.ts`](lib/dls/engine.ts), and
displayed live in the app's "How the calculation works" and "Show full
working" sections.

### Which edition, and how accurate is it?

Two editions of the D/L method exist:

- The **Standard Edition**, published in full by Frank Duckworth and Tony
  Lewis, including the resource table used above.
- The **Professional ("Stern") Edition**, used in international cricket
  today, which adjusts the tables using proprietary software licensed to the
  ICC. Its exact tables are commercial and have never been published, so no
  independent implementation — this one included — can reproduce it exactly.

The ICC's own playing regulations state that the Standard Edition **is** the
official method whenever the Professional Edition software is unavailable, so
this app implements that edition rather than approximating the confidential
one.

Within the Standard Edition, every **whole-over** resource value in this app
is transcribed verbatim from the official table and is exact. **Mid-over**
(ball-by-ball) values — needed only when a stoppage happens mid-over — are not
published in a form this project could obtain, so they're reconstructed by
fitting Duckworth & Lewis's own published exponential curve,
`Z(u, w) = Z0(w) × (1 − e^(−b(w)·u))`, to the exact whole-over table by
least-squares regression (see [`lib/dls/resourceTable.ts`](lib/dls/resourceTable.ts)
for the fitted constants and reasoning). This reproduces the ICC's own worked
mid-over examples to within about 0.1 percentage points of resource, which
could only very rarely shift a rounded target/par score by a single run.
**For a stoppage that lands exactly on an over boundary — the normal case —
this app's numbers are exact.**

## Sources

- [ICC — "The D/L (Duckworth/Lewis) method of adjusting target scores in
  interrupted one-day cricket matches"](https://images.icc-cricket.com/image/upload/prd/g9vlypi15msmrfnhucyx.pdf) —
  the official 2002 resource table.
- [ICC — "Duckworth-Lewis Methodology for Re-Calculating the Target Score in
  an Interrupted Match"](https://images.icc-cricket.com/image/upload/prd/orlbya4cqyhqaceje3b2.pdf) —
  the full method, definitions, and six worked examples this app's test suite
  is checked against.

## Development

```bash
pnpm install
pnpm dev          # start the dev server at http://localhost:3000
pnpm test         # run the calculation engine's test suite (vitest)
pnpm lint         # eslint
pnpm build        # production build
```

The calculation engine lives entirely under [`lib/dls/`](lib/dls/) and has no
dependency on React or Next.js — it's plain, unit-tested TypeScript. The UI
under [`components/dls/`](components/dls/) is a thin, purely client-side layer
on top of it (no backend, no data storage: everything runs in the browser).

### Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Vitest

## Disclaimer

This is an independent, unofficial implementation for educational and
personal use. It is not affiliated with the ICC, Frank Duckworth, or Tony
Lewis, and is not a substitute for the official DLS software in a sanctioned
match.
