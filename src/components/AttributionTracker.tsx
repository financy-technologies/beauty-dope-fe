import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { captureVisit, hasCampaignParams } from "@/lib/attribution";

/**
 * Records where the visitor came from (see lib/attribution). Runs on the
 * initial page load, and again on in-app navigations that carry UTM / ref
 * params — e.g. the blog CTA, or the hop from /go/:slug to its destination.
 */
const AttributionTracker = () => {
  const { pathname, search } = useLocation();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // The short-link page navigates on to a tagged URL; capture that instead.
    if (pathname.startsWith("/go/")) return;

    const initial = isInitialLoad.current;
    isInitialLoad.current = false;
    if (!initial && !hasCampaignParams(new URLSearchParams(search))) return;

    // document.referrer is fixed for the whole SPA session, so it only
    // describes the first page we capture.
    captureVisit({ pathname, search, referrer: initial ? document.referrer : "" });
  }, [pathname, search]);

  return null;
};

export default AttributionTracker;
