import { aboutCopy } from "./about";
import type { HomeCopySegment } from "./homeCopy";

export interface AboutChapterContent {
  id: string;
  number: string;
  label: string;
  title: string;
}

interface EngineeringRecord {
  id: string;
  tag: string;
  title: string;
  summary: string;
  detail: string;
}

interface Capability {
  code: string;
  title: string;
  icon: string;
  skills: string[];
}

interface ToolkitNode {
  id: string;
  name: string;
  layer: string;
  icon: string;
  title: string;
  text: string;
  evidence: string;
  tags: string[];
}

interface SelectedSystem {
  id: string;
  mode: string;
  role: string;
  context: string;
  work: string[];
  stack: string[];
  note: string;
}

// About-only positioning. Resume continues to use the shared aboutCopy data.
export const aboutPageCopy = {
  name: aboutCopy.name,
  role: aboutCopy.role,
  label: "// SOFTWARE DEVELOPMENT / VUE · NUXT · NODE.JS · PYTHON",
  title: [
    { text: "WEB DEVELOPMENT, ", glitch: false },
    { text: "FROM FRONTEND TO BACKEND.", accent: true, interval: 7400 },
  ] satisfies HomeCopySegment[],
  intro: "Software developer working with Vue, Nuxt, Node.js and Python.",
  summary: "My work spans business websites, multilingual interfaces, APIs, databases and CMS integrations. With DocIntel, I also work on Python/FastAPI services, document processing and AI-assisted retrieval.",
  chapters: {
    profile: { id: "profile", number: "01", label: "Professional profile", title: "MY BACKGROUND." },
    capabilities: { id: "capabilities", number: "02", label: "Capabilities", title: "WHAT I CAN OWN." },
    method: { id: "method", number: "03", label: "How I engineer", title: "CLEAN UNDERNEATH. BUILT TO WORK." },
    toolkit: { id: "toolkit", number: "04", label: "Toolkit", title: "CONNECTED BY DESIGN." },
    systems: { id: "systems", number: "05", label: "Selected systems", title: "BUILT IN PRACTICE." },
  } satisfies Record<string, AboutChapterContent>,
  profile: [
    { id: "frontend", tag: "VUE / NUXT / TYPESCRIPT", title: "Frontend development", summary: "Responsive, component-driven applications with SSR, localization and complex interfaces.", detail: "Reusable components and Composition API logic, state handling with Pinia, Quasar interfaces and custom interaction—structured to keep features maintainable." },
    { id: "backend", tag: "NODE.JS / FASTAPI / REST APIs", title: "Backend systems", summary: "Services, authentication, application logic and API integrations.", detail: "Node.js and Python/FastAPI service layers that connect interfaces to business logic, external APIs and application data." },
    { id: "data-ai", tag: "POSTGRESQL / SQLALCHEMY / PGVECTOR / LLM", title: "Data & AI", summary: "Document processing, relational data, embeddings and semantic retrieval.", detail: "In DocIntel, I implement document upload and extraction, chunking, embeddings, retrieval, summaries and question answering with source references." },
    { id: "ownership", tag: "STRUCTURE → DEVELOPMENT → DEPLOYMENT", title: "Development & delivery", summary: "Work across interface structure, API integration, debugging and deployment.", detail: "I built Arilvo's frontend from scratch and contributed refactoring, CMS integration and interface fixes to the existing Arvand Termo Tec application." },
  ] satisfies EngineeringRecord[],
  capabilities: [
    { code: "01", title: "Frontend systems", icon: "widgets", skills: ["Vue 3 / Nuxt", "TypeScript / Quasar", "Responsive UI / SSR", "Component architecture"] },
    { code: "02", title: "Backend & APIs", icon: "dns", skills: ["Node.js / Express / FastAPI", "REST APIs", "Authentication / integrations", "Business logic"] },
    { code: "03", title: "Data", icon: "storage", skills: ["PostgreSQL / SQLAlchemy", "pgvector", "Schema work / migrations", "Data modeling"] },
    { code: "04", title: "AI applications", icon: "psychology", skills: ["LLM integrations / embeddings", "Semantic / vector search", "RAG-style retrieval", "Document intelligence"] },
    { code: "05", title: "Product engineering", icon: "account_tree", skills: ["Architecture / refactoring", "Debugging / performance", "Localization", "Production delivery"] },
    { code: "06", title: "Interactive web", icon: "view_in_ar", skills: ["Three.js / GSAP", "CSS / SCSS", "Animation systems", "Custom interaction"] },
  ] satisfies Capability[],
  principles: [
    { number: "01", code: "structure", title: "Clean underneath.", text: "Reusable components, clear data flow and separated responsibilities keep features understandable and maintainable as a product grows.", icon: "account_tree" },
    { number: "02", code: "performance", title: "Performance is part of the build.", text: "I consider rendering cost, network requests, SSR behavior, bundle weight and mobile performance while building—especially in animation-heavy interfaces.", icon: "bolt" },
    { number: "03", code: "debugging", title: "Debug the system, not the symptom.", text: "I trace problems across frontend, API, database and integration layers in existing codebases, then fix the underlying cause.", icon: "troubleshoot" },
    { number: "04", code: "usability", title: "Details with purpose.", text: "Animation, typography, responsiveness and interaction should support usability. UI polish matters when it helps people use the product.", icon: "tune" },
  ],
  tools: [
    { id: "vue-nuxt", name: "Vue / Nuxt", layer: "FRONTEND", icon: "widgets", title: "Component-driven applications.", text: "Vue for Composition API interfaces, reusable logic, state handling and complex responsive interaction. Nuxt for SSR, routing, multilingual applications and API-driven pages.", evidence: "Production web applications, including Arilvo's Italian, English and German experiences; SEO-sensitive pages and reusable application architecture.", tags: ["Vue.js", "Nuxt.js", "TypeScript", "JavaScript", "Quasar", "Pinia"] },
    { id: "backend", name: "Node / FastAPI", layer: "BACKEND", icon: "dns", title: "Services behind the interface.", text: "Node.js and Express for REST APIs and integrations; Python and FastAPI for document processing, authentication and AI-assisted application features.", evidence: "DocIntel's backend handles authentication, document processing and retrieval through REST APIs.", tags: ["Node.js", "Express", "Python", "FastAPI", "REST APIs", "Authentication"] },
    { id: "data", name: "PostgreSQL / SQLAlchemy", layer: "DATA", icon: "storage", title: "Application data, structured.", text: "PostgreSQL and SQLAlchemy for storing and querying application data; pgvector for document embeddings and semantic search.", evidence: "DocIntel stores documents and embeddings in PostgreSQL and uses pgvector to retrieve relevant source passages.", tags: ["PostgreSQL", "SQLAlchemy", "Data modeling", "Migrations"] },
    { id: "retrieval", name: "pgvector / AI", layer: "AI APPLICATIONS", icon: "psychology", title: "Retrieval inside the product.", text: "pgvector for storing embeddings and semantic/vector retrieval. LLM integrations connect retrieved document context to summaries and Q&A in RAG-style workflows.", evidence: "DocIntel is an in-development document-intelligence platform. My work is on application APIs and retrieval workflows, not training models.", tags: ["pgvector", "Embeddings", "Vector search", "RAG", "LLM integration"] },
    { id: "creative", name: "Three.js / GSAP", layer: "INTERACTIVE UI", icon: "view_in_ar", title: "Interaction beyond standard UI.", text: "Three.js when a product needs interactive 3D or visual experiences. GSAP and CSS/SCSS for animation systems and custom interaction that remain responsive and readable.", evidence: "This portfolio is an experimental frontend project with Three.js, animated interfaces and performance work. Arilvo uses custom GSAP interactions.", tags: ["Three.js", "GSAP", "SCSS / CSS", "Responsive UI"] },
    { id: "platform", name: "Platform / delivery", layer: "ENGINEERING", icon: "account_tree", title: "Connect, maintain, deliver.", text: "SSR, localization and CMS integration alongside Git-based development, refactoring, debugging and deployment.", evidence: "Strapi integration and existing-system improvements in Arvand Termo Tec; architecture, i18n, SEO and deployment in Arilvo.", tags: ["SSR", "REST APIs", "Strapi", "i18n", "Git", "Deployment"] },
  ] satisfies ToolkitNode[],
  systems: [
    {
      id: "arilvo", mode: "GREENFIELD / SHIPPED", role: "Frontend development",
      context: "Built the frontend of a multilingual website for an MEP/BIM engineering company from scratch.",
      work: ["Frontend structure, reusable components and responsive interfaces", "Nuxt SSR, localization, SEO and deployment", "Custom animation; Italian, English and German experiences"],
      stack: ["Nuxt", "Vue", "Quasar", "TypeScript", "GSAP"],
      note: "Frontend implementation through deployment, prepared for future backend integration.",
    },
    {
      id: "docintel", mode: "FRONTEND LIVE / BACKEND SOURCE AVAILABLE", role: "Application development",
      context: "An AI-assisted document intelligence platform with a live frontend preview and an open-source backend that is not deployed yet.",
      work: ["Authentication, document upload, processing and text extraction", "Chunking, embeddings and vector storage/retrieval", "Summarization, contextual Q&A and API architecture"],
      stack: ["Nuxt", "Quasar", "FastAPI", "PostgreSQL", "pgvector"],
      note: "Work across the document pipeline, backend APIs and application UI.",
    },
    {
      id: "arvand-termo-tec", mode: "EXISTING SYSTEM / IMPROVED", role: "Development / refactoring / integration",
      context: "Refactoring and integration work on an existing HVAC business website and its CMS infrastructure.",
      work: ["Strapi/CMS integration and architecture cleanup", "Refactored and reorganized 250+ files", "Localization, Swiper/image fixes, responsive UI and stability debugging"],
      stack: ["Next.js", "React", "Strapi", "PostgreSQL"],
      note: "Focused on maintainability, performance and stability in an existing codebase.",
    },
  ] satisfies SelectedSystem[],
};
