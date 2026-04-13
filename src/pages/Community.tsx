import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const HIGHLIGHTS = [
  "Users submit ratings and comments on dupe performance.",
  "Top-reviewed matches are surfaced in trending recommendations.",
  "Feedback helps improve relevance and ranking quality.",
];

const Community = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Community — Skincare Reviews & Dupe Validation"
      description="Join the Skinevora community. Read real reviews, validate dupe recommendations, and help others find affordable skincare alternatives backed by ingredient science."
      canonical="/community"
      keywords="skincare community, dupe reviews, skincare reviews, beauty community"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Community</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Built with real feedback</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Community input keeps recommendations grounded in real-world product experience.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-3">
            {HIGHLIGHTS.map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/browse" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Browse Dupes</Link>
            <Link to="/favorites" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground">Saved Items</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Community;
