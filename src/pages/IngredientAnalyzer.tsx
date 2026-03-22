import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Static ingredient knowledge base ────────────────────────────────────────
const INGREDIENT_DB: Record<string, {
  category: string;
  benefit: string;
  concern?: string;
  fungalAcneSafe: boolean;
  comedogenic: boolean;
  rating: "good" | "caution" | "avoid";
}> = {
  "niacinamide": { category: "Active", benefit: "Brightens skin tone, reduces pores, controls oil, anti-inflammatory", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "hyaluronic acid": { category: "Humectant", benefit: "Draws moisture into skin, deep hydration, plumping effect", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "retinol": { category: "Active (Vitamin A)", benefit: "Speeds cell turnover, reduces fine lines and wrinkles, fades dark spots", concern: "Can cause irritation, dryness, and photosensitivity — use at night and always apply SPF", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "glycerin": { category: "Humectant", benefit: "Attracts and retains moisture, strengthens skin barrier", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "salicylic acid": { category: "BHA Exfoliant", benefit: "Unclogs pores, anti-inflammatory, excellent for acne-prone skin", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "vitamin c": { category: "Antioxidant", benefit: "Brightens, evens skin tone, boosts collagen, protects from UV damage", concern: "Oxidises quickly — use a stable form (ascorbic acid or derivatives) and store away from light", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "ascorbic acid": { category: "Antioxidant (Vitamin C)", benefit: "Brightens skin, stimulates collagen synthesis, neutralises free radicals", concern: "Unstable in high concentrations — may sting sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "ceramide": { category: "Barrier Lipid", benefit: "Restores and strengthens the skin barrier, locks in moisture, soothes sensitivity", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "ceramides": { category: "Barrier Lipid", benefit: "Restores and strengthens the skin barrier, locks in moisture, soothes sensitivity", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "peptides": { category: "Active", benefit: "Signal skin to produce collagen, reduce wrinkles, firm and smooth", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "zinc oxide": { category: "Mineral Sunscreen", benefit: "Broad-spectrum UVA/UVB protection, anti-inflammatory, reef-safe", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "titanium dioxide": { category: "Mineral Sunscreen", benefit: "Broad-spectrum UV protection, gentle for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "benzoyl peroxide": { category: "Antibacterial", benefit: "Kills acne-causing bacteria, reduces inflammation", concern: "Can bleach fabrics and hair — use carefully. May be drying at high concentrations", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "lactic acid": { category: "AHA Exfoliant", benefit: "Gentle exfoliation, brightening, hydrating — well tolerated by sensitive skin", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "glycolic acid": { category: "AHA Exfoliant", benefit: "Strong exfoliation, reduces fine lines, brightens skin tone", concern: "Can increase photosensitivity — always use SPF. Avoid with retinol in the same routine", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "kojic acid": { category: "Brightening", benefit: "Inhibits melanin production, reduces hyperpigmentation and dark spots", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "azelaic acid": { category: "Multi-active", benefit: "Targets acne, rosacea, hyperpigmentation simultaneously — suitable for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "tranexamic acid": { category: "Brightening", benefit: "Reduces hyperpigmentation and melasma with minimal irritation", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "squalane": { category: "Emollient", benefit: "Lightweight, non-greasy moisturisation, antioxidant, stabilises skin barrier", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "jojoba oil": { category: "Emollient Oil", benefit: "Mimics skin's sebum, balances oil production, lightweight moisturiser", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "rosehip oil": { category: "Emollient Oil", benefit: "Rich in Vitamin A & C, fades scars and pigmentation, anti-ageing", concern: "May not be suitable for acne-prone skin due to high linoleic content", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "fragrance": { category: "Fragrance", benefit: "Adds scent to the product", concern: "Common allergen — can irritate sensitive or reactive skin, may trigger dermatitis", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "alcohol denat": { category: "Solvent / Preservative", benefit: "Helps other ingredients penetrate skin, light feel", concern: "Can be drying and disrupt the skin barrier with prolonged use", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "mineral oil": { category: "Occlusive", benefit: "Forms a barrier on skin to prevent water loss, extremely safe and non-sensitising", concern: "Can feel heavy — not ideal for oily/acne-prone skin", fungalAcneSafe: true, comedogenic: true, rating: "caution" },
  "dimethicone": { category: "Silicone", benefit: "Silky texture, smooths skin, helps ingredients penetrate", concern: "Not reef-safe. Can trap debris in pores for some skin types", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "parabens": { category: "Preservative", benefit: "Prevents microbial growth, extends shelf life", concern: "Debated endocrine disruption concerns at high concentrations — regulated to safe levels in cosmetics", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "sodium lauryl sulfate": { category: "Surfactant", benefit: "Creates lather, removes oil and dirt", concern: "Can be too stripping for dry or sensitive skin — disrupts the lipid barrier", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "sls": { category: "Surfactant", benefit: "Creates lather, removes oil and dirt", concern: "Can be too stripping for dry or sensitive skin — disrupts the lipid barrier", fungalAcneSafe: true, comedogenic: false, rating: "caution" },
  "polysorbate 20": { category: "Emulsifier", benefit: "Blends oil and water phases, helps spread product evenly", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "cocamidopropyl betaine": { category: "Surfactant", benefit: "Mild surfactant, creates soft lather, antistatic", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "water": { category: "Solvent / Base", benefit: "Base of most formulations, carries other ingredients", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "aqua": { category: "Solvent / Base", benefit: "Base of most formulations, carries other ingredients", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "aloe vera": { category: "Soothing", benefit: "Soothes irritation and redness, lightweight hydration", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "aloe barbadensis leaf juice": { category: "Soothing", benefit: "Soothes irritation and redness, lightweight hydration", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "panthenol": { category: "Humectant / Vitamin B5", benefit: "Soothes, moisturises, and helps repair the skin barrier", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "allantoin": { category: "Soothing", benefit: "Calms irritation, promotes cell renewal, safe for sensitive skin", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "tocopherol": { category: "Antioxidant / Vitamin E", benefit: "Antioxidant protection, moisturising, stabilises other ingredients", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "vitamin e": { category: "Antioxidant", benefit: "Antioxidant protection, moisturising, stabilises other ingredients", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "green tea extract": { category: "Antioxidant", benefit: "Anti-inflammatory, antioxidant, helps with oiliness and skin brightening", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "caffeine": { category: "Active", benefit: "Reduces puffiness and dark circles, antioxidant, improves microcirculation", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "bakuchiol": { category: "Active (Plant Retinol)", benefit: "Natural retinol alternative — anti-ageing, fewer side effects, pregnancy-safe", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "centella asiatica": { category: "Soothing", benefit: "Calms inflammation, aids wound healing, excellent for sensitive/acne skin", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "cica": { category: "Soothing", benefit: "Calms inflammation, aids wound healing, excellent for sensitive/acne skin", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "alpha arbutin": { category: "Brightening", benefit: "Inhibits melanin production, reduces dark spots and uneven tone with less irritation than hydroquinone", fungalAcneSafe: true, comedogenic: false, rating: "good" },
  "kojic dipalmitate": { category: "Brightening", benefit: "More stable form of kojic acid — reduces hyperpigmentation", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "ferulic acid": { category: "Antioxidant", benefit: "Boosts efficacy of Vitamins C and E, protects from UV damage", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "resveratrol": { category: "Antioxidant", benefit: "Potent antioxidant, anti-ageing, anti-inflammatory", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "coenzyme q10": { category: "Antioxidant", benefit: "Protects cells from oxidative damage, anti-ageing", fungalAcneSafe: false, comedogenic: false, rating: "good" },
  "aha": { category: "Chemical Exfoliant", benefit: "Exfoliates dead skin cells, brightens, improves texture", concern: "Increases photosensitivity — always use SPF", fungalAcneSafe: false, comedogenic: false, rating: "caution" },
  "bha": { category: "Chemical Exfoliant", benefit: "Oil-soluble exfoliant — unclogs pores, reduces acne", fungalAcneSafe: false, comedogenic: false, rating: "good" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedIngredient {
  raw: string;
  key: string;
  found: boolean;
  info?: typeof INGREDIENT_DB[string];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseIngredients(text: string): ParsedIngredient[] {
  return text
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const key = raw.toLowerCase().replace(/\s+/g, " ").trim();
      const found = key in INGREDIENT_DB;
      return { raw, key, found, info: INGREDIENT_DB[key] };
    });
}

const RATING_STYLES = {
  good: "bg-green-50 border-green-200 text-green-700",
  caution: "bg-amber-50 border-amber-200 text-amber-700",
  avoid: "bg-red-50 border-red-200 text-red-700",
};
const RATING_ICONS = {
  good: CheckCircle2,
  caution: AlertTriangle,
  avoid: X,
};

// ─── IngredientCard ────────────────────────────────────────────────────────────
function IngredientCard({ ingredient }: { ingredient: ParsedIngredient }) {
  const [expanded, setExpanded] = useState(false);

  if (!ingredient.found || !ingredient.info) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">{ingredient.raw}</span>
        <Badge variant="outline" className="text-xs text-muted-foreground">No data</Badge>
      </div>
    );
  }

  const { info } = ingredient;
  const Icon = RATING_ICONS[info.rating];

  return (
    <motion.div
      layout
      className={`rounded-xl border px-4 py-3 ${RATING_STYLES[info.rating]}`}
    >
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-semibold capitalize">{ingredient.raw}</span>
            <span className="ml-2 text-xs opacity-70">{info.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!info.fungalAcneSafe && (
            <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 bg-orange-50">
              FA Risk
            </Badge>
          )}
          {info.comedogenic && (
            <Badge variant="outline" className="text-[10px] border-red-300 text-red-600 bg-red-50">
              Comedogenic
            </Badge>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 pt-3 border-t border-current/10"
          >
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">Benefits: </span>{info.benefit}
            </p>
            {info.concern && (
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">Note: </span>{info.concern}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const IngredientAnalyzer = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ParsedIngredient[] | null>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setResults(parseIngredients(input));
  };

  const handleClear = () => {
    setInput("");
    setResults(null);
  };

  const goodCount = results?.filter((r) => r.info?.rating === "good").length ?? 0;
  const cautionCount = results?.filter((r) => r.info?.rating === "caution").length ?? 0;
  const unknownCount = results?.filter((r) => !r.found).length ?? 0;
  const fungalRisk = results?.filter((r) => r.found && !r.info?.fungalAcneSafe).length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Ingredient Analyzer — Decode Your Skincare"
        description="Paste any skincare ingredient list and instantly see what each ingredient does, which are beneficial, which to be cautious of, and fungal acne safety flags."
        canonical="/ingredient-analyzer"
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
                  Ingredient Analyzer
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Decode your skincare
                <br />
                <span className="text-gradient-teal italic">ingredient by ingredient</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Paste the ingredient list from any product label. We'll flag actives, allergens,
                fungal acne triggers, comedogenic ingredients, and more — in plain English.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Analyzer */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <form onSubmit={handleAnalyze} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Paste ingredient list
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Separate ingredients with commas or line breaks. Copy directly from a product label or website.
                </p>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  placeholder="Water, Niacinamide, Glycerin, Hyaluronic Acid, Retinol, Fragrance..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
                <div className="mt-4 flex gap-3">
                  <Button type="submit" className="flex-1 font-semibold gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analyze Ingredients
                  </Button>
                  {results && (
                    <Button type="button" variant="outline" onClick={handleClear}>
                      Clear
                    </Button>
                  )}
                </div>
              </form>

              {/* Results */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-8 space-y-6"
                  >
                    {/* Summary bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Beneficial", value: goodCount, className: "bg-green-50 border-green-200 text-green-700" },
                        { label: "Use Caution", value: cautionCount, className: "bg-amber-50 border-amber-200 text-amber-700" },
                        { label: "Unknown", value: unknownCount, className: "bg-secondary/50 border-border text-muted-foreground" },
                        { label: "Fungal Acne Risk", value: fungalRisk, className: "bg-orange-50 border-orange-200 text-orange-700" },
                      ].map(({ label, value, className }) => (
                        <div key={label} className={`rounded-xl border px-4 py-3 text-center ${className}`}>
                          <p className="font-display text-2xl font-bold">{value}</p>
                          <p className="text-xs font-medium mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Ingredient cards */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-display text-lg font-semibold text-foreground">
                          {results.length} ingredient{results.length !== 1 ? "s" : ""} analysed
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5" />
                          Click any ingredient for details
                        </div>
                      </div>
                      <div className="space-y-2">
                        {results.map((ing, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <IngredientCard ingredient={ing} />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Analysis is for educational purposes only. Consult a dermatologist for personalised advice.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default IngredientAnalyzer;
