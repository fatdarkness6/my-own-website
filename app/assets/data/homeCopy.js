// Edit animated homepage headings here. Each segment is rendered and typed
// from this single source, so text never needs to be duplicated in templates.
export const homeCopy = Object.freeze({
  hero: {
    tagline: [
      { text: "Vue", interval: 6000 },
      { text: " • ", accent: true, glitch: false },
      { text: "Nuxt", accent: true, interval: 5500 },
      { text: " • ", accent: true, glitch: false },
      { text: "Nodejs", interval: 6500 },
      { text: " ", glitch: false },
      { text: "Crafting", accent: true, interval: 5000 },
      { text: " ", glitch: false },
      { text: "Interactive Experiences.", interval: 7000 },
    ],
  },
  about: {
    title: [
      {
        text: "ARCHITECTING HIGH-SPEED WEB SOLUTIONS WITH CLEAN CODE",
        interval: 5000,
      },
      { text: " ", glitch: false },
      { text: "& MODERN TECH.", accent: true, interval: 6200 },
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
});
