export type ProjectStatus = "live" | "wip" | "archived";

export interface Project {
  id: string;
  file: string;
  name: string;
  year: string;
  role: string;
  status: ProjectStatus;
  summary: string;
  stack: string[];
  image: string;
  live?: string;
  repo?: string;
}

export const projects: Project[] = [
  {
    id: "nebula",
    file: "nebula_dashboard/",
    name: "NEBULA DASHBOARD",
    year: "2026",
    role: "FULL-STACK",
    status: "live",
    summary:
      "Real-time analytics dashboard with websocket streams and a reactive Nuxt 3 front.",
    stack: ["NUXT 3", "NODE.JS", "WEBSOCKET", "POSTGRES"],
    image: "/images/projects/nebula.webp",
    live: "https://example.com",
    repo: "https://github.com/you/nebula",
  },
  {
    id: "phantom",
    file: "phantom_api/",
    name: "PHANTOM API",
    year: "2025",
    role: "BACKEND",
    status: "wip",
    summary:
      "High-throughput REST + queue architecture handling 10k req/s with zero-downtime deploys.",
    stack: ["NODE.JS", "REDIS", "DOCKER"],
    image: "/images/projects/phantom.webp",
    repo: "https://github.com/you/phantom",
  },
  {
    id: "void",
    file: "void_3d/",
    name: "VOID 3D",
    year: "2025",
    role: "CREATIVE DEV",
    status: "live",
    summary:
      "Interactive Three.js experience with custom shaders and scroll-driven camera paths.",
    stack: ["THREE.JS", "GLSL", "VUE"],
    image: "/images/projects/void.webp",
    live: "https://example.com",
  },
  {
    id: "cipher",
    file: "cipher_cms/",
    name: "CIPHER CMS",
    year: "2024",
    role: "FULL-STACK",
    status: "archived",
    summary:
      "Headless CMS with role-based access, markdown pipeline and a Quasar admin panel.",
    stack: ["QUASAR", "NUXT", "MONGODB"],
    image: "/images/projects/cipher.webp",
    repo: "https://github.com/you/cipher",
  },
];
