import { aboutCopy } from "./about.ts";
import { projects } from "./projects.ts";

// Shared by the résumé page, its PDF generator and its Home download link.
export const resumeDocument = {
  href: "/resume/arsam-sarkhosh-resume.pdf",
  filename: "Arsam-Sarkhosh-Resume.pdf",
  pages: 2,
};

// Professional information from Arsam's résumé and supplied LinkedIn experience screenshot.
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
    id: "arvand-termo-tec", company: "Arvand Termo Tec", role: "Full Stack Developer", location: "Italy", period: "Jul 2026 - Present",
    employmentType: "Part-time", workMode: "Remote",
    summary: "Development, CMS integration and maintainability improvements for a multilingual Next.js and Strapi platform.",
    bullets: [
      "Configured Strapi CMS and refactored 250+ frontend files, removing duplicated code and improving maintainability.",
      "Built responsive sections and fixed localization, navigation, Swiper and image issues across languages.",
    ],
    stack: ["Next.js", "React", "Strapi", "JavaScript", "Node.js"], projectId: "arvand-termo-tec",
  },
  {
    id: "arilvo", company: "Arilvo", role: "Frontend Developer", location: "Italy", period: "Jul 2026 - Present",
    employmentType: "Part-time", workMode: "Remote",
    summary: "Frontend ownership for a multilingual web platform, from architecture and responsive UI to SEO and deployment.",
    bullets: [
      "Built the Nuxt/Vue frontend from scratch with reusable Quasar components, GSAP interactions and Italian, English and German localization.",
      "Optimized frontend performance, managed production deployment and prepared the architecture for future backend and dynamic-content integration.",
    ],
    stack: ["Nuxt", "Vue", "Quasar", "TypeScript", "GSAP", "i18n"], projectId: "arilvo",
  },
  {
    id: "raymand-group", company: "Raymand Group", role: "Full Stack Developer", location: "Tehran, Iran", period: "Jun 2025 - Aug 2026",
    employmentType: "Full-time", workMode: "Hybrid",
    summary: "Developed and maintained a multilingual corporate website for a group of medical equipment companies.",
    bullets: [
      "Built responsive Nuxt/Vue interfaces with SSR, a headless CMS and i18n for dynamic multilingual content.",
      "Collaborated on API and authentication integration, localization and deployment; improved performance and cross-browser compatibility.",
    ],
    stack: ["Nuxt", "Vue", "SSR", "Headless CMS", "i18n", "API integration"], projectId: "raymand-group",
  },
  {
    id: "gruppodanesh", company: "Gruppodanesh", role: "Frontend Developer", location: "Italy", period: "Jun 2024 - Nov 2025",
    employmentType: "Full-time", workMode: "Remote",
    summary: "End-to-end development and ongoing improvement of a React single-page application.",
    bullets: [
      "Owned the website's architecture and implementation, maintaining a clean and scalable React codebase.",
      "Built custom traffic and engagement analytics; improved performance, responsiveness and user experience.",
    ],
    stack: ["React", "JavaScript", "SPA"],
  },
  {
    id: "ability-tech-australia", company: "Ability Tech Australia", role: "Frontend Developer", location: "Australia", period: "Dec 2024 - Mar 2025",
    employmentType: "Part-time", workMode: "Remote",
    summary: "Frontend development for a home-services management SaaS platform.",
    bullets: [
      "Integrated backend APIs into Nuxt 3, Quasar and TypeScript interfaces for creating, retrieving, updating and deleting records.",
      "Built structured data-management forms, customer feedback and review workflows with a responsive, maintainable interface.",
    ],
    stack: ["Nuxt 3", "Quasar", "TypeScript", "REST APIs"],
  },
  {
    id: "miarze", company: "Miarze", role: "Frontend Developer", location: "Tehran, Iran", period: "Nov 2024 - Mar 2025",
    employmentType: "Part-time",
    summary: "Responsive Nuxt navigation and an AI-powered product-evaluation interface.",
    bullets: [
      "Built a dynamic Nuxt 2 menu that adapts item heights to the available viewport, keeping navigation accessible.",
      "Integrated an external AI service for product evaluation, with responsive interfaces and efficient API-driven data presentation.",
    ],
    stack: ["Nuxt 2", "Vue", "API integration", "Responsive UI"],
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
