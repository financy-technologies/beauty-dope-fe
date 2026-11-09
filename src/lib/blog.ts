/** Blog types and helpers. Posts come from Sanity via the API (/api/blog). */

export interface BlogImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  lqip: string | null;
}

export interface BlogPostCard {
  slug: string;
  title: string;
  excerpt: string;
  tag: string | null;
  tagColor: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  coverEmoji: string | null;
  coverImage: BlogImage | null;
  readingTimeMinutes: number;
}

export interface BlogPostFull extends BlogPostCard {
  /** Portable Text from Sanity (see studio/schemaTypes/blocks.ts). */
  body: unknown[];
  related: BlogPostCard[];
}

/** Colour names editors pick in the Studio → classes. Keep in sync with studio/schemaTypes/post.ts. */
export const TAG_COLOR_CLASSES: Record<string, string> = {
  teal: "bg-primary/10 text-primary border-primary/20",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const tagClasses = (color: string) => TAG_COLOR_CLASSES[color] ?? TAG_COLOR_CLASSES.teal;

export const readingTimeLabel = (minutes: number) => `${minutes} min read`;

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Sanity image CDN URL at a given width, auto-format (WebP/AVIF where supported). */
export function sanityImageUrl(url: string, width: number) {
  try {
    const u = new URL(url);
    if (u.hostname !== "cdn.sanity.io") return url;
    u.searchParams.set("w", String(width));
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "max");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Only allow links that can't run script: site paths, http(s), mailto.
 * Returns null for anything else (e.g. "javascript:").
 */
export function safeHref(href: unknown): { href: string; internal: boolean } | null {
  if (typeof href !== "string" || !href.trim()) return null;
  const h = href.trim();
  if (h.startsWith("/") && !h.startsWith("//")) return { href: h, internal: true };
  try {
    const u = new URL(h);
    if (["http:", "https:", "mailto:"].includes(u.protocol)) {
      // Absolute links to our own site behave like internal ones.
      if (["skinevora.com", "www.skinevora.com"].includes(u.hostname)) {
        return { href: u.pathname + u.search + u.hash, internal: true };
      }
      return { href: u.toString(), internal: false };
    }
  } catch {
    /* not a URL */
  }
  return null;
}
