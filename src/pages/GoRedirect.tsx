import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { buildLinkTarget, fallbackLinkTarget, type LinkResolution } from "@/lib/attribution";
import SEO from "@/components/SEO";

const TIMEOUT_MS = 4000;

/**
 * Short links: skinevora.com/go/ig → /?utm_source=instagram&utm_medium=social&utm_campaign=bio&ref=ig
 *
 * Counts the click via the API, then hands off to the destination, where
 * AttributionTracker records the UTM params. If the API is slow or down the
 * visitor still lands on the site with ?ref=<slug>, which the backend maps
 * back to the link at signup.
 */
const GoRedirect = () => {
  const { slug = "" } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;
    const overrides = new URLSearchParams(search);
    const go = (to: string) => {
      if (done) return;
      done = true;
      navigate(to, { replace: true });
    };

    const timer = setTimeout(() => go(fallbackLinkTarget(slug, overrides)), TIMEOUT_MS);

    api
      .post<LinkResolution>(`/links/${encodeURIComponent(slug)}/click`)
      .then((link) => {
        const url = buildLinkTarget(link, { origin: window.location.origin, overrides, includeRef: true });
        go(url.pathname + url.search + url.hash);
      })
      .catch(() => go(fallbackLinkTarget(slug, overrides)))
      .finally(() => clearTimeout(timer));

    return () => {
      done = true;
      clearTimeout(timer);
    };
    // navigate's identity can change between renders; re-running would count a second click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SEO title="Redirecting" noIndex />
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
};

export default GoRedirect;
