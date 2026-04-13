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

const BASE_URL    = "https://skinevora.com";
const DEFAULT_OG  = `${BASE_URL}/skinevora_final.png`;
const SITE_LOGO   = `${BASE_URL}/favicon.png`;
const SITE_NAME   = "Skinevora";
const TWITTER_HANDLE = "@skinevora";

// Default site-wide keywords (each page can append its own)
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
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Find your skin's smarter match`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;
  const allKeywords  = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description"  content={description} />
      <meta name="keywords"     content={allKeywords} />
      <meta name="author"       content={SITE_NAME} />
      <meta name="robots"       content={noIndex ? "noindex,nofollow" : "index,follow,max-snippet:-1,max-image-preview:large"} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type"        content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="512" />
      <meta property="og:image:height" content="512" />
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

      {/* Favicon (Google uses this for rich results) */}
      <link rel="icon" type="image/png" href={SITE_LOGO} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
