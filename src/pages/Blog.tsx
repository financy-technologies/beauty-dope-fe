import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/api/useBlog";
import { formatPostDate, readingTimeLabel, sanityImageUrl, tagClasses, type BlogPostCard } from "@/lib/blog";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import LatestIssues from "@/components/newsletter/LatestIssues";
import { useNewsletter } from "@/hooks/api/useNewsletter";

const BLOG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Skinevora Blog",
  "description": "Science-backed skincare guides, ingredient explainers and practical routine tips.",
  "url": "https://skinevora.com/blog",
  "publisher": {
    "@type": "Organization",
    "name": "Skinevora",
    "logo": { "@type": "ImageObject", "url": "https://skinevora.com/favicon.png" },
  },
};

/** Cover image from Sanity, or the emoji fallback. */
function Cover({ post, className, emojiClass, width }: { post: BlogPostCard; className: string; emojiClass: string; width: number }) {
  if (post.coverImage) {
    return (
      <div className={`${className} overflow-hidden bg-muted`}>
        <img
          src={sanityImageUrl(post.coverImage.url, width)}
          alt={post.coverImage.alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }
  return <div className={`${className} flex items-center justify-center ${emojiClass}`}>{post.coverEmoji ?? "🧴"}</div>;
}

function LatestIssuesSection() {
  const { data } = useNewsletter();
  if (!data?.enabled || data.posts.length === 0) return null;
  return (
    <section className="py-12 border-t border-border">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">From the newsletter</h2>
            <Link to="/newsletter" className="text-sm font-medium text-primary hover:underline underline-offset-2">
              All issues
            </Link>
          </div>
          <LatestIssues limit={3} />
        </div>
      </div>
    </section>
  );
}

const Blog = () => {
  const [query, setQuery] = useState("");
  const { data: posts = [], isLoading, isError, refetch } = useBlogPosts();

  const q = query.toLowerCase();
  const filtered = posts.filter((p) =>
    query.length < 2 ||
    p.title.toLowerCase().includes(q) ||
    (p.tag ?? "").toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="The Skin Edit — Ingredient Guides & Routines"
        description="Science-backed skincare guides, ingredient deep dives, and practical routine tips from Skinevora's editorial team."
        canonical="/blog"
        ogType="website"
        jsonLd={BLOG_JSON_LD}
      />
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  Skinevora Journal
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                The Skin Edit
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Ingredient deep dives, routine frameworks, and science-backed guidance — written to help you make better decisions with confidence.
              </p>

              {/* Search */}
              <div className="mx-auto mt-8 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 bg-white/80 backdrop-blur"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-56 w-full rounded-2xl" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
                  </div>
                </div>
              ) : isError ? (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="font-medium">Couldn't load articles right now.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Try again</Button>
                </div>
              ) : posts.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="font-medium">No articles yet.</p>
                  <p className="text-sm mt-1">Check back soon.</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="font-medium">No articles found for "{query}"</p>
                  <p className="text-sm mt-1">Try a different keyword.</p>
                </div>
              ) : (
                <>
                  {/* Featured article */}
                  <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                  >
                    <Link to={`/blog/${filtered[0].slug}`} className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        {/* Cover */}
                        <Cover
                          post={filtered[0]}
                          width={600}
                          className="md:w-64 h-40 md:h-auto flex-shrink-0"
                          emojiClass="bg-gradient-to-br from-secondary to-primary/10 text-6xl"
                        />
                        {/* Content */}
                        <div className="p-6 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {filtered[0].tag && (
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tagClasses(filtered[0].tagColor)}`}>
                                {filtered[0].tag}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {readingTimeLabel(filtered[0].readingTimeMinutes)}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatPostDate(filtered[0].publishedAt)}</span>
                          </div>
                          <h2 className="font-display text-2xl font-bold tracking-tight group-hover:text-primary transition-colors mb-2">
                            {filtered[0].title}
                          </h2>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                            {filtered[0].excerpt}
                          </p>
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                            Read article <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>

                  {/* Grid of remaining articles */}
                  {filtered.length > 1 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.slice(1).map((post, i) => (
                        <motion.article
                          key={post.slug}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.08 }}
                        >
                          <Link to={`/blog/${post.slug}`} className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors h-full">
                            {/* Cover */}
                            <Cover
                              post={post}
                              width={600}
                              className="h-28"
                              emojiClass="bg-gradient-to-br from-secondary/60 to-primary/10 text-4xl"
                            />
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {post.tag && (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tagClasses(post.tagColor)}`}>
                                    {post.tag}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {readingTimeLabel(post.readingTimeMinutes)}
                                </span>
                              </div>
                              <h2 className="font-display text-lg font-bold tracking-tight group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                                {post.title}
                              </h2>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.excerpt}
                              </p>
                              <p className="mt-3 text-xs text-muted-foreground">{formatPostDate(post.publishedAt)}</p>
                            </div>
                          </Link>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Latest Substack issues */}
        <LatestIssuesSection />

        {/* Newsletter signup (Substack) */}
        <NewsletterSignup />

      </main>
      <Footer />
    </div>
  );
};

export default Blog;
