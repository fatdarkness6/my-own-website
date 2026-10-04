export const INTRO_SESSION_KEY = "portfolio:intro-entered";

type EntryNavigationType = "navigate" | "reload" | "back_forward";

// Address-bar navigation creates a new document, but belongs to the same visit.
// Reload is an explicit request to replay the intro. Session storage expires
// with the tab, so opening the site again starts a fresh visit.
export function shouldShowIntro(
  navigationType: EntryNavigationType | undefined,
  enteredThisSession: boolean,
) {
  return navigationType === "reload" || !enteredThisSession;
}
