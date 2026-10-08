import { aboutCopy } from "./about.ts";
import { projects } from "./projects.ts";

// Shared by the résumé page, its PDF generator and its Home download link.
export const resumeDocument = {
  href: "/resume/arsam-sarkhosh-resume.pdf",
  filename: "Arsam-Sarkhosh-Resume.pdf",
  pages: 2,
};

// Professional information transcribed from Arsam's supplied résumé.
// Birth year, marital status and references' private details are intentionally omitted.
export const resumeProfile = {
  name: aboutCopy.name,
  role: aboutCopy.role,
  location: "Iran",
  summary: "Software developer working on web products and business applications. My experience includes Vue/Nuxt interfaces, multilingual websites, backend APIs, CMS integrations and deployment, alongside Python/FastAPI document processing and AI-assisted retrieval in DocIntel.",
  skills: [
    { label: "Frontend", items: ["Vue", "Nuxt", "React", "Next.js", "Quasar", "Pinia", "TypeScript", "JavaScript", "HTML", "CSS", "GSAP"] },
    { label: "Backend & data", items: ["Node.js", "Express", "Python", "FastAPI", "REST APIs", "Authentication", "PostgreSQL", "SQLAlchemy", "Strapi"] },
    { label: "AI & delivery", items: ["RAG", "OpenAI", "Embeddings", "pgvector", "SEO", "Internationalization", "Deployment", "Production debugging"] },
  ],
  languages: [{ name: "English", level: "C1" }],
  education: {
    qualification: "Diploma in Mathematics & Physics",
    period: "Sep 2022 - Jan 2026",
    summary: "Combined formal education with self-directed software projects, focusing on web architecture, databases and modern JavaScript frameworks.",
  },
  courses: [
    { title: "Junior Front-End Developer", provider: "Coding Front", period: "Mar 2023 - Jun 2023" },
    { title: "Just React", provider: "Coding Front", period: "Dec 2023 - Feb 2024" },
  ],
  interests: ["Reading", "Coding side projects", "Web development", "Fitness"],
};

export const resumeExperience = [
  {
    id: "arilvo", company: "Arilvo", role: "Software Developer", location: "Italy", period: "Aug 2026 - Sep 2026",
    summary: "Frontend development and deployment for a multilingual MEP/BIM engineering company website.",
    bullets: [
      "Built the frontend from scratch, including reusable Nuxt and Quasar components, responsive UI, SEO, localization and deployment.",
      "Built reusable components and GSAP interactions, with Italian, English and German content and a foundation for future backend integration.",
    ],
    stack: ["Nuxt", "Vue", "Quasar", "TypeScript", "GSAP", "i18n"], projectId: "arilvo",
  },
  {
    id: "arvand-termo-tec", company: "Arvand Termo Tec", role: "Software Developer", location: "Italy", period: "Jul 2026 - Aug 2026",
    summary: "CMS integration, architecture cleanup and stability improvements for an existing business website.",
    bullets: [
      "Integrated Strapi into a Next.js application and refactored and reorganized 250+ files for maintainability.",
      "Built a responsive hero and resolved localization, routing, invalid URL and Swiper image-transition issues while removing unnecessary code.",
    ],
    stack: ["Next.js", "React", "Strapi"], projectId: "arvand-termo-tec",
  },
  {
    id: "raymand-group", company: "Raymand Group", role: "Web Developer", location: "Tehran, Iran", period: "Since Jun 2025",
    summary: "Design, development and deployment of a multilingual corporate website for a healthcare and laboratory technology group.",
    bullets: [
      "Designed and developed responsive Nuxt, Vue, TypeScript and Quasar interfaces for the company website.",
      "Structured the website content, implemented Persian, English and German versions and handled deployment.",
    ],
    stack: ["Nuxt", "Vue", "TypeScript", "Quasar"], projectId: "raymand-group",
  },
  {
    id: "gruppodanesh", company: "Gruppodanesh", role: "Front-End Developer", location: "Venice, Italy", period: "Jul 2024 - Nov 2025",
    summary: "React company website with SPA behavior and performance improvements.",
    bullets: [
      "Developed the company's React website and implemented SPA features for a smoother user experience.",
      "Built visit-tracking features to give the client insight into website usage and opportunities for improvement.",
    ],
    stack: ["React", "JavaScript", "SPA"],
  },
  {
    id: "pouya-salamat-fartak", company: "Pouya Salamat Fartak", role: "Front-End Developer", location: "Tehran, Iran", period: "Sep 2024 - Aug 2025",
    summary: "Nuxt SaaS development within a nine-person team, including four frontend developers.",
    bullets: [
      "Worked as one of four frontend developers in a nine-person team preparing a Nuxt SaaS application.",
      "Integrated REST APIs and implemented structured forms for creating, retrieving, editing and deleting records.",
    ],
    stack: ["Nuxt", "REST APIs", "Forms"],
  },
  {
    id: "miarze", company: "Miarze", role: "Front-End Developer", location: "Tehran, Iran", period: "Dec 2024 - May 2025",
    summary: "Frontend improvements for a home-goods import and export business.",
    bullets: [
      "Improved the user interface and responsive behavior across devices.",
      "Built adaptive Nuxt navigation for large menus and an interface connected to AI-based product rating.",
    ],
    stack: ["Nuxt", "Responsive UI", "API integration"],
  },
];

// Existing projects stay canonical; these records only describe additional résumé work.
interface ResumeProject {
  id: string;
  name: string;
  summary: string;
  href?: string;
  projectId?: string;
}
export const resumeProjects: ResumeProject[] = [
  ...projects.map(({ id, name, summary, availability, live, repo }) => ({
    id, name, summary: availability ? `${summary} ${availability}` : summary, href: live ?? repo, projectId: id,
  })),
  { id: "miarze", name: "Miarze", summary: "Adaptive Nuxt navigation and an AI-connected product-rating interface.", href: "https://miarze.com" },
  { id: "gruppodanesh", name: "Gruppodanesh", summary: "React company website with SPA behavior and visit-tracking features.", href: "https://www.gruppodanesh.it/" },
  { id: "hugo-australia", name: "Hugo Australia", summary: "Nuxt 3, Quasar and TypeScript SaaS forms with CRUD API integration, feedback and reviews.", href: "https://hugoaustralia.com.au" },
  { id: "strubuono", name: "Strubuono", summary: "Personal SaaS that turns user prompts into AI-generated website design data, with feedback collection.", href: "https://strubuono.vercel.app" },
  { id: "raymand-backend", name: "Raymand Backend", summary: "A separate backend repository with APIs, authorization and database structure.", href: "https://github.com/fatdarkness6/raymand-backend" },
  { id: "arsams-quiz", name: "Arsam's Quiz", summary: "Responsive Vue and Pinia quiz app with API questions, validation and localStorage history.", href: "https://arsamsquiz.netlify.app" },
  { id: "coincap", name: "CoinCap", summary: "React application that fetches and displays live cryptocurrency prices.", href: "https://arsamscoin.netlify.app/" },
];

export const resumeSections = [
  { id: "experience", number: "01", title: "Experience", detail: "Web apps & systems" },
  { id: "skills", number: "02", title: "Technical skills", detail: "Tools & technologies" },
  { id: "work", number: "03", title: "Selected work", detail: "Projects & contributions" },
];

// References to the canonical project records, not a second project catalog.
export const resumeFocus = [
  { id: "all", label: "All experience", icon: "apps", projects: [] },
  { id: "web", label: "Web platforms", icon: "web", projects: ["arilvo", "arvand-termo-tec", "raymand-group"] },
  { id: "ai", label: "Applied AI", icon: "psychology", projects: ["docintel"] },
];
