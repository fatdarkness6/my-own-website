import data from "../../../content/profile.json" with { type: "json" };
import { portraitImages } from "./images.ts";

// Shared identity/contact information is edited once in content/profile.json.
export const identity = { ...data, image: portraitImages.home };
