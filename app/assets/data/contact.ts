import data from "../../../content/contact.json" with { type: "json" };
import { identity } from "./identity.ts";

export const contactDetails = identity.contact;
export const contactIntents = data.intents;
export type ContactIntent = (typeof contactIntents)[number]["id"];
export const contactTitle = data.title;
