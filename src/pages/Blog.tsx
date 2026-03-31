import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const POSTS = [
  {
    title: "How To Read an INCI List Without Getting Overwhelmed",
    excerpt: "A practical framework for decoding ingredient order, identifying key actives, and spotting potential irritants.",
    tag: "Guides",
  },
  {
    title: "Retinoid 101: Choosing The Right Strength",
    excerpt: "Retinal, retinol, and retinoic acid are not interchangeable. Start with tolerance, then optimize for consistency.",
    tag: "Actives",
  },
  {
    title: "Building a Minimal Routine for Sensitive Skin",
    excerpt: "A low-risk approach that focuses on barrier repair first, then adds treatment actives in the right order.",
    tag: "Skin Goals",
  },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Blog"
      description="Science-backed skincare guides, ingredient explainers, and practical routine tips from Skinevora."
      canonical="/blog"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Company</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Blog & Guides</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Educational articles to help you make better skincare decisions with confidence.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
            {POSTS.map((post) => (
              <article key={post.title} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.tag}</p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{post.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Blog;
