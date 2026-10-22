import data from "../../../content/about.json" with { type: "json" };
import { identity } from "./identity.ts";

export const aboutCopy = { name: identity.name, role: identity.role, ...data };
