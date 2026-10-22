import data from "../../../content/about-page.json" with { type: "json" };
import { aboutCopy } from "./about.ts";
import type { HomeCopySegment } from "./homeCopy.ts";

export interface AboutChapterContent {
  id: string;
  number: string;
  label: string;
  title: string;
}

export const aboutPageCopy = {
  name: aboutCopy.name, role: aboutCopy.role, ...data,
  title: data.title as HomeCopySegment[],
};
