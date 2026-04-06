import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ChevronRight, AlertTriangle, Lightbulb } from "lucide-react";
import { getBlogPost, BLOG_POSTS, type BlogSection, type IngredientItem } from "@/data/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Ingredient card ─────────────────────────────────────────────────────── */
function IngredientCard({ item }: { item: IngredientItem }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 my-1">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          <p className="text-xs text-muted-foreground font-mono">{item.inci}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {item.skinTypes.map((st) => (
            <span key={st} className="text-xs rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground font-medium">
              {st}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{item.benefit}</p>
      {item.caution && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          {item.caution}
        </p>
      )}
    </div>
  );
}

/* ── Section renderer ────────────────────────────────────────────────────── */
function RenderSection({ section, index }: { section: BlogSection; index: number }) {
  switch (section.type) {
    case "paragraph":
      return (
        <p className="text-muted-foreground leading-7 mb-4">
          {section.text}
        </p>
      );

    case "heading":
      return (
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-10 mb-4 pb-2 border-b border-border">
          {section.text}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="font-semibold text-lg text-foreground mt-6 mb-2">
          {section.text}
        </h3>
      );

    case "ingredient-card":
      return (
        <div className="my-6 space-y-3">
          {section.items?.map((item) => <IngredientCard key={item.inci} item={item} />)}
        </div>
      );

    case "ingredient-list":
      return (
        <div className="my-6 grid gap-3 sm:grid-cols-2">
          {section.items?.map((item) => <IngredientCard key={item.inci} item={item} />)}
        </div>
      );

    case "tip-box":
      return (
        <div className="my-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex gap-3">
          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">{section.text}</p>
        </div>
      );

    case "warning-box":
      return (
        <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">{section.text}</p>
        </div>
      );

    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60">
                {section.headers?.map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-muted-foreground border-b border-border/50 last:border-b-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

/* ── Page ────────────────────────────────────────────────────────────────── */
const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? "");

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && (post.relatedSlugs?.includes(p.slug) ?? false)
  );

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "author": { "@type": "Organization", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "Skinevora",
      "logo": { "@type": "ImageObject", "url": "https://skinevora.com/favicon.png" },
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "url": `https://skinevora.com/blog/${post.slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://skinevora.com/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={articleJsonLd}
      />
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-3xl"
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground line-clamp-1">{post.title}</span>
              </nav>

              {/* Tag + meta */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${post.tagColor}`}>
                  {post.tag}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readingTime}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              <p className="mt-4 text-sm text-muted-foreground font-medium">{post.author}</p>
            </motion.div>
          </div>
        </section>

        {/* Article body */}
        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {post.content.map((section, i) => (
                  <RenderSection key={i} section={section} index={i} />
                ))}
              </motion.div>

              {/* Back + browse dupes CTA */}
              <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to all articles
                </Link>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Browse ingredient-matched dupes
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="py-10 bg-muted/30">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-xl font-semibold mb-6">Related Articles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.slug}
                      to={`/blog/${rp.slug}`}
                      className="group flex gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{rp.coverEmoji}</span>
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${rp.tagColor}`}>
                          {rp.tag}
                        </span>
                        <h3 className="mt-1.5 text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {rp.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {rp.readingTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
