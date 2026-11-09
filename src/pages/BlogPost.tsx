import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PortableBody from "@/components/blog/PortableBody";
import { useBlogPost } from "@/hooks/api/useBlog";
import { formatPostDate, readingTimeLabel, sanityImageUrl, tagClasses } from "@/lib/blog";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, notFound, refetch } = useBlogPost(slug);

  if (notFound) return <Navigate to="/blog" replace />;

  if (isLoading || isError || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-hero py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {isError ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <p className="font-medium">Couldn't load this article right now.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Try again</Button>
                  </div>
                ) : (
                  <>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </>
                )}
              </div>
            </div>
          </section>
          {!isError && (
            <section className="py-10">
              <div className="container px-4 md:px-6">
                <div className="mx-auto max-w-3xl space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    );
  }

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
    ...(post.coverImage ? { "image": sanityImageUrl(post.coverImage.url, 1200) } : {}),
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
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
        ogImage={post.coverImage ? sanityImageUrl(post.coverImage.url, 1200) : undefined}
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
                {post.tag && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tagClasses(post.tagColor)}`}>
                    {post.tag}
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {readingTimeLabel(post.readingTimeMinutes)}
                </span>
                <span className="text-xs text-muted-foreground">{formatPostDate(post.publishedAt)}</span>
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
              {post.coverImage && (
                <img
                  src={sanityImageUrl(post.coverImage.url, 1200)}
                  alt={post.coverImage.alt}
                  width={post.coverImage.width ?? undefined}
                  height={post.coverImage.height ?? undefined}
                  className="mb-10 w-full h-auto rounded-2xl border border-border bg-muted"
                />
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <PortableBody value={post.body} />
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
                  to={`/go/blog?utm_content=${encodeURIComponent(post.slug)}`}
                  rel="nofollow"
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
        {post.related.length > 0 && (
          <section className="py-10 bg-muted/30">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl">
                <h2 className="font-display text-xl font-semibold mb-6">Related Articles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {post.related.map((rp) => (
                    <Link
                      key={rp.slug}
                      to={`/blog/${rp.slug}`}
                      className="group flex gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{rp.coverEmoji ?? "🧴"}</span>
                      <div>
                        {rp.tag && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tagClasses(rp.tagColor)}`}>
                            {rp.tag}
                          </span>
                        )}
                        <h3 className="mt-1.5 text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {rp.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {readingTimeLabel(rp.readingTimeMinutes)}
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
