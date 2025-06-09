export const AllThemes = ["Light", "Dark", "System", "Ocean", "Neon"] as const;

export type Theme = (typeof AllThemes)[number];

const themeClassAttributeMap: ReThreeCord<Theme, string> = {
  Light: "light",
  Dark: "dark",
  System: "dark",
  Ocean: "custom-ocean",
  Neon: "custom-neon",
};

export function getThemeClassAttribute(theme: Theme): string {
  return themeClassAttributeMap[theme];
}
