export type ProjectStatus = "live" | "wip" | "archived";

export interface ProjectScreenshot {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  mimeType?: "image/png" | "image/jpeg";
}

export interface Project {
  id: string;
  file: string;
  name: string;
  year?: string;
  role: string;
  status?: ProjectStatus;
  statusLabel?: string;
  summary: string;
  availability?: string;
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
      src: "/images/projects/arilvo.jpg",
      mimeType: "image/jpeg",
      width: 1270, height: 714,
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
    role: "FRONTEND / AI WORKSPACE",
    status: "live",
    statusLabel: "FRONTEND LIVE",
    summary:
      "Document intelligence frontend for summaries, Q&A and spreadsheet insights.",
    availability: "Frontend preview is live. The backend is not deployed, so API-powered features are unavailable online.",
    stack: ["NUXT", "VUE", "QUASAR", "TYPESCRIPT"],
    screenshot: {
      src: "/images/projects/docintel.jpg",
      mimeType: "image/jpeg",
      width: 1585, height: 892,
      alt: "DocIntel homepage with a purple document intelligence headline, AI summary and cited question-answer preview",
    },
    category: "ai",
    headline: "From documents to contextual answers.",
    description: "The frontend of an AI document intelligence platform, bringing document summaries, grounded question answering and spreadsheet insights into one workspace. The interface is deployed on Vercel; authentication and document processing depend on the separately published backend, which is not deployed yet.",
    ownership: "Frontend architecture & interface development",
    layers: [
      { label: "WORKSPACE", title: "Document interface", tools: "Nuxt / Vue / Quasar" },
      { label: "EXPERIENCE", title: "AI & document workflows", tools: "Summaries / Q&A / Spreadsheet insights" },
      { label: "DELIVERY", title: "Live frontend preview", tools: "Vercel / Backend not deployed" },
    ],
    contributions: [
      "Built the Nuxt and Quasar interface for the document intelligence platform.",
      "Designed document management and AI workflows around summaries, questions and spreadsheet insights.",
      "Created the product landing page and deployed the frontend preview on Vercel.",
    ],
    note: "Frontend and backend are separate project records. The live URL previews the interface, not a hosted AI service.",
    live: "https://docintel-frontend.vercel.app/",
    repo: "https://github.com/fatdarkness6/docintel-frontend",
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
      src: "/images/projects/arvand-termo-tec.jpg",
      mimeType: "image/jpeg",
      width: 1265, height: 712,
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
      src: "/images/projects/raymand-group.jpg",
      mimeType: "image/jpeg",
      width: 1265, height: 712,
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
  {
    id: "docintel-backend",
    file: "docintel_backend/",
    name: "DOCINTEL BACKEND",
    role: "BACKEND / AI API",
    statusLabel: "SOURCE AVAILABLE",
    summary: "FastAPI document intelligence API with cited RAG answers, spreadsheet analysis and SSE progress updates.",
    availability: "Public source code is available on GitHub. The backend API is not deployed.",
    stack: ["FASTAPI", "PYTHON", "POSTGRESQL", "PGVECTOR", "OPENAI", "SQLALCHEMY"],
    category: "ai",
    headline: "The processing engine behind the workspace.",
    description: "A user-scoped FastAPI backend for document intelligence. It processes PDF, DOCX, TXT, CSV and XLSX files, stores OpenAI embeddings in PostgreSQL with pgvector, and generates summaries and retrieval-grounded answers with source citations. Spreadsheet analytics, downloadable PDF reports and durable SSE processing events support the document workflow.",
    ownership: "Backend architecture & AI pipeline development",
    layers: [
      { label: "API", title: "Authenticated document services", tools: "FastAPI / JWT / Pydantic" },
      { label: "RETRIEVAL", title: "Embeddings & cited answers", tools: "OpenAI / PostgreSQL / pgvector" },
      { label: "PROCESSING", title: "Analysis, reports & progress", tools: "pandas / ReportLab / SSE" },
    ],
    contributions: [
      "Implemented JWT authentication and owner-scoped document, folder and tag APIs.",
      "Built upload validation, background text extraction, chunking and vector storage for supported document formats.",
      "Connected semantic retrieval to AI summaries and cited Q&A with follow-up question history.",
      "Added spreadsheet statistics, cached AI insights and downloadable PDF reports.",
      "Implemented database-backed status events and authenticated SSE streams for processing updates.",
    ],
    note: "Published source, not a live API. The current implementation uses FastAPI background tasks and local upload/report storage.",
    repo: "https://github.com/fatdarkness6/docIntel-backend",
  },
];
