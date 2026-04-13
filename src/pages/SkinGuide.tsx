import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

type GuideGoal = {
  label: string;
  slug: string;
  summary: string;
  actives: string[];
  avoid: string[];
  routine: string[];
};

const GOALS: GuideGoal[] = [
  {
    label: "Acne",
    slug: "acne",
    summary: "Focus on oil balance, inflammation control, and gentle barrier support.",
    actives: ["Salicylic Acid", "Niacinamide", "Azelaic Acid", "Benzoyl Peroxide"],
    avoid: ["Heavy occlusive oils", "Over-exfoliating every day"],
    routine: ["Gentle cleanser", "Targeted treatment", "Lightweight moisturizer", "SPF (AM)"],
  },
  {
    label: "Sensitive Skin",
    slug: "sensitive-skin",
    summary: "Keep formulas simple and prioritize calming, fragrance-free products.",
    actives: ["Centella", "Ceramides", "Allantoin", "Panthenol"],
    avoid: ["Fragrance", "High-strength acids", "Stacking many actives"],
    routine: ["Cream cleanser", "Barrier serum", "Moisturizer", "Mineral SPF (AM)"],
  },
  {
    label: "Dark Spots",
    slug: "dark-spots",
    summary: "Treat pigmentation consistently and protect skin daily from UV exposure.",
    actives: ["Vitamin C", "Tranexamic Acid", "Alpha Arbutin", "Niacinamide"],
    avoid: ["Skipping sunscreen", "Aggressive scrubbing"],
    routine: ["Cleanser", "Brightening serum", "Moisturizer", "Broad-spectrum SPF"],
  },
  {
    label: "Dry Skin",
    slug: "dry-skin",
    summary: "Rebuild barrier lipids and lock in hydration with low-irritation formulas.",
    actives: ["Ceramides", "Hyaluronic Acid", "Squalane", "Glycerin"],
    avoid: ["Foaming harsh cleansers", "Alcohol-heavy toners"],
    routine: ["Hydrating cleanser", "Humectant serum", "Rich moisturizer", "SPF (AM)"],
  },
  {
    label: "Oily Skin",
    slug: "oily-skin",
    summary: "Regulate sebum without stripping the skin and causing rebound oiliness.",
    actives: ["Niacinamide", "BHA", "Zinc", "Azelaic Acid"],
    avoid: ["Skipping moisturizer", "Multiple strong actives together"],
    routine: ["Gel cleanser", "Sebum-control serum", "Gel moisturizer", "SPF (AM)"],
  },
  {
    label: "Anti-aging",
    slug: "anti-aging",
    summary: "Combine collagen support with antioxidant defense and daily UV protection.",
    actives: ["Retinoids", "Peptides", "Vitamin C", "Ferulic Acid"],
    avoid: ["Inconsistent use", "No sunscreen"],
    routine: ["Gentle cleanser", "Antioxidant (AM)", "Retinoid (PM)", "Moisturizer + SPF"],
  },
];

const SkinGuide = () => {
  const [searchParams] = useSearchParams();
  const goalParam = searchParams.get("goal")?.toLowerCase();

  const selectedGoal = useMemo(() => {
    const fallback = GOALS[0];
    if (!goalParam) return fallback;
    return GOALS.find((goal) => goal.slug === goalParam) ?? fallback;
  }, [goalParam]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Skin Guide — Build a Routine Around Your Skin Goals"
        description="Choose your skin concern — acne, ageing, dryness, pigmentation — and get a simple ingredient-first routine path. Free personalised skincare guidance on Skinevora."
        canonical="/skin-guide"
        keywords="skincare routine guide, skin goals, acne skincare routine, anti ageing routine, dry skin routine"
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Guide</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Skin Goal Guide</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Pick a goal and follow a clear path with recommended actives, routine order, and ingredient cautions.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <Link
                  key={goal.slug}
                  to={`/skin-guide?goal=${goal.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    selectedGoal.slug === goal.slug
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground/80 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {goal.label}
                </Link>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-tight">{selectedGoal.label}</h2>
              <p className="mt-3 text-muted-foreground">{selectedGoal.summary}</p>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recommended actives</h3>
                  <ul className="mt-2 space-y-1.5">
                    {selectedGoal.actives.map((active) => (
                      <li key={active} className="text-sm text-foreground">• {active}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Routine flow</h3>
                  <ul className="mt-2 space-y-1.5">
                    {selectedGoal.routine.map((item) => (
                      <li key={item} className="text-sm text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Watch outs</h3>
                  <ul className="mt-2 space-y-1.5">
                    {selectedGoal.avoid.map((item) => (
                      <li key={item} className="text-sm text-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/routine-builder" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                  Build My Routine
                </Link>
                <Link to="/ingredients" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground">
                  Explore Ingredients
                </Link>
                <Link to="/browse" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SkinGuide;
