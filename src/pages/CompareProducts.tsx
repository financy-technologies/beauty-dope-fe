import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, Search, X, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  subcategory?: string;
  description?: string;
  image_url?: string;
  ingredients?: string;
}

interface SearchResults {
  data?: Product[];
}

// ─── Ingredient helpers ───────────────────────────────────────────────────────
const BENEFICIAL = new Set([
  "niacinamide", "hyaluronic acid", "retinol", "vitamin c", "ascorbic acid",
  "ceramide", "ceramides", "peptides", "zinc oxide", "titanium dioxide",
  "squalane", "azelaic acid", "tranexamic acid", "bakuchiol", "alpha arbutin",
  "panthenol", "allantoin", "caffeine", "centella asiatica",
]);
const CAUTION = new Set([
  "fragrance", "alcohol denat", "parabens", "sodium lauryl sulfate", "sls",
  "mineral oil", "dimethicone", "glycolic acid", "lactic acid",
]);

function categoriseIngredients(raw: string) {
  const list = raw
    .split(/,|\n/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const beneficial: string[] = [];
  const caution: string[] = [];
  const neutral: string[] = [];
  list.forEach((ing) => {
    if (BENEFICIAL.has(ing)) beneficial.push(ing);
    else if (CAUTION.has(ing)) caution.push(ing);
    else neutral.push(ing);
  });
  return { beneficial, caution, neutral, all: list };
}

function sharedIngredients(a: string[], b: string[]) {
  const setB = new Set(b);
  return a.filter((i) => setB.has(i));
}

function similarity(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const shared = sharedIngredients(a, b).length;
  const union = new Set([...a, ...b]).size;
  return Math.round((shared / union) * 100);
}

// ─── ProductSlot ──────────────────────────────────────────────────────────────
function ProductSlot({
  product,
  onRemove,
  onSelect,
  index,
}: {
  product: Product | null;
  onRemove: () => void;
  onSelect: (p: Product) => void;
  index: number;
}) {
  const [query, setQuery] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["compare-search", query],
    queryFn: async () => {
      if (query.length < 2) return { data: [] } as SearchResults;
      return api.get<SearchResults>(`/products?q=${encodeURIComponent(query)}&limit=6`);
    },
    enabled: query.length >= 2,
    staleTime: 10_000,
  });

  const suggestions: Product[] = (data as SearchResults)?.data ?? [];

  if (product) {
    const ing = product.ingredients ? categoriseIngredients(product.ingredients) : null;
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="relative bg-secondary/30 px-5 pt-5 pb-4">
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="mx-auto h-28 w-28 object-cover rounded-xl shadow-soft"
            />
          ) : (
            <div className="mx-auto h-28 w-28 rounded-xl bg-muted flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-muted-foreground">
                {product.brand.charAt(0)}
              </span>
            </div>
          )}
          <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="mt-1 text-center font-display text-base font-semibold text-foreground leading-snug">
            {product.name}
          </h3>
          <p className="mt-2 text-center font-display text-xl font-bold text-primary">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">{product.category}</Badge>
            {product.subcategory && (
              <Badge variant="outline" className="text-xs">{product.subcategory}</Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-4">
          {product.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          {ing && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingredient Profile
              </p>
              {ing.beneficial.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Beneficial actives</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ing.beneficial.map((i) => (
                      <span key={i} className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700 capitalize">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {ing.caution.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Caution ingredients</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ing.caution.map((i) => (
                      <span key={i} className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] text-amber-700 capitalize">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {ing.all.length} total ingredients
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty slot — search
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/10 p-5 flex flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Plus className="h-7 w-7 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">Add product {index + 1}</p>
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search product name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {query.length >= 2 && (
        <div className="w-full rounded-xl border border-border bg-card shadow-soft overflow-hidden max-h-56 overflow-y-auto">
          {isFetching ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching…</div>
          ) : suggestions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No products found</div>
          ) : (
            suggestions.map((p) => (
              <button
                key={p.id}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                onClick={() => { onSelect(p); setQuery(""); }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · ₹{p.price.toLocaleString("en-IN")}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const CompareProducts = () => {
  const [products, setProducts] = useState<(Product | null)[]>([null, null]);

  const addSlot = () => {
    if (products.length < 4) setProducts((p) => [...p, null]);
  };

  const removeProduct = (index: number) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const setProduct = (index: number, product: Product) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = product;
      return next;
    });
  };

  // Similarity between first two filled products
  const filled = products.filter(Boolean) as Product[];
  let simScore: number | null = null;
  let sharedIngs: string[] = [];
  if (filled.length >= 2 && filled[0].ingredients && filled[1].ingredients) {
    const a = categoriseIngredients(filled[0].ingredients).all;
    const b = categoriseIngredients(filled[1].ingredients).all;
    simScore = similarity(a, b);
    sharedIngs = sharedIngredients(a, b);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compare Skincare Products Side by Side"
        description="Compare up to 4 skincare products side-by-side on Skinevora. See shared ingredients, unique actives, and an ingredient similarity score to find your best match."
        canonical="/compare"
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
                <GitCompareArrows className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  Compare Products
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Side-by-side
                <br />
                <span className="text-gradient-teal italic">ingredient comparison</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Add up to 4 products and instantly see shared ingredients, unique actives,
                and a similarity score to find your best match.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Compare grid */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">

            {/* Similarity banner */}
            <AnimatePresence>
              {simScore !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="currentColor" strokeWidth="3"
                          strokeDasharray={`${simScore} ${100 - simScore}`}
                          className="text-primary transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-primary">
                        {simScore}%
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Ingredient Similarity</p>
                      <p className="text-sm text-muted-foreground">
                        {sharedIngs.length} shared ingredient{sharedIngs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {sharedIngs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {sharedIngs.slice(0, 12).map((ing) => (
                        <span key={ing} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary capitalize">
                          {ing}
                        </span>
                      ))}
                      {sharedIngs.length > 12 && (
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] text-primary">
                          +{sharedIngs.length - 12} more
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`grid gap-5 ${
              products.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : products.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            }`}>
              {products.map((product, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ProductSlot
                    product={product}
                    onRemove={() => removeProduct(i)}
                    onSelect={(p) => setProduct(i, p)}
                    index={i}
                  />
                </motion.div>
              ))}
            </div>

            {products.length < 4 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={addSlot} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add another product
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default CompareProducts;
