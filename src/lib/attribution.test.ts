import { describe, it, expect, beforeEach } from "vitest";
import {
  ATTRIBUTION_KEY,
  FIRST_TOUCH_WINDOW_MS,
  buildLinkTarget,
  buildTouch,
  captureVisit,
  clearAttribution,
  externalReferrerHost,
  fallbackLinkTarget,
  getAttributionPayload,
  hasCampaignParams,
  mergeTouch,
  type LinkResolution,
} from "./attribution";
import { CONSENT_KEY } from "./consent";

const T0 = Date.parse("2026-11-01T10:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const ORIGIN = window.location.origin;

const igLink: LinkResolution = {
  slug: "ig",
  destinationPath: "/",
  utm: { source: "instagram", medium: "social", campaign: "bio", content: null },
};

beforeEach(() => localStorage.clear());

describe("pure helpers", () => {
  it("detects campaign params", () => {
    expect(hasCampaignParams(new URLSearchParams("utm_source=x"))).toBe(true);
    expect(hasCampaignParams(new URLSearchParams("ref=ig"))).toBe(true);
    expect(hasCampaignParams(new URLSearchParams("q=serum&page=2"))).toBe(false);
  });

  it("only keeps external referrers", () => {
    expect(externalReferrerHost("https://l.instagram.com/?u=x", "skinevora.com")).toBe("l.instagram.com");
    expect(externalReferrerHost("https://www.skinevora.com/blog", "skinevora.com")).toBeUndefined();
    expect(externalReferrerHost("", "skinevora.com")).toBeUndefined();
    expect(externalReferrerHost("not a url", "skinevora.com")).toBeUndefined();
  });

  it("builds a touch from UTM params", () => {
    const t = buildTouch({
      params: new URLSearchParams("utm_source=reddit&utm_medium=social&utm_campaign=signature&ref=reddit"),
      pathname: "/",
      referrerHost: "out.reddit.com",
      now: T0,
    });
    expect(t).toEqual({
      source: "reddit",
      medium: "social",
      campaign: "signature",
      ref: "reddit",
      referrer: "out.reddit.com",
      landingPath: "/",
      at: new Date(T0).toISOString(),
    });
  });

  it("keeps first touch, moves last touch on tagged visits, ignores direct revisits", () => {
    const ig = buildTouch({ params: new URLSearchParams("utm_source=instagram"), pathname: "/", now: T0 });
    const direct = buildTouch({ params: new URLSearchParams(), pathname: "/browse", now: T0 + DAY });
    const blog = buildTouch({ params: new URLSearchParams("utm_source=blog&ref=blog"), pathname: "/browse", now: T0 + 2 * DAY });

    let s = mergeTouch(null, ig, T0);
    s = mergeTouch(s, direct, T0 + DAY);
    expect(s.last.source).toBe("instagram");

    s = mergeTouch(s, blog, T0 + 2 * DAY);
    expect(s.first.source).toBe("instagram");
    expect(s.last.source).toBe("blog");
  });

  it("starts over once the first-touch window expires", () => {
    const ig = buildTouch({ params: new URLSearchParams("utm_source=instagram"), pathname: "/", now: T0 });
    const later = T0 + FIRST_TOUCH_WINDOW_MS + 1;
    const reddit = buildTouch({ params: new URLSearchParams("utm_source=reddit"), pathname: "/", now: later });
    const s = mergeTouch(mergeTouch(null, ig, T0), reddit, later);
    expect(s.first.source).toBe("reddit");
  });
});

describe("short link targets", () => {
  it("adds the link's UTM params and ref", () => {
    const url = buildLinkTarget(igLink, { origin: ORIGIN, includeRef: true });
    expect(url.pathname).toBe("/");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio",
      ref: "ig",
    });
  });

  it("lets utm_* on the short URL override the defaults", () => {
    const url = buildLinkTarget(
      { ...igLink, slug: "blog", destinationPath: "/browse" },
      { origin: ORIGIN, overrides: new URLSearchParams("utm_content=niacinamide-complete-guide&evil=1") },
    );
    expect(url.pathname).toBe("/browse");
    expect(url.searchParams.get("utm_content")).toBe("niacinamide-complete-guide");
    expect(url.searchParams.has("evil")).toBe(false);
    expect(url.searchParams.has("ref")).toBe(false);
  });

  it("never redirects off-site", () => {
    expect(buildLinkTarget({ ...igLink, destinationPath: "//evil.com/x" }, { origin: ORIGIN }).origin).toBe(ORIGIN);
    expect(buildLinkTarget({ ...igLink, destinationPath: "https://evil.com" }, { origin: ORIGIN }).origin).toBe(ORIGIN);
  });

  it("falls back to the homepage with ref when the API is unreachable", () => {
    expect(fallbackLinkTarget("ig")).toBe("/?ref=ig");
    expect(fallbackLinkTarget("reddit", new URLSearchParams("utm_campaign=r-skincare"))).toBe(
      "/?utm_campaign=r-skincare&ref=reddit",
    );
  });
});

describe("storage", () => {
  it("captures a visit and returns it as the signup payload", () => {
    captureVisit({ search: "?utm_source=instagram&ref=ig", pathname: "/", referrer: "https://l.instagram.com/" }, T0);
    const payload = getAttributionPayload(T0 + DAY);
    expect(payload?.first).toMatchObject({ source: "instagram", ref: "ig", referrer: "l.instagram.com" });
    expect(payload?.last).toEqual(payload?.first);
  });

  it("records nothing once the visitor declines cookies", () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    captureVisit({ search: "?utm_source=instagram", pathname: "/", referrer: "" }, T0);
    expect(localStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
    expect(getAttributionPayload(T0)).toBeUndefined();
  });

  it("records nothing for signed-in users", () => {
    localStorage.setItem("beautydope_token", "jwt");
    captureVisit({ search: "?utm_source=instagram", pathname: "/", referrer: "" }, T0);
    expect(localStorage.getItem(ATTRIBUTION_KEY)).toBeNull();
  });

  it("survives corrupted storage", () => {
    localStorage.setItem(ATTRIBUTION_KEY, "{not json");
    expect(getAttributionPayload()).toBeUndefined();
    captureVisit({ search: "?utm_source=reddit", pathname: "/", referrer: "" }, T0);
    expect(getAttributionPayload(T0)?.first.source).toBe("reddit");
  });

  it("clears", () => {
    captureVisit({ search: "?utm_source=reddit", pathname: "/", referrer: "" }, T0);
    clearAttribution();
    expect(getAttributionPayload(T0)).toBeUndefined();
  });
});
