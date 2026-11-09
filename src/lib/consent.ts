export const CONSENT_KEY = "skinevora_cookie_consent";

/** True only when the visitor explicitly clicked "Decline" on the cookie banner. */
export function hasDeclinedTracking(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "declined";
  } catch {
    return false;
  }
}
