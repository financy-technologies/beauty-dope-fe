import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import INGREDIENT_DB, { type IngredientInfo } from "@/data/ingredientDb";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedIngredient {
  raw: string;
  key: string;
  found: boolean;
  info?: IngredientInfo;
}

// ─── Matching engine ─────────────────────────────────────────────────────────
const DB_KEYS = Object.keys(INGREDIENT_DB);

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")    // strip parentheticals
    .replace(/\d+(\.\d+)?%/g, "")      // strip percentages
    .replace(/[^a-z0-9 /\-,]/g, " ")   // keep alphanumeric, slashes, hyphens
    .replace(/\s+/g, " ")
    .trim();
}

function findIngredient(raw: string): IngredientInfo | undefined {
  const key = normalize(raw);
  if (!key) return undefined;

  // 1. Exact match
  if (INGREDIENT_DB[key]) return INGREDIENT_DB[key];

  // 2. Try without trailing numbers/letters (e.g. "ceramide np" → "ceramide")
  const withoutTrailing = key.replace(/\s+\w{1,3}$/, "");
  if (withoutTrailing !== key && INGREDIENT_DB[withoutTrailing]) return INGREDIENT_DB[withoutTrailing];

  // 3. Check if any DB key is contained within the input or vice versa
  for (const dbKey of DB_KEYS) {
    if (dbKey.length >= 4 && (key.includes(dbKey) || dbKey.includes(key))) {
      return INGREDIENT_DB[dbKey];
    }
  }

  // 4. Try matching the parenthetical content from the original raw input
  const parenMatch = raw.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parenKey = normalize(parenMatch[1]);
    if (INGREDIENT_DB[parenKey]) return INGREDIENT_DB[parenKey];
    for (const dbKey of DB_KEYS) {
      if (dbKey.length >= 4 && (parenKey.includes(dbKey) || dbKey.includes(parenKey))) {
        return INGREDIENT_DB[dbKey];
      }
    }
  }

  return undefined;
}

function parseIngredients(text: string): ParsedIngredient[] {
  return text
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const info = findIngredient(raw);
      return { raw, key: normalize(raw), found: !!info, info };
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

// ─── Example pre-fill ─────────────────────────────────────────────────────────
const EXAMPLE_INGREDIENTS = "Water, Glycerin, Niacinamide, Sodium Hyaluronate, Ceramide NP, Salicylic Acid, Tocopherol, Dimethicone, Fragrance, Retinol, Aloe Barbadensis Leaf Juice, Panthenol";

// ─── Page ──────────────────────────────────────────────────────────────────────
const IngredientAnalyzer = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ParsedIngredient[] | null>(() => parseIngredients(EXAMPLE_INGREDIENTS));
  const [isExample, setIsExample] = useState(true);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsExample(false);
    setResults(parseIngredients(input));
  };

  const handleClear = () => {
    setInput("");
    setResults(null);
    setIsExample(false);
  };

  const handleTryExample = () => {
    setInput(EXAMPLE_INGREDIENTS);
    setIsExample(false);
    setResults(parseIngredients(EXAMPLE_INGREDIENTS));
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

              {/* Example banner */}
              {isExample && results && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <p className="text-sm text-primary">
                    <span className="font-semibold">Sample analysis below</span> — paste your own ingredient list above to get started.
                  </p>
                  <Button size="sm" variant="outline" onClick={handleTryExample} className="flex-shrink-0 text-xs">
                    Copy example to editor
                  </Button>
                </motion.div>
              )}

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
