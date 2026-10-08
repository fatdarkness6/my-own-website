import { identity } from "../app/assets/data/identity.ts";
import { PAGE_SEO } from "../app/assets/data/pageSeo.ts";
import { homeCopy } from "../app/assets/data/homeCopy.ts";
import { aboutCopy } from "../app/assets/data/about.ts";
import { aboutPageCopy } from "../app/assets/data/aboutPage.ts";
import { projects, projectPlaceholder } from "../app/assets/data/projects.ts";
import { resumeProfile, resumeExperience, resumeProjects, resumeSections } from "../app/assets/data/resume.ts";
import { contactIntents, contactTitle } from "../app/assets/data/contact.ts";

// Interface copy lives here; long-form copy still comes from canonical data.
export const ui = {
  screenshotZoomIn: "Zoom in", screenshotZoomOut: "Zoom out", screenshotFit: "Fit image", screenshotPan: "Swipe or scroll to explore",
  home: "Home", about: "About", projects: "Projects", resume: "Resume", audioPlaying: "PLAYING",
  language: "Choose language", menu: "Open menu", main: "Main", contact: "Contact",
  touch: "Get in touch", portfolio: "Arsam Sarkhosh portfolio", node: "PORTFOLIO NODE", online: "ONLINE",
  first: "ARSAM", last: "SARKHOSH", firstTitle: "ARSAM ", lastTitle: "SARKHOSH.", name: "Arsam Sarkhosh", shortName: "Arsam",
  engineer: identity.role, engineerCaps: identity.role.toUpperCase(),
  homeAbout: "// 02. ABOUT", homeProjects: "// 03. PROJECTS", homeResume: "// 04. RESUME", homeContact: "// 05. CONTACT",
  homeDescription: identity.summary,
  projectsDescription: "Selected platforms and systems I've built or worked on.",
  resumeDescription: "A closer look at the applications I've built, the tools I use and how I work.",
  contactDescription: "Have a project, a role, or just an idea? Open a secure channel and send me a message.",
  viewResume: "View my résumé", fullStory: "Explore my full story & philosophy", moreAbout: "More about me",
  aboutSummary: "I work across the interface and the systems behind it: responsive Vue and Nuxt applications, Node.js and FastAPI backends, and AI-powered workflows. I care about clear architecture, performance and UI that feels intentional.",
  summaryLabel: "About me summary", mission: "Building web apps with personality.", responsiveNuxt: "Responsive Nuxt / Vue", focus: "Focus", cleanUi: "Clean architecture · UI/UX", responsive: "Responsive interfaces",
  handshake: "handshake", encryption: "encryption", channel: "channel", awaiting: "awaiting", enabled: "ENABLED", open: "OPEN", yourMessage: "YOUR MESSAGE",
  builtWith: "Arsam · built with Nuxt + Quasar", previous: "Previous project", next: "Next project", contents: "Résumé contents", connection: "Connection status",
  skip: "Skip to engineering profile", personnel: "PERSONNEL FILE / AS-001", profile: "ENGINEERING PROFILE", exploreProfile: "Explore engineering profile", scroll: "SCROLL TO DECODE", subject: "SUBJECT / AS-001", delivery: "INTERFACES / APIs / DEPLOYMENT", chapters: "About page chapters", fileContents: "FILE CONTENTS",
  methodNote: "Build from zero. Understand existing systems. Improve what is already running.",
  toolkitIntro: "Select a layer to see how I use its tools across production applications and ongoing development.",
  footerLabel: "// PROJECTS / EXPERIENCE / CONTACT", exploreWork: "EXPLORE THE WORK.", letsTalk: "LET'S TALK.", viewProjects: "View projects", viewResumeShort: "View résumé", identity: "ARSAM SARKHOSH / SOFTWARE DEVELOPER", top: "BACK TO TOP ↑",
  fromInterface: "From interface", toProduction: "to production.", profileIntro: "Strong Vue/Nuxt experience, backed by work across services, data, integrations and production delivery.", greenfield: "GREENFIELD", existing: "EXISTING SYSTEMS", expandContext: "EXPAND A RECORD FOR TECHNICAL CONTEXT ↓", responsibilities: "Engineering responsibilities", scope: "SCOPE /",
  stack: "ARSAM / STACK", stackFlow: "INTERFACE → SYSTEM → DELIVERY", tools: "Explore my tools", context: "CONTEXT / IN PRACTICE", contributions: "CONTRIBUTIONS", technologies: "Project technologies", viewProject: "View project", expand: "Expand", collapse: "Collapse",
  archive: "ARSAM / PROJECT FILESYSTEM", indexed: "FILES INDEXED", workLabel: "// SELECTED WORK. OPEN FOR INSPECTION.", built: "BUILT. ", imagined: "NOT JUST IMAGINED.", workIntro: "A quick look at what I build. Pick a project. See it in action.", workArchive: "WORK ARCHIVE", idea: "IDEA → IMPLEMENTATION", interactive: "Interactive project archive", filter: "Filter projects", all: "All files", web: "Web platforms", ai: "AI applications", chooseProject: "Choose a project", projectIndex: "PROJECT INDEX", inspect: "Select a file. Inspect the build.", opened: "Opened", openFile: "OPEN /", live: "LIVE", projectFile: "PROJECT FILE", enlarge: "Enlarge", source: "Source code", liveProject: "Explore live project", newTab: "(opens in a new tab)", underHood: "Under the hood", underCaption: "My contribution, architecture & tools", systemMap: "01 / SYSTEM MAP", layers: "[ CONNECTED LAYERS ]", myContribution: "02 / MY CONTRIBUTION", screenshot: "/ SCREENSHOT", closeScreenshot: "Close screenshot", person: "// THERE'S A PERSON BEHIND THESE BUILDS.", meet: "MEET THE", engineerEnd: "ENGINEER.", behind: "Behind the signal", cover: "PROJECT COVER", coverSoon: "PROJECT COVER / SCREENSHOT COMING SOON", sourceOnly: "BACKEND API / SOURCE AVAILABLE",
  career: "ARSAM.SYS / CAREER PROFILE", document: "DOCUMENT / 001", glance: "// THE ENGINEER. AT A GLANCE.", resumeLinks: "Résumé contact links", download: "Download résumé", preview: "Preview résumé", previewTab: "(PDF, opens in a new tab)", pages: "PAGES / READY TO SHARE", englishPdf: "Download is in English.", strengths: "01 / CORE STRENGTHS", threeAreas: "THREE AREAS. ONE ENGINEER.", employment: "02 / EMPLOYMENT HISTORY", records: "EXPERIENCE RECORDS", shortVersion: "The short version. Open a record for the details.", education: "03 / EDUCATION & DEVELOPMENT", learning: "LEARNING BY BUILDING.", educationLabel: "EDUCATION /", courses: "COURSES / CODING FRONT", technical: "03 / TECHNICAL TOOLSET", across: "ACROSS THE STACK.", projectArchive: "04 / PROJECT ARCHIVE", resumeProjects: "PROJECTS / FROM THE RÉSUMÉ", sideProjects: "Explore projects & side projects", completeList: "The complete list, without crowding the page.", chapter: "// NEXT CHAPTER", workTogether: "LET'S WORK", together: "TOGETHER.", start: "Start a conversation",
  communications: "ARSAM / COMMUNICATIONS", channel05: "CHANNEL 05", direct: "// A DIRECT LINE TO THE ENGINEER", connect: "Connect with Arsam", inMind: "HAVE SOMETHING IN MIND?", contactIntro: "A product to build, a system to improve, or a team to join. Tell me where you want to take it.", startCaps: "START A CONVERSATION", brings: "01 / WHAT BRINGS YOU HERE?", chooseDirection: "CHOOSE A DIRECTION", topic: "Conversation topic", draft: "DRAFT", write: "02 / WRITE THE BRIEF", usefulDetails: "A few useful details are enough to get started.", yourName: "Your name", namePlaceholder: "What should I call you?", yourEmail: "Your email", message: "Your message", previewMessage: "Preview your message", prepareEmail: "Prepare email", prepareMessage: "Prepare message", draftHint: "Prepare a draft, then review and send it from your email app.", briefHint: "Create a brief you can copy and share.", ready: "Ready for the next step.", notSent: "No message has been sent yet.", openDraft: "Open email draft", copyMessage: "Copy message", sidebar: "Contact details and conversation guide", otherEnd: "THE OTHER END OF THE LINE", copyEmail: "Copy email address", startingPoint: "A USEFUL STARTING POINT", giveContext: "Give me the context.", noPitch: "No perfect pitch needed. Plain language works.", moreContext: "MORE CONTEXT BEFORE WE TALK", workBehind: "See the work behind the conversation.", more: "Explore more", contactIdentity: "ARSAM SARKHOSH / LET'S BUILD.",
  nameRequired: "Please enter your name.", emailRequired: "Enter a valid email address.", messageRequired: "Tell me a little about what you have in mind.", draftReady: "Draft ready. Open your email app to review and send it.", briefReady: "Your brief is ready to copy and share.", copyFailed: "Couldn’t copy automatically. You can select and copy the text in the message preview.", messageCopied: "Message copied. You can paste it into your email app.", emailCopied: "Email address copied.", enquiry: "Portfolio enquiry", hi: "Hi Arsam,", from: "From", reply: "Reply to", regarding: "Regarding",
  audioControls: "Background audio controls", toggleAudio: "Toggle background music", musicSettings: "Music settings", music: "Background music:", volume: "Background music volume", pause: "Pause", play: "Play", signal: "SIGNAL CONTROL", standby: "STANDBY", output: "OUTPUT LEVEL", pauseSignal: "> PAUSE SIGNAL", initialize: "> INITIALIZE AUDIO",
  loading: "Loading", tap: "TAP ONCE TO ENTER", click: "CLICK OR PRESS ANY KEY TO ENTER", key: "PRESS ANY KEY TO ENTER", granted: "ACCESS GRANTED", welcome: "WELCOME, OPERATOR", rights: "© Arsam Sarkhosh. All rights reserved.", kernel: "Initializing kernel modules", mount: "Mounting filesystem [/dev/sda1]", firewall: "Bypassing firewall [:443]", scan: "Scanning for intrusions", uplink: "Establishing secure uplink", decrypt: "Decrypting portfolio assets", compile: "Compiling UI components", starting: "Starting arsamsarkhosh.ir",
  portrait: "Stylized portrait of Arsam Sarkhosh with blue light effects",
  skipToContent: "Skip to content",
  seoHome: PAGE_SEO.home.title, seoAbout: PAGE_SEO.about.title, seoProjects: PAGE_SEO.projects.title, seoResume: PAGE_SEO.resume.title, seoContact: PAGE_SEO.contact.title,
  seoHomeDesc: PAGE_SEO.home.description,
  seoAboutDesc: PAGE_SEO.about.description,
  seoProjectsDesc: PAGE_SEO.projects.description,
  seoResumeDesc: PAGE_SEO.resume.description,
  seoContactDesc: PAGE_SEO.contact.description,
};

const structural = new Set(["id", "code", "icon", "class", "src", "href", "live", "repo", "file", "filename", "status", "category", "level", "number", "projectId"]);
export function flatten(source: unknown, prefix = "", result: Record<string, string> = {}) {
  if (typeof source === "string") result[prefix] = source;
  else if (Array.isArray(source)) source.forEach((item, index) => {
    const id = item && typeof item === "object" ? item.id ?? item.code ?? index : index;
    flatten(item, `${prefix}.${id}`, result);
  });
  else if (source && typeof source === "object") Object.entries(source).forEach(([key, value]) => {
    if (!structural.has(key)) flatten(value, prefix ? `${prefix}.${key}` : key, result);
  });
  return result;
}
export const english = {
  ...ui,
  ...flatten({ homeCopy, aboutCopy, aboutPageCopy, projects, projectPlaceholder,
    resumeProfile, resumeExperience, resumeProjects, resumeSections, contactIntents, contactTitle }),
};
