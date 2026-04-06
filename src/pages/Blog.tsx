import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BLOG_POSTS } from "@/data/blogPosts";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const Blog = () => {
  const [query, setQuery] = useState("");

  const filtered = BLOG_POSTS.filter((p) =>
    query.length < 2 ||
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.tag.toLowerCase().includes(query.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Blog & Ingredient Guides"
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
                Blog & Guides
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
              {filtered.length === 0 ? (
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
                        <div className="flex items-center justify-center bg-gradient-to-br from-secondary to-primary/10 text-6xl md:w-64 h-40 md:h-auto flex-shrink-0">
                          {filtered[0].coverEmoji}
                        </div>
                        {/* Content */}
                        <div className="p-6 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${filtered[0].tagColor}`}>
                              {filtered[0].tag}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {filtered[0].readingTime}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(filtered[0].publishedAt)}</span>
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
                            <div className="flex items-center justify-center bg-gradient-to-br from-secondary/60 to-primary/10 text-4xl h-28">
                              {post.coverEmoji}
                            </div>
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${post.tagColor}`}>
                                  {post.tag}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {post.readingTime}
                                </span>
                              </div>
                              <h2 className="font-display text-lg font-bold tracking-tight group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                                {post.title}
                              </h2>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {post.excerpt}
                              </p>
                              <p className="mt-3 text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
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

        {/* Newsletter CTA */}
        <section className="py-12 bg-gradient-to-br from-secondary to-primary/5">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-md">
              <h2 className="font-display text-2xl font-semibold mb-2">Stay ingredient-literate</h2>
              <p className="text-sm text-muted-foreground mb-6">
                New guides every week. No sponsored content. Science first.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get notified <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Blog;
