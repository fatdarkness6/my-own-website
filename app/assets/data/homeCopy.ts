export interface HomeCopySegment {
  text: string;
  interval?: number;
  accent?: boolean;
  glitch?: boolean;
}

type HomeCopy = {
  hero: { technologies: HomeCopySegment[]; tagline: HomeCopySegment[] };
} & Record<"about" | "projects" | "resume" | "cta", { title: HomeCopySegment[] }>;

// Shared animation segments and stable source copy. Visible copy is edited in
// i18n/locales/{code}.ts; technology names remain untranslated.
export const homeCopy = Object.freeze({
  hero: {
    technologies: [
      { text: "Vue", interval: 6000 },
      { text: " • ", accent: true, glitch: false },
      { text: "Nuxt", accent: true, interval: 5500 },
      { text: " • ", accent: true, glitch: false },
      { text: "Node.js", interval: 6500 },
    ],
    tagline: [
      { text: "Crafting", accent: true, interval: 5000 },
      { text: " ", glitch: false },
      { text: "Interactive Experiences.", interval: 7000 },
    ],
  },
  about: {
    title: [
      {
        text: "WEB APPLICATIONS",
        interval: 5000,
      },
      { text: " ", glitch: false },
      { text: "& BACKEND SYSTEMS.", accent: true, interval: 6200 },
    ],
  },
  projects: {
    title: [
      { text: "DEPLOYED PAYLOADS", interval: 5000 },
      { text: " ", glitch: false },
      { text: "& SHIPPED SYSTEMS.", accent: true, interval: 6200 },
    ],
  },
  resume: {
    title: [
      { text: "THE EXPERIENCE", interval: 5000 },
      { text: " ", glitch: false },
      { text: "BEHIND THE CODE.", accent: true, interval: 6200 },
    ],
  },
  cta: {
    title: [
      { text: "GOT A MISSION?", interval: 5000 },
      { text: " ", glitch: false },
      { text: "LET'S BUILD IT.", accent: true, interval: 6200 },
    ],
  },
} satisfies HomeCopy);
