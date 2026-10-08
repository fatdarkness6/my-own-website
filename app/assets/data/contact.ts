import { identity } from "./identity.ts";
export const contactDetails = identity.contact;

export const contactIntents = [
  {
    id: "project",
    number: "01",
    label: "Build a project",
    icon: "terminal",
    summary: "An idea to ship. A system to improve.",
    subject: "Project enquiry",
    prompt: "What are we building?",
    placeholder: "Tell me about the product, what you need help with, and any timeline you have in mind…",
    pointers: ["The product and the people using it", "What needs building or improving", "Your timeline, scope or starting point"],
  },
  {
    id: "role",
    number: "02",
    label: "Discuss a role",
    icon: "badge",
    summary: "Your team. The work ahead. My part in it.",
    subject: "Software development role",
    prompt: "Tell me about the role.",
    placeholder: "What is your team building? Share the role, stack, working setup and what you’d like me to own…",
    pointers: ["Your team and what it is building", "The role, stack and responsibilities", "Working setup and next steps"],
  },
  {
    id: "collaboration",
    number: "03",
    label: "Collaborate",
    icon: "hub",
    summary: "A shared idea worth exploring.",
    subject: "Collaboration",
    prompt: "What do you have in mind?",
    placeholder: "Share the idea, where you are with it, and how you think we could work together…",
    pointers: ["The idea and its current stage", "How we could work together", "A useful first step"],
  },
] as const;

export type ContactIntent = (typeof contactIntents)[number]["id"];

export const contactTitle = [
  { text: "GOOD SYSTEMS START WITH ", glitch: false },
  { text: "A CONVERSATION.", accent: true, interval: 7800 },
];
