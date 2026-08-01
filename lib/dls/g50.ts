export type G50PresetId = "full-member" | "lower-level" | "custom";

export const G50_PRESETS: { id: G50PresetId; label: string; value: number | null; description: string }[] = [
  {
    id: "full-member",
    label: "Full ODI (245)",
    value: 245,
    description: "Matches involving ICC full member nations, or between teams that play first-class cricket.",
  },
  {
    id: "lower-level",
    label: "Lower level (200)",
    value: 200,
    description: "Under-19, under-15, women's international matches, and matches between ICC associate nations.",
  },
  {
    id: "custom",
    label: "Custom",
    value: null,
    description: "Set your own average 50-over total for the competition.",
  },
];
