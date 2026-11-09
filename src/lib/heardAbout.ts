/**
 * "How did you hear about us?" — asked once, right after a new account is
 * created (email or Google). Keys must match HEARD_ABOUT_CHANNELS in the API
 * (beauty-dope-be/src/tracking/heard-about.ts).
 */
export const HEARD_ABOUT_OPTIONS = [
  { value: "instagram", label: "Instagram", detailPrompt: "Which account or post?" },
  { value: "reddit", label: "Reddit", detailPrompt: "Which subreddit?" },
  { value: "google", label: "Google search", detailPrompt: "What were you searching for?" },
  { value: "youtube", label: "YouTube", detailPrompt: "Which channel or video?" },
  { value: "pinterest", label: "Pinterest", detailPrompt: "Which pin or board?" },
  { value: "ai_assistant", label: "ChatGPT / AI assistant", detailPrompt: "Which one?" },
  { value: "friend", label: "Friend or family", detailPrompt: "Anything you'd like to add?" },
  { value: "blog", label: "Blog or article", detailPrompt: "Which site?" },
  { value: "other", label: "Somewhere else", detailPrompt: "Where?" },
] as const;

export type HeardAboutChannel = (typeof HEARD_ABOUT_OPTIONS)[number]["value"];

// The question is "pending" from signup until it's answered or skipped. Keyed
// by user id so it survives a reload but never shows for a different account.
const PENDING_KEY = "skinevora_heard_about_pending";

export function markHeardAboutPending(userId: string) {
  try {
    localStorage.setItem(PENDING_KEY, userId);
  } catch {
    /* ignore */
  }
}

export function isHeardAboutPending(userId: string): boolean {
  try {
    return localStorage.getItem(PENDING_KEY) === userId;
  } catch {
    return false;
  }
}

export function clearHeardAboutPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}
