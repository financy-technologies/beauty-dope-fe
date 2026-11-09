import { getToken } from "@/integrations/api/client";
import { hasDeclinedTracking } from "@/lib/consent";

/**
 * Signup attribution: remembers how this browser found Skinevora so the
 * signup request can say "came from the Instagram bio link" or "Google search".
 *
 *  - first touch: the first visit, kept for 90 days
 *  - last touch:  the most recent visit that carried UTM params, a ?ref= short
 *                 link, or an external referrer (plain direct visits never
 *                 overwrite it)
 *
 * Nothing is stored for signed-in users or visitors who declined cookies.
 */

export const ATTRIBUTION_KEY = "skinevora_attribution";
export const FIRST_TOUCH_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;

export interface Touch {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** Tracking-link slug, e.g. "ig" for skinevora.com/go/ig */
  ref?: string;
  /** External referrer hostname, e.g. "l.instagram.com" */
  referrer?: string;
  landingPath: string;
  at: string;
}

export interface AttributionState {
  first: Touch;
  last: Touch;
  expiresAt: number;
}

export interface LinkResolution {
  slug: string;
  destinationPath: string;
  utm: { source: string; medium: string; campaign: string | null; content: string | null };
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

export function hasCampaignParams(params: URLSearchParams): boolean {
  return params.has("ref") || UTM_KEYS.some((k) => params.has(`utm_${k}`));
}

export function externalReferrerHost(referrer: string, ownHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const bare = (h: string) => h.replace(/^www\./, "");
    if (!host || bare(host) === bare(ownHost.toLowerCase())) return undefined;
    return host;
  } catch {
    return undefined;
  }
}

export function buildTouch(opts: {
  params: URLSearchParams;
  pathname: string;
  referrerHost?: string;
  now: number;
}): Touch {
  const touch: Touch = { landingPath: opts.pathname || "/", at: new Date(opts.now).toISOString() };
  for (const k of UTM_KEYS) {
    const v = opts.params.get(`utm_${k}`)?.trim();
    if (v) touch[k] = v.slice(0, 100);
  }
  const ref = opts.params.get("ref")?.trim();
  if (ref) touch.ref = ref.slice(0, 64);
  if (opts.referrerHost) touch.referrer = opts.referrerHost;
  return touch;
}

export function isDirect(touch: Touch): boolean {
  return !touch.source && !touch.ref && !touch.referrer;
}

export function mergeTouch(state: AttributionState | null, touch: Touch, now: number): AttributionState {
  if (!state || state.expiresAt <= now) {
    return { first: touch, last: touch, expiresAt: now + FIRST_TOUCH_WINDOW_MS };
  }
  return isDirect(touch) ? state : { ...state, last: touch };
}

/**
 * Where a short link should send the visitor: the link's destination with its
 * UTM params, any utm_* overrides from the short URL itself
 * (/go/reddit?utm_campaign=r-skincareaddiction), and ref=<slug>.
 */
export function buildLinkTarget(
  link: LinkResolution,
  opts: { origin: string; overrides?: URLSearchParams; includeRef?: boolean },
): URL {
  let url: URL;
  try {
    url = new URL(link.destinationPath || "/", opts.origin);
  } catch {
    url = new URL("/", opts.origin);
  }
  if (url.origin !== opts.origin) url = new URL("/", opts.origin); // never leave the site

  const { utm } = link;
  const defaults: Record<string, string | null> = {
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
    utm_content: utm.content,
  };
  for (const [k, v] of Object.entries(defaults)) if (v) url.searchParams.set(k, v);
  for (const k of UTM_KEYS) {
    const v = opts.overrides?.get(`utm_${k}`)?.trim();
    if (v) url.searchParams.set(`utm_${k}`, v);
  }
  if (opts.includeRef) url.searchParams.set("ref", link.slug);
  return url;
}

/** Used when the API can't be reached: the server fills in UTM from the slug at signup. */
export function fallbackLinkTarget(slug: string, overrides?: URLSearchParams): string {
  const params = new URLSearchParams();
  for (const k of UTM_KEYS) {
    const v = overrides?.get(`utm_${k}`)?.trim();
    if (v) params.set(`utm_${k}`, v);
  }
  if (slug) params.set("ref", slug);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

// ─── Storage ─────────────────────────────────────────────────────────────────

function read(): AttributionState | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.first || !s?.last || typeof s.expiresAt !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

function write(state: AttributionState) {
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — attribution is best-effort */
  }
}

export function captureVisit(
  visit: { search: string; pathname: string; referrer: string },
  now = Date.now(),
) {
  if (hasDeclinedTracking() || getToken()) return;
  const touch = buildTouch({
    params: new URLSearchParams(visit.search),
    pathname: visit.pathname,
    referrerHost: externalReferrerHost(visit.referrer, window.location.hostname),
    now,
  });
  write(mergeTouch(read(), touch, now));
}

/** Payload for /auth/register and /auth/google. Undefined when there's nothing to send. */
export function getAttributionPayload(now = Date.now()): { first: Touch; last: Touch } | undefined {
  if (hasDeclinedTracking()) return undefined;
  const state = read();
  if (!state || state.expiresAt <= now) return undefined;
  return { first: state.first, last: state.last };
}

export function clearAttribution() {
  try {
    localStorage.removeItem(ATTRIBUTION_KEY);
  } catch {
    /* ignore */
  }
}
