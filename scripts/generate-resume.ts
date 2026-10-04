// Regenerate the downloadable résumé from the website's canonical content.
// Requires Node 22.18+ and Python with reportlab/pypdf: npm run resume:pdf -- --python <python-path>
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { aboutCopy } from "../app/assets/data/about.ts";
import { projects } from "../app/assets/data/projects.ts";
import { contactDetails } from "../app/assets/data/contact.ts";
import { resumeDocument } from "../app/assets/data/resume.ts";

const pythonIndex = process.argv.indexOf("--python");
const python = pythonIndex >= 0 ? process.argv[pythonIndex + 1] : "python";
if (!python) throw new Error("Provide a Python executable after --python.");
const output = fileURLToPath(new URL(`../public${resumeDocument.href}`, import.meta.url));
const renderer = fileURLToPath(new URL("./render-resume.py", import.meta.url));
const result = spawnSync(python, [renderer, output], {
  input: JSON.stringify({ profile: aboutCopy, projects, contact: contactDetails }),
  encoding: "utf8",
});
if (result.error) throw result.error;
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.status ?? 1;
