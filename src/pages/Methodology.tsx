import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const STEPS = [
  {
    title: "1. Ingredient Parsing",
    content:
      "We normalize raw ingredient lists into consistent tokens, identify key actives, and map known aliases to canonical names.",
  },
  {
    title: "2. Formula Similarity",
    content:
      "Products are compared using active overlap, supporting ingredient families, and category relevance to estimate formula-level similarity.",
  },
  {
    title: "3. Ranking",
    content:
      "Matches are ranked by similarity score, price savings, and user feedback to prioritize practical alternatives.",
  },
  {
    title: "4. Human Feedback Loop",
    content:
      "Community ratings and reviews help validate outcomes and continuously improve recommendation quality.",
  },
];

const Methodology = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Methodology"
      description="Learn how Skinevora calculates dupe similarity using ingredient parsing, formula matching, and ranking signals."
      canonical="/methodology"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Company</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Our Methodology</h1>
            <p className="mt-4 text-muted-foreground">
              Recommendations are built from ingredient data, not marketing copy. Here is how scoring works.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold tracking-tight">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Methodology;
