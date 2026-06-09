// Deterministic per-idea gradient theme, derived from the slug so each idea
// page looks distinct but stable across reloads. Shared by the idea page and
// the paywall so the lock screen matches the unlocked page.

export type IdeaTheme = {
  from: string;
  to: string;
  glow: string;
  chip: string;
  ink: string;
};

export const THEMES: IdeaTheme[] = [
  { from: "#7c3aed", to: "#db2777", glow: "rgba(124,58,237,0.45)", chip: "#f5d0fe", ink: "#4a044e" },
  { from: "#0ea5e9", to: "#2dd4bf", glow: "rgba(14,165,233,0.45)", chip: "#cffafe", ink: "#083344" },
  { from: "#f97316", to: "#ef4444", glow: "rgba(249,115,22,0.45)", chip: "#ffedd5", ink: "#7c2d12" },
  { from: "#22c55e", to: "#14b8a6", glow: "rgba(34,197,94,0.45)", chip: "#dcfce7", ink: "#14532d" },
  { from: "#6366f1", to: "#06b6d4", glow: "rgba(99,102,241,0.45)", chip: "#e0e7ff", ink: "#1e1b4b" },
  { from: "#eab308", to: "#f97316", glow: "rgba(234,179,8,0.45)", chip: "#fef9c3", ink: "#713f12" },
  { from: "#ec4899", to: "#8b5cf6", glow: "rgba(236,72,153,0.45)", chip: "#fce7f3", ink: "#500724" }
];

export function themeFor(slug: string): IdeaTheme {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return THEMES[h % THEMES.length];
}
