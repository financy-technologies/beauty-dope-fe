import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  jsonLd?: object | object[];
  keywords?: string;
}

const BASE_URL       = "https://skinevora.com";
const DEFAULT_OG     = `${BASE_URL}/skinevora_final.png`;
const SITE_LOGO      = `${BASE_URL}/favicon.png`;
const SITE_NAME      = "Skinevora";
const TWITTER_HANDLE = "@skinevora";

const DEFAULT_KEYWORDS = "skincare dupes, makeup dupes, affordable skincare, ingredient analysis, beauty alternatives, skincare comparison, dupe finder, Skinevora";

export default function SEO({
  title,
  description = "Discover ingredient-matched dupes for luxury skincare and makeup. Science-backed analysis, honest comparisons — by Skinevora.",
  canonical,
  ogImage = DEFAULT_OG,
  ogType = "website",
  noIndex = false,
  jsonLd,
  keywords,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Find your skin's smarter match`;
  const allKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  // Always resolve a canonical. If caller provides a path, use it.
  // Otherwise derive from the current window pathname (strips query params & hash
  // so parameterised SPA URLs never get indexed as separate pages).
  const resolvedPath = canonical ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  // Normalise: ensure leading slash, strip trailing slash (except root)
  const normPath = resolvedPath === "/" ? "/" : `/${resolvedPath.replace(/^\//, "").replace(/\/$/, "")}`;
  const canonicalUrl = `${BASE_URL}${normPath}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords"    content={allKeywords} />
      <meta name="author"      content={SITE_NAME} />
      <meta name="robots"      content={noIndex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:type"         content={ogType} />
      <meta property="og:url"          content={canonicalUrl} />
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"    content={fullTitle} />
      <meta property="og:locale"       content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:creator"     content={TWITTER_HANDLE} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={fullTitle} />

      <link rel="icon" type="image/png" href={SITE_LOGO} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
