import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Search, FlaskConical, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

// ─── Full ingredient knowledge base ───────────────────────────────────────────
const INGREDIENTS = [
  { name: "Niacinamide", category: "Active / Vitamin B3", rating: "good" as const, benefit: "Brightens skin tone, minimises pores, controls oil production, calms inflammation. One of the most versatile skincare ingredients.", fungalAcneSafe: true, comedogenic: false, suitable: ["Oily", "Acne-prone", "Sensitive", "Dry"] },
  { name: "Hyaluronic Acid", category: "Humectant", rating: "good" as const, benefit: "Draws and retains moisture in the skin at multiple depths. Works for all skin types, especially dry and dehydrated skin.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types"] },
  { name: "Retinol", category: "Active / Vitamin A", rating: "good" as const, benefit: "Accelerates cell turnover, reduces fine lines and wrinkles, fades dark spots, unclogs pores.", concern: "Can cause irritation, dryness and photosensitivity initially. Always use SPF when using retinol. Not safe during pregnancy.", fungalAcneSafe: true, comedogenic: false, suitable: ["Aging", "Acne-prone", "Normal"] },
  { name: "Vitamin C (Ascorbic Acid)", category: "Antioxidant", rating: "good" as const, benefit: "Neutralises free radicals, brightens skin, stimulates collagen production, reduces hyperpigmentation.", concern: "Ascorbic acid is unstable — choose stable derivatives (Vitamin C derivatives) if sensitive. Store away from light.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types"] },
  { name: "Salicylic Acid", category: "BHA Chemical Exfoliant", rating: "good" as const, benefit: "Oil-soluble — penetrates pores to dissolve blackheads and whiteheads. Anti-inflammatory, ideal for acne-prone skin.", concern: "Can be drying at high concentrations. Avoid if allergic to aspirin.", fungalAcneSafe: false, comedogenic: false, suitable: ["Oily", "Acne-prone", "Combination"] },
  { name: "Glycolic Acid", category: "AHA Chemical Exfoliant", rating: "caution" as const, benefit: "Strongest AHA — fastest exfoliation, excellent for improving texture, brightness and reducing fine lines.", concern: "Increases photosensitivity significantly — always use SPF. Avoid combining with retinol. Not for sensitive skin.", fungalAcneSafe: false, comedogenic: false, suitable: ["Normal", "Combination", "Oily"] },
  { name: "Lactic Acid", category: "AHA Chemical Exfoliant", rating: "caution" as const, benefit: "Gentler AHA exfoliation. Also a humectant — exfoliates and hydrates simultaneously. Great for sensitive skin.", concern: "Increases photosensitivity — use SPF.", fungalAcneSafe: false, comedogenic: false, suitable: ["Sensitive", "Dry", "Normal"] },
  { name: "Azelaic Acid", category: "Multi-Active", rating: "good" as const, benefit: "Targets acne bacteria, reduces rosacea redness, fades post-inflammatory hyperpigmentation. Pregnancy-safe.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "Acne-prone", "Rosacea"] },
  { name: "Tranexamic Acid", category: "Brightening Agent", rating: "good" as const, benefit: "Reduces melasma, hyperpigmentation and redness. Gentler alternative to hydroquinone with fewer side effects.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types", "Sensitive"] },
  { name: "Alpha Arbutin", category: "Brightening Agent", rating: "good" as const, benefit: "Inhibits melanin production to fade dark spots and even skin tone. More stable and less irritating than hydroquinone.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types"] },
  { name: "Ceramides", category: "Barrier Lipid", rating: "good" as const, benefit: "Replenish the skin's natural lipid barrier to prevent moisture loss, protect from environmental damage, and soothe dryness.", fungalAcneSafe: true, comedogenic: false, suitable: ["Dry", "Sensitive", "Eczema-prone", "All skin types"] },
  { name: "Squalane", category: "Lightweight Emollient", rating: "good" as const, benefit: "Derived from olives or sugarcane. Lightweight, non-greasy moisturisation. Mimics skin's natural sebum, antioxidant properties.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types", "Oily"] },
  { name: "Peptides", category: "Active / Signalling Molecule", rating: "good" as const, benefit: "Short chains of amino acids that signal skin to produce collagen and elastin. Firms, smooths and reduces wrinkles over time.", fungalAcneSafe: true, comedogenic: false, suitable: ["Aging", "Normal", "Dry"] },
  { name: "Bakuchiol", category: "Plant-Based Retinol Alternative", rating: "good" as const, benefit: "Natural alternative to retinol from the Psoralea corylifolia plant. Similar anti-ageing effects with significantly less irritation. Pregnancy-safe.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "Aging", "All skin types"] },
  { name: "Zinc Oxide", category: "Mineral Sunscreen", rating: "good" as const, benefit: "Broad-spectrum UVA and UVB protection. Anti-inflammatory, gentle for sensitive skin, reef-safe.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "Acne-prone", "All skin types"] },
  { name: "Titanium Dioxide", category: "Mineral Sunscreen", rating: "good" as const, benefit: "Reflects UV light, broad-spectrum protection. Very gentle for sensitive skin, less white cast than zinc oxide.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "All skin types"] },
  { name: "Panthenol (Vitamin B5)", category: "Humectant / Soothing", rating: "good" as const, benefit: "Hydrates, soothes irritation, and helps repair the skin barrier. Often used post-procedure and in wound healing.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "All skin types"] },
  { name: "Allantoin", category: "Soothing / Keratolytic", rating: "good" as const, benefit: "Calms irritation, promotes cell regeneration, softens skin. Extremely gentle — suitable for all skin types including sensitive.", fungalAcneSafe: true, comedogenic: false, suitable: ["Sensitive", "All skin types"] },
  { name: "Caffeine", category: "Active / Antioxidant", rating: "good" as const, benefit: "Constricts blood vessels to reduce puffiness and dark circles around eyes. Antioxidant properties, improves microcirculation.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types"] },
  { name: "Centella Asiatica (Cica)", category: "Soothing / Healing", rating: "good" as const, benefit: "Calms inflammation, aids wound healing, stimulates collagen synthesis. Excellent for sensitive, acne-prone and damaged skin.", fungalAcneSafe: false, comedogenic: false, suitable: ["Sensitive", "Acne-prone", "Damaged skin"] },
  { name: "Ferulic Acid", category: "Antioxidant", rating: "good" as const, benefit: "Potent antioxidant that significantly boosts the efficacy of Vitamins C and E when combined. Protects from UV-induced damage.", fungalAcneSafe: false, comedogenic: false, suitable: ["All skin types", "Aging"] },
  { name: "Kojic Acid", category: "Brightening Agent", rating: "caution" as const, benefit: "Inhibits tyrosinase to reduce melanin production and fade dark spots.", concern: "Can cause contact dermatitis in some users. Unstable — look for kojic dipalmitate for a more stable form.", fungalAcneSafe: false, comedogenic: false, suitable: ["Hyperpigmentation", "Normal", "Combination"] },
  { name: "Benzoyl Peroxide", category: "Antibacterial", rating: "good" as const, benefit: "Kills Cutibacterium acnes bacteria directly. Fast-acting for inflammatory acne.", concern: "Can bleach fabrics and hair. May cause dryness — use lower concentrations (2.5–5%) first.", fungalAcneSafe: true, comedogenic: false, suitable: ["Acne-prone", "Oily"] },
  { name: "Glycerin", category: "Humectant", rating: "caution" as const, benefit: "Draws moisture from the air into the skin. Effective and inexpensive humectant.", concern: "Can feed Malassezia yeast — not suitable for fungal acne-prone individuals.", fungalAcneSafe: false, comedogenic: false, suitable: ["Dry", "Normal"] },
  { name: "Fragrance", category: "Cosmetic Additive", rating: "caution" as const, benefit: "Adds pleasant scent to the product.", concern: "One of the most common skincare allergens. Can trigger contact dermatitis, irritation and sensitisation, especially for reactive skin.", fungalAcneSafe: true, comedogenic: false, suitable: ["Normal", "Non-sensitive"] },
  { name: "Alcohol Denat", category: "Solvent", rating: "caution" as const, benefit: "Helps other ingredients penetrate skin faster, creates a lightweight feel.", concern: "Regular use can disrupt the skin barrier, cause dryness and increase irritation, particularly for dry or sensitive skin.", fungalAcneSafe: true, comedogenic: false, suitable: ["Oily"] },
  { name: "Dimethicone", category: "Silicone", rating: "caution" as const, benefit: "Creates silky skin feel, locks in moisture, helps active ingredients penetrate. Long-lasting moisturisation.", concern: "Not reef-safe. May trap debris in pores for some acne-prone individuals.", fungalAcneSafe: true, comedogenic: false, suitable: ["Normal", "Dry"] },
  { name: "Mineral Oil", category: "Occlusive", rating: "caution" as const, benefit: "Forms a protective occlusive layer on skin to prevent trans-epidermal water loss. Very safe, non-sensitising.", concern: "Can feel heavy and greasy. May not be ideal for oily or acne-prone skin.", fungalAcneSafe: true, comedogenic: true, suitable: ["Dry", "Mature skin"] },
  { name: "Retinyl Palmitate", category: "Vitamin A Derivative", rating: "caution" as const, benefit: "Gentle form of Vitamin A — slower acting than retinol, better tolerated by sensitive skin.", concern: "Significantly less effective than retinol. Some controversy around high concentrations in sun-exposed areas.", fungalAcneSafe: false, comedogenic: false, suitable: ["Sensitive", "Normal"] },
  { name: "Sodium Lauryl Sulfate (SLS)", category: "Surfactant", rating: "caution" as const, benefit: "Produces rich lather, effectively removes oil and dirt.", concern: "Can be overly stripping for dry and sensitive skin, disrupting the lipid barrier. Consider SLS-free alternatives.", fungalAcneSafe: true, comedogenic: false, suitable: ["Oily"] },
  { name: "Parabens", category: "Preservative", rating: "caution" as const, benefit: "Very effective preservatives — prevent microbial growth and extend product shelf life.", concern: "Debated endocrine disruption concerns at high exposure levels. Regulated to safe concentrations in cosmetics.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types"] },
  { name: "Tocopherol (Vitamin E)", category: "Antioxidant", rating: "good" as const, benefit: "Antioxidant that protects skin cells from oxidative stress, moisturises, and helps stabilise other antioxidants.", fungalAcneSafe: false, comedogenic: false, suitable: ["Dry", "Normal", "Aging"] },
  { name: "Rosehip Oil", category: "Botanical Oil", rating: "caution" as const, benefit: "Rich in Vitamin A and essential fatty acids. Fades scars, reduces hyperpigmentation, anti-ageing.", concern: "High in linoleic acid — may cause purging initially in acne-prone skin.", fungalAcneSafe: true, comedogenic: false, suitable: ["Dry", "Aging", "Scarring"] },
  { name: "Jojoba Oil", category: "Botanical Oil / Wax Ester", rating: "good" as const, benefit: "Technically a wax ester — very similar to skin's sebum. Balances oil production, lightweight moisturisation, non-greasy.", fungalAcneSafe: true, comedogenic: false, suitable: ["All skin types", "Oily"] },
  { name: "Resveratrol", category: "Antioxidant / Polyphenol", rating: "good" as const, benefit: "Powerful antioxidant found in grapes and berries. Anti-inflammatory, anti-ageing, protects from environmental damage.", fungalAcneSafe: false, comedogenic: false, suitable: ["Aging", "All skin types"] },
];

const CATEGORIES = ["All", "Active", "Antioxidant", "Brightening", "Humectant", "Exfoliant", "Soothing", "Barrier", "Sunscreen", "Oil", "Preservative", "Caution"];

const RATING_STYLES = {
  good: "border-green-200 bg-green-50",
  caution: "border-amber-200 bg-amber-50",
  avoid: "border-red-200 bg-red-50",
};

const RATING_BADGE = {
  good: "bg-green-100 text-green-700",
  caution: "bg-amber-100 text-amber-700",
  avoid: "bg-red-100 text-red-700",
};

function IngredientCard({ ing, index }: { ing: typeof INGREDIENTS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ing.rating === "good" ? CheckCircle2 : ing.rating === "caution" ? AlertTriangle : X;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`rounded-2xl border ${RATING_STYLES[ing.rating]} overflow-hidden`}
    >
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`h-5 w-5 flex-shrink-0 ${
              ing.rating === "good" ? "text-green-600" : ing.rating === "caution" ? "text-amber-600" : "text-red-600"
            }`}
          />
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm">{ing.name}</p>
            <p className="text-xs text-muted-foreground">{ing.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${RATING_BADGE[ing.rating]}`}>
            {ing.rating === "good" ? "Beneficial" : "Caution"}
          </span>
          {!ing.fungalAcneSafe && (
            <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 bg-orange-50 hidden sm:flex">FA Risk</Badge>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-5 space-y-3 border-t border-current/10"
        >
          <p className="text-sm text-muted-foreground leading-relaxed pt-3">{ing.benefit}</p>
          {ing.concern && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Important note</p>
              <p className="text-xs text-amber-700 leading-relaxed">{ing.concern}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Best for</p>
              <div className="flex flex-wrap gap-1">
                {ing.suitable.map((s) => (
                  <span key={s} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="ml-auto flex gap-2 items-end">
              {!ing.fungalAcneSafe && (
                <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 bg-orange-50">
                  Fungal Acne Risk
                </Badge>
              )}
              {ing.comedogenic && (
                <Badge variant="outline" className="text-[10px] border-red-300 text-red-600 bg-red-50">
                  Comedogenic
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const IngredientsDatabase = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return INGREDIENTS.filter((ing) => {
      const matchesSearch =
        !query ||
        ing.name.toLowerCase().includes(query.toLowerCase()) ||
        ing.category.toLowerCase().includes(query.toLowerCase()) ||
        ing.benefit.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === "Caution" && ing.rating === "caution") ||
        ing.category.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [query, activeCategory]);

  const goodCount = INGREDIENTS.filter((i) => i.rating === "good").length;
  const cautionCount = INGREDIENTS.filter((i) => i.rating === "caution").length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Skincare Ingredients Database — 35+ Ingredients Explained"
        description="Browse Skinevora's skincare ingredient database. Science-backed explanations for 35+ common ingredients — benefits, concerns, fungal acne safety, and best skin types."
        canonical="/ingredients"
      />
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  Ingredient Database
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Know what's
                <br />
                <span className="text-gradient-teal italic">in your skincare</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Science-backed explanations for {INGREDIENTS.length}+ common skincare ingredients.
                Understand benefits, concerns, and which skin types each ingredient suits.
              </p>
              {/* Stats */}
              <div className="mt-8 flex justify-center gap-8">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{INGREDIENTS.length}+</p>
                  <p className="text-xs text-muted-foreground">Ingredients</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="font-display text-3xl font-bold text-green-600">{goodCount}</p>
                  <p className="text-xs text-muted-foreground">Beneficial</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="font-display text-3xl font-bold text-amber-600">{cautionCount}</p>
                  <p className="text-xs text-muted-foreground">Use Caution</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search & filter */}
        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            {/* Search */}
            <div className="mx-auto max-w-2xl mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search ingredient name or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl text-base"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filtered.length} ingredient{filtered.length !== 1 ? "s" : ""}
              {query && ` for "${query}"`}
            </p>

            {/* Ingredient cards */}
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.length === 0 ? (
                <div className="col-span-2 py-16 text-center">
                  <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No ingredients found matching your search.</p>
                </div>
              ) : (
                filtered.map((ing, i) => (
                  <IngredientCard key={ing.name} ing={ing} index={i} />
                ))
              )}
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Information is for educational purposes. Always patch-test new products and consult a dermatologist for personalised advice.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default IngredientsDatabase;
