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
  label: "// FULL-STACK ENGINEERING / VUE · NUXT · NODE.JS · PYTHON",
  title: [
    { text: "I BUILD THE SYSTEM, ", glitch: false },
    { text: "NOT JUST THE SCREEN.", accent: true, interval: 7400 },
  ] satisfies HomeCopySegment[],
  intro: "Full-stack engineer specializing in Vue, Nuxt, Node.js and Python.",
  summary: "I build production web applications—from responsive interfaces and backend APIs to databases, integrations and AI-powered features.",
  chapters: {
    profile: { id: "profile", number: "01", label: "Engineering profile", title: "FULL-STACK BY PRACTICE." },
    capabilities: { id: "capabilities", number: "02", label: "Capabilities", title: "WHAT I CAN OWN." },
    method: { id: "method", number: "03", label: "How I engineer", title: "CLEAN UNDERNEATH. BUILT TO WORK." },
    toolkit: { id: "toolkit", number: "04", label: "Toolkit", title: "CONNECTED BY DESIGN." },
    systems: { id: "systems", number: "05", label: "Selected systems", title: "BUILT IN PRACTICE." },
  } satisfies Record<string, AboutChapterContent>,
  profile: [
    { id: "frontend", tag: "VUE / NUXT / TYPESCRIPT", title: "Frontend engineering", summary: "Responsive, component-driven applications with SSR, localization and complex interfaces.", detail: "Reusable components and Composition API logic, state handling with Pinia, Quasar interfaces and custom interaction—structured to keep features maintainable." },
    { id: "backend", tag: "NODE.JS / FASTAPI / REST APIs", title: "Backend systems", summary: "Services, authentication, application logic and API integrations.", detail: "Node.js and Python/FastAPI service layers that connect interfaces to business logic, external APIs and application data." },
    { id: "data-ai", tag: "POSTGRESQL / MONGODB / PGVECTOR / LLM", title: "Data & AI", summary: "Relational and document databases, embeddings, vector retrieval and document processing.", detail: "AI-enabled application features built around useful workflows: document intelligence, semantic search, summarization and contextual Q&A. Product engineering, not model research." },
    { id: "ownership", tag: "ARCHITECTURE → DEVELOPMENT → DEPLOYMENT", title: "Product ownership", summary: "Work across architecture, UI, backend integration, debugging and production delivery.", detail: "I can build from zero or enter an existing codebase, trace how its layers connect, refactor its structure and improve performance and stability." },
  ] satisfies EngineeringRecord[],
  capabilities: [
    { code: "01", title: "Frontend systems", icon: "widgets", skills: ["Vue 3 / Nuxt", "TypeScript / Quasar", "Responsive UI / SSR", "Component architecture"] },
    { code: "02", title: "Backend & APIs", icon: "dns", skills: ["Node.js / FastAPI", "REST APIs", "Authentication / integrations", "Business logic"] },
    { code: "03", title: "Data", icon: "storage", skills: ["PostgreSQL / MongoDB", "pgvector", "Schema work / migrations", "Data modeling"] },
    { code: "04", title: "AI applications", icon: "psychology", skills: ["LLM integrations / embeddings", "Semantic / vector search", "RAG-style retrieval", "Document intelligence"] },
    { code: "05", title: "Product engineering", icon: "account_tree", skills: ["Architecture / refactoring", "Debugging / performance", "Localization", "Production delivery"] },
    { code: "06", title: "Interactive web", icon: "view_in_ar", skills: ["Three.js / GSAP", "Advanced CSS / SCSS", "Animation systems", "Custom interaction"] },
  ] satisfies Capability[],
  principles: [
    { number: "01", code: "structure", title: "Clean underneath.", text: "Reusable components, clear data flow and separated responsibilities keep features understandable and maintainable as a product grows.", icon: "account_tree" },
    { number: "02", code: "performance", title: "Performance is part of the build.", text: "I consider rendering cost, network requests, SSR behavior, bundle weight and mobile performance while building—especially in animation-heavy interfaces.", icon: "bolt" },
    { number: "03", code: "debugging", title: "Debug the system, not the symptom.", text: "I trace problems across frontend, API, database and integration layers in existing codebases, then fix the underlying cause.", icon: "troubleshoot" },
    { number: "04", code: "usability", title: "Details with purpose.", text: "Animation, typography, responsiveness and interaction should support usability. UI polish matters when it helps people use the product.", icon: "tune" },
  ],
  tools: [
    { id: "vue-nuxt", name: "Vue / Nuxt", layer: "FRONTEND", icon: "widgets", title: "Component-driven applications.", text: "Vue for Composition API interfaces, reusable logic, state handling and complex responsive interaction. Nuxt for SSR, routing, multilingual applications and API-driven pages.", evidence: "Production web applications, including Arilvo's Italian, English and German experiences; SEO-sensitive pages and reusable application architecture.", tags: ["Vue.js", "Nuxt.js", "TypeScript", "JavaScript", "Quasar", "Pinia"] },
    { id: "backend", name: "Node / FastAPI", layer: "BACKEND", icon: "dns", title: "Services behind the interface.", text: "Node.js for REST APIs, business logic, integrations and authentication. Python/FastAPI for document-processing workflows and AI-enabled application APIs.", evidence: "Backend services in Raymand Group and full-stack document workflows in DocIntel.", tags: ["Node.js", "Python", "FastAPI", "REST APIs", "Authentication"] },
    { id: "data", name: "Postgres / Mongo", layer: "DATA", icon: "storage", title: "Application data, structured.", text: "PostgreSQL for relational data, schemas, migrations and persistence. MongoDB for document-oriented application data.", evidence: "PostgreSQL in DocIntel and CMS-backed systems; MongoDB in Raymand Group.", tags: ["PostgreSQL", "MongoDB", "Data modeling", "Migrations"] },
    { id: "retrieval", name: "pgvector / AI", layer: "AI APPLICATIONS", icon: "psychology", title: "Retrieval inside the product.", text: "pgvector for storing embeddings and semantic/vector retrieval. LLM integrations connect retrieved document context to summaries and Q&A in RAG-style workflows.", evidence: "DocIntel is an in-development document-intelligence platform. My work is on application APIs and retrieval workflows, not training models.", tags: ["pgvector", "Embeddings", "Vector search", "RAG", "LLM integration"] },
    { id: "creative", name: "Three.js / GSAP", layer: "INTERACTIVE UI", icon: "view_in_ar", title: "Interaction beyond standard UI.", text: "Three.js when a product needs interactive 3D or visual experiences. GSAP and CSS/SCSS for animation systems and custom interaction that remain responsive and readable.", evidence: "Custom animation and responsive UI in Arilvo, with attention to rendering cost and mobile behavior.", tags: ["Three.js", "GSAP", "SCSS / CSS", "Responsive UI"] },
    { id: "platform", name: "Platform / delivery", layer: "ENGINEERING", icon: "account_tree", title: "Connect, maintain, deliver.", text: "SSR, localization and CMS integration alongside Git-based development, refactoring, debugging and deployment.", evidence: "Strapi integration and existing-system improvements in Arvand Termo Tec; architecture, i18n, SEO and deployment in Arilvo.", tags: ["SSR", "REST APIs", "Strapi", "i18n", "Git", "Deployment"] },
  ] satisfies ToolkitNode[],
  systems: [
    {
      id: "arilvo", mode: "GREENFIELD / SHIPPED", role: "End-to-end development",
      context: "Designed and developed a multilingual MEP/BIM business platform from the ground up.",
      work: ["Architecture, UI/UX implementation and responsive interfaces", "Nuxt SSR, localization, SEO and deployment", "Custom animation; Italian, English and German experiences"],
      stack: ["Nuxt", "Vue", "Quasar", "TypeScript", "GSAP"],
      note: "Ownership from initial architecture to production delivery.",
    },
    {
      id: "docintel", mode: "AI APPLICATION / IN DEVELOPMENT", role: "Full-stack engineering",
      context: "An AI document-intelligence platform currently in development.",
      work: ["Authentication, document upload, processing and text extraction", "Chunking, embeddings and vector storage/retrieval", "Summarization, contextual Q&A and API architecture"],
      stack: ["Nuxt", "Quasar", "FastAPI", "PostgreSQL", "pgvector"],
      note: "Work across the document pipeline, backend APIs and application UI.",
    },
    {
      id: "arvand-termo-tec", mode: "EXISTING SYSTEM / IMPROVED", role: "Development / refactoring / integration",
      context: "Refactoring and integration work on an existing HVAC business website and its CMS infrastructure.",
      work: ["Strapi/CMS integration and architecture cleanup", "Refactored and reorganized more than 256 files", "Localization, Swiper/image fixes, responsive UI and stability debugging"],
      stack: ["Next.js", "React", "Strapi", "PostgreSQL"],
      note: "Focused on maintainability, performance and stability in an existing codebase.",
    },
  ] satisfies SelectedSystem[],
};
