// Regenerate the downloadable résumé from the website's canonical content.
// Requires Node 22.18+ and Python with reportlab/pypdf: npm run resume:pdf -- --python <python-path>
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { contactDetails } from "../app/assets/data/contact.ts";
import { resumeDocument, resumeProfile, resumeExperience, resumeProjects } from "../app/assets/data/resume.ts";

const pythonIndex = process.argv.indexOf("--python");
const python = pythonIndex >= 0 ? process.argv[pythonIndex + 1] : "python";
if (!python) throw new Error("Provide a Python executable after --python.");
const output = fileURLToPath(new URL("../output/pdf/Arsam-Sarkhosh-Resume.pdf", import.meta.url));
const websiteOutput = fileURLToPath(new URL(`../public${resumeDocument.href}`, import.meta.url));
const renderer = fileURLToPath(new URL("./render-resume.py", import.meta.url));
const result = spawnSync(python, [renderer, output], {
  input: JSON.stringify({ profile: resumeProfile, experience: resumeExperience, projects: resumeProjects, contact: contactDetails, pages: resumeDocument.pages }),
  encoding: "utf8",
});
if (result.error) throw result.error;
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.status ?? 1;
if (result.status === 0) {
  mkdirSync(dirname(websiteOutput), { recursive: true });
  copyFileSync(output, websiteOutput);
  process.stdout.write(`Updated website download: ${websiteOutput}\n`);
}
