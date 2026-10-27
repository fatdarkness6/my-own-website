import data from "../../../content/home.json" with { type: "json" };

export interface HomeCopySegment {
  text: string;
  interval?: number;
  accent?: boolean;
  glitch?: boolean;
}

type HomeCopy = {
  hero: { technologies: HomeCopySegment[]; tagline: HomeCopySegment[] };
} & Record<"about" | "projects" | "blog" | "resume" | "cta", { title: HomeCopySegment[] }>;

// Edit segments in content/home.json; visible overrides live in content/translations/.
export const homeCopy = Object.freeze(data satisfies HomeCopy);
