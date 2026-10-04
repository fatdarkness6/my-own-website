export type ProjectStatus = "live" | "wip" | "archived";

export interface ProjectScreenshot {
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  file: string;
  name: string;
  year?: string;
  role: string;
  status?: ProjectStatus;
  summary: string;
  stack: string[];
  screenshot?: ProjectScreenshot;
  category: "web" | "ai";
  headline: string;
  description: string;
  ownership: string;
  layers: { label: string; title: string; tools: string }[];
  contributions: string[];
  note: string;
  live?: string;
  repo?: string;
}

// Shared fallback for projects that do not have a screenshot yet.
export const projectPlaceholder: ProjectScreenshot = {
  src: "/images/projects/project-preview.svg",
  alt: "Project cover — screenshot coming soon",
};

// One record per project: both Home and /projects read from this collection.

export const projects: Project[] = [
  {
    id: "arilvo",
    file: "arilvo/",
    name: "ARILVO",
    year: "2026",
    role: "FULL-STACK / WEB PLATFORM",
    status: "live",
    summary:
      "Multilingual MEP/BIM platform I built with Nuxt SSR and SEO.",
    stack: ["NUXT", "QUASAR", "TYPESCRIPT", "GSAP", "I18N"],
    screenshot: {
      src: "/images/projects/arilvo.png",
      alt: "ARILVO homepage featuring MEP engineering services and a building systems cutaway",
    },
    category: "web",
    headline: "Engineering a multilingual presence.",
    description: "A business platform for MEP and BIM services in European markets. Built from the ground up, connecting a custom visual identity with server-rendered content and three languages.",
    ownership: "End-to-end development",
    layers: [
      { label: "EXPERIENCE", title: "Custom interface", tools: "Vue / Quasar / GSAP" },
      { label: "APPLICATION", title: "Server rendering", tools: "Nuxt / TypeScript" },
      { label: "CONTENT", title: "Three languages", tools: "Italian / English / German" },
    ],
    contributions: [
      "Defined the application architecture and implemented the UI/UX with reusable components.",
      "Built responsive layouts and custom animations across the platform.",
      "Handled localization, SEO and deployment.",
    ],
    note: "Structured for future backend and dynamic content integration.",
    live: "https://arilvo.com",
  },
  {
    id: "docintel",
    file: "docintel/",
    name: "DOCINTEL",
    role: "AI / FULL-STACK",
    summary:
      "AI document platform with FastAPI, pgvector and semantic Q&A.",
    stack: ["NUXT", "FASTAPI", "PGVECTOR", "POSTGRESQL"],
    category: "ai",
    headline: "From documents to contextual answers.",
    description: "An AI document intelligence platform that turns uploaded content into searchable knowledge. A full-stack application connecting document processing, embeddings and retrieval-augmented answers.",
    ownership: "Full-stack application development",
    layers: [
      { label: "WORKSPACE", title: "Document interface", tools: "Nuxt / Vue / Quasar" },
      { label: "PROCESSING", title: "API & extraction", tools: "FastAPI / Python" },
      { label: "RETRIEVAL", title: "Semantic search", tools: "PostgreSQL / pgvector" },
    ],
    contributions: [
      "Built authentication, document management and an organized workspace with folders, tags and search.",
      "Connected text extraction and chunking to embeddings and vector storage.",
      "Implemented summarization and document Q&A with context from previous questions.",
    ],
    note: "Applied AI engineering: integrating retrieval and language models into a usable product.",
  },
  {
    id: "arvand-termo-tec",
    live: "https://arvandtermotec.com",
    status: "live",
    file: "arvand_termo_tec/",
    name: "ARVAND TERMO TEC",
    role: "WEB PLATFORM / CMS",
    summary:
      "HVAC site work across Strapi CMS, refactoring and localization.",
    stack: ["NEXT.JS", "STRAPI", "POSTGRESQL"],
    screenshot: {
      src: "/images/projects/arvand-termo-tec.png",
      alt: "Arvand Termo Tec homepage with blue and orange styling and a modern home",
    },
    category: "web",
    headline: "Reworking the system behind the service.",
    description: "An HVAC and services website for Northern Italy. Work on an existing codebase focused on making its interface, content infrastructure and multilingual experience more maintainable.",
    ownership: "Contribution to an existing platform",
    layers: [
      { label: "INTERFACE", title: "Responsive website", tools: "Next.js / React" },
      { label: "CONTENT", title: "CMS integration", tools: "Strapi" },
      { label: "STORAGE", title: "Content database", tools: "PostgreSQL" },
    ],
    contributions: [
      "Integrated and configured Strapi alongside the content database.",
      "Refactored existing components and removed unused code to simplify the architecture.",
      "Improved responsive layouts, localization, navigation and image handling; debugged stability issues.",
    ],
    note: "Existing project, focused contribution — not presented as a ground-up build.",
  },
  {
    id: "raymand-group",
    live: "https://raimandgroup.com/en",
    status: "live",
    file: "raymand_group/",
    name: "RAYMAND GROUP",
    role: "FULL-STACK",
    summary:
      "Business website built with Nuxt, Node.js and MongoDB.",
    stack: ["NUXT", "NODE.JS", "MONGODB"],
    screenshot: {
      src: "/images/projects/raymand-group.png",
      alt: "Raymand Group homepage showing healthcare and laboratory technology services",
    },
    category: "web",
    headline: "Connecting the interface to the business.",
    description: "A business website built across the frontend and backend, bringing a Nuxt interface together with a Node.js application layer and MongoDB storage.",
    ownership: "Frontend & backend implementation",
    layers: [
      { label: "INTERFACE", title: "Business website", tools: "Nuxt / Vue" },
      { label: "APPLICATION", title: "Backend services", tools: "Node.js" },
      { label: "STORAGE", title: "Application data", tools: "MongoDB" },
    ],
    contributions: [
      "Implemented the website frontend with Nuxt and Vue.",
      "Connected the interface to backend services and application data.",
      "Worked across implementation, integration and delivery of the business website.",
    ],
    note: "A connected full-stack implementation, from the visible interface to its data layer.",
  },
];
