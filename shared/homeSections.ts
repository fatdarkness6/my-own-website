/** Stable identities keep navigation labels and the single background in sync. */
export const SCENE_IDS = { signal: 0, terminal: 1, rain: 2, circuit: 3, radar: 4, dispatch: 5 } as const;

export const HOME_SECTIONS = [
  { id: "hero", label: "Home", scene: "signal" },
  { id: "about", label: "About", scene: "terminal" },
  { id: "projects", label: "Projects", scene: "rain" },
  { id: "blog", label: "Blog", scene: "dispatch" },
  { id: "resume", label: "Resume", scene: "circuit" },
  { id: "cta", label: "Contact", scene: "radar" },
] as const;

export function homeSection(id: string) {
  return HOME_SECTIONS.find((section) => section.id === id);
}
