import { useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, Search, X, CheckCircle2, AlertTriangle, Plus, Loader2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";
import INGREDIENT_DB from "@/data/ingredientDb";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  subcategory?: string;
  description?: string;
  imageUrl?: string;
  ingredients?: string;
}

// ─── Ingredient helpers ───────────────────────────────────────────────────────
const DB_KEYS = Object.keys(INGREDIENT_DB);

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\d+(\.\d+)?%/g, "")
    .replace(/[^a-z0-9 /\-,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lookupIngredient(raw: string) {
  const key = normalize(raw);
  if (!key) return null;
  if (INGREDIENT_DB[key]) return { key, info: INGREDIENT_DB[key] };
  const withoutTrailing = key.replace(/\s+\w{1,3}$/, "");
  if (withoutTrailing !== key && INGREDIENT_DB[withoutTrailing]) return { key: withoutTrailing, info: INGREDIENT_DB[withoutTrailing] };
  for (const dbKey of DB_KEYS) {
    if (dbKey.length >= 4 && (key.includes(dbKey) || dbKey.includes(key))) {
      return { key: dbKey, info: INGREDIENT_DB[dbKey] };
    }
  }
  return null;
}

interface ParsedIng {
  raw: string;
  normalized: string;
  rating: "good" | "caution" | "avoid" | "unknown";
  category?: string;
}

function parseIngredientList(raw: string): ParsedIng[] {
  return raw
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((r) => {
      const match = lookupIngredient(r);
      return {
        raw: r,
        normalized: normalize(r),
        rating: match?.info.rating ?? "unknown" as const,
        category: match?.info.category,
      };
    });
}

function sharedIngredients(a: ParsedIng[], b: ParsedIng[]) {
  const setB = new Set(b.map((i) => i.normalized));
  return a.filter((i) => setB.has(i.normalized));
}

function similarity(a: ParsedIng[], b: ParsedIng[]) {
  if (!a.length || !b.length) return 0;
  const shared = sharedIngredients(a, b).length;
  const union = new Set([...a.map((i) => i.normalized), ...b.map((i) => i.normalized)]).size;
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
  const [inputValue, setInputValue]     = useState("");
  const [debouncedQ, setDebouncedQ]     = useState("");
  const [isDropOpen, setIsDropOpen]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: wait 300 ms after the user stops typing before firing the query
  const handleChange = (value: string) => {
    setInputValue(value);
    setIsDropOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => setDebouncedQ(value.trim()), 300);
    } else {
      setDebouncedQ("");
    }
  };

  // API returns Product[] directly (not { data: Product[] })
  const { data: suggestions = [], isFetching } = useQuery<Product[]>({
    queryKey: ["compare-search", debouncedQ],
    queryFn: () =>
      api.get<Product[]>(`/products?q=${encodeURIComponent(debouncedQ)}&limit=8`),
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  });

  const handleSelect = (p: Product) => {
    onSelect(p);
    setInputValue("");
    setDebouncedQ("");
    setIsDropOpen(false);
  };

  // ── Filled slot ──────────────────────────────────────────────────────────────
  if (product) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative bg-secondary/30 px-5 pt-5 pb-4">
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Remove product"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="mx-auto h-28 w-28 object-cover rounded-xl shadow-soft"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
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
          <div className="mt-2 flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{product.category}</Badge>
            {product.subcategory && (
              <Badge variant="outline" className="text-xs">{product.subcategory}</Badge>
            )}
          </div>
        </div>
        {product.description && (
          <div className="px-5 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Empty slot — search input + dropdown ─────────────────────────────────────
  const showDropdown = isDropOpen && inputValue.trim().length >= 2;

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/10 p-5 flex flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Plus className="h-7 w-7 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">Add product {index + 1}</p>

      {/* Search input */}
      <div className="w-full relative">
        <div className="relative">
          {isFetching ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder="Search brand or product name…"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsDropOpen(true)}
            onBlur={() => setTimeout(() => setIsDropOpen(false), 150)}
            className="pl-9 pr-8"
            autoComplete="off"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(""); setDebouncedQ(""); setIsDropOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 rounded-xl border border-border bg-background shadow-elevated overflow-hidden max-h-60 overflow-y-auto"
            >
              {/* Loading */}
              {isFetching && (
                <div className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              )}

              {/* No results */}
              {!isFetching && suggestions.length === 0 && (
                <div className="py-5 px-4 text-center">
                  <p className="text-sm font-medium text-foreground">No products found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a different brand or product name.
                  </p>
                </div>
              )}

              {/* Results */}
              {!isFetching && suggestions.length > 0 && (
                <div className="divide-y divide-border/60">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                      onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                      onClick={() => handleSelect(p)}
                    >
                      {/* Brand initial avatar */}
                      <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {p.brand.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.brand}
                          {p.price ? ` · ₹${Number(p.price).toLocaleString("en-IN")}` : ""}
                        </p>
                      </div>
                      {p.category && (
                        <span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground flex-shrink-0">
                          {p.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Type at least 2 characters to search
      </p>
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

  const filled = products.filter(Boolean) as Product[];
  const canCompare = filled.length >= 2;

  const parsedLists = filled.map((p) =>
    p.ingredients ? parseIngredientList(p.ingredients) : []
  );
  const bothHaveIngredients = canCompare && parsedLists[0].length > 0 && parsedLists[1].length > 0;

  let simScore: number | null = null;
  let sharedIngs: ParsedIng[] = [];
  let uniqueA: ParsedIng[] = [];
  let uniqueB: ParsedIng[] = [];
  if (bothHaveIngredients) {
    simScore = similarity(parsedLists[0], parsedLists[1]);
    sharedIngs = sharedIngredients(parsedLists[0], parsedLists[1]);
    const sharedSet = new Set(sharedIngs.map((i) => i.normalized));
    uniqueA = parsedLists[0].filter((i) => !sharedSet.has(i.normalized));
    uniqueB = parsedLists[1].filter((i) => !sharedSet.has(i.normalized));
  }

  const priceDiff = canCompare ? Math.abs(filled[0].price - filled[1].price) : 0;
  const cheaperIdx = canCompare ? (filled[0].price <= filled[1].price ? 0 : 1) : 0;

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

            {/* ── Comparison Results ─────────────────────────────────────── */}
            <AnimatePresence>
              {canCompare && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-10 space-y-6"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground text-center">
                    Comparison Results
                  </h2>

                  {/* Price comparison */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Price Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {filled.slice(0, 2).map((p, i) => (
                        <div key={p.id} className={`rounded-xl p-4 text-center ${i === cheaperIdx ? "bg-green-50 border border-green-200" : "bg-secondary/30 border border-border"}`}>
                          <p className="text-xs text-muted-foreground truncate">{p.brand}</p>
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="font-display text-2xl font-bold mt-1 text-primary">
                            ₹{p.price.toLocaleString("en-IN")}
                          </p>
                          {i === cheaperIdx && priceDiff > 0 && (
                            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-xs">
                              Cheaper by ₹{priceDiff.toLocaleString("en-IN")}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    {priceDiff > 0 && (
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        You save {Math.round((priceDiff / filled[1 - cheaperIdx].price) * 100)}% by choosing {filled[cheaperIdx].brand} {filled[cheaperIdx].name}
                      </p>
                    )}
                  </div>

                  {/* Category & type comparison */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Product Details</h3>
                    <div className="divide-y divide-border">
                      {[
                        { label: "Brand", values: filled.slice(0, 2).map((p) => p.brand) },
                        { label: "Category", values: filled.slice(0, 2).map((p) => p.category) },
                        { label: "Subcategory", values: filled.slice(0, 2).map((p) => p.subcategory || "—") },
                        { label: "Ingredients listed", values: filled.slice(0, 2).map((_, i) => parsedLists[i]?.length ? `${parsedLists[i].length}` : "Not available") },
                      ].map(({ label, values }) => (
                        <div key={label} className="grid grid-cols-[120px_1fr_1fr] gap-3 py-3 items-center">
                          <span className="text-xs font-medium text-muted-foreground">{label}</span>
                          <span className={`text-sm ${values[0] === values[1] ? "text-foreground" : "font-semibold text-foreground"}`}>
                            {values[0]}
                          </span>
                          <span className={`text-sm ${values[0] === values[1] ? "text-foreground" : "font-semibold text-foreground"}`}>
                            {values[1]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ingredient similarity */}
                  {bothHaveIngredients && (
                    <>
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                              <circle
                                cx="18" cy="18" r="15.9" fill="none"
                                stroke="currentColor" strokeWidth="3"
                                strokeDasharray={`${simScore} ${100 - simScore!}`}
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
                              {sharedIngs.length} shared · {uniqueA.length} unique to Product 1 · {uniqueB.length} unique to Product 2
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shared ingredients */}
                      {sharedIngs.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <GitCompareArrows className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">
                              Shared Ingredients ({sharedIngs.length})
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sharedIngs.map((ing) => (
                              <span
                                key={ing.normalized}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize border ${
                                  ing.rating === "good"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : ing.rating === "caution"
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : ing.rating === "avoid"
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-secondary/50 border-border text-muted-foreground"
                                }`}
                              >
                                {ing.raw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unique to each product */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {[
                          { label: filled[0].name, items: uniqueA },
                          { label: filled[1].name, items: uniqueB },
                        ].map(({ label, items }, idx) => (
                          <div key={idx} className="rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <FlaskConical className="h-4 w-4 text-primary" />
                              <h3 className="text-sm font-semibold text-foreground truncate">
                                Only in {label}
                              </h3>
                              <Badge variant="outline" className="text-[10px] ml-auto flex-shrink-0">
                                {items.length}
                              </Badge>
                            </div>
                            {items.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No unique ingredients</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {items.map((ing) => (
                                  <span
                                    key={ing.normalized}
                                    className={`rounded-full px-2 py-0.5 text-[11px] capitalize border ${
                                      ing.rating === "good"
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : ing.rating === "caution"
                                        ? "bg-amber-50 border-amber-200 text-amber-700"
                                        : ing.rating === "avoid"
                                        ? "bg-red-50 border-red-200 text-red-700"
                                        : "bg-secondary/50 border-border text-muted-foreground"
                                    }`}
                                  >
                                    {ing.raw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quick summary */}
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Ingredient Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {filled.slice(0, 2).map((p, i) => {
                            const ings = parsedLists[i];
                            const good = ings.filter((x) => x.rating === "good").length;
                            const caution = ings.filter((x) => x.rating === "caution").length;
                            const avoid = ings.filter((x) => x.rating === "avoid").length;
                            return (
                              <div key={p.id} className="space-y-2">
                                <p className="text-xs font-semibold truncate">{p.name}</p>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 bg-secondary/40 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(good / ings.length) * 100}%` }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-6 text-right">{good}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                  <div className="flex-1 bg-secondary/40 rounded-full h-2">
                                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(caution / ings.length) * 100}%` }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-6 text-right">{caution}</span>
                                </div>
                                {avoid > 0 && (
                                  <div className="flex items-center gap-2">
                                    <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                    <div className="flex-1 bg-secondary/40 rounded-full h-2">
                                      <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(avoid / ings.length) * 100}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6 text-right">{avoid}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* No ingredients message */}
                  {!bothHaveIngredients && (
                    <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center">
                      <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Ingredient data not available</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        One or both products don't have ingredient lists in our database yet. Price and category comparison is shown above.
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Comparison is for informational purposes only. Ingredient positions may not reflect exact concentrations.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default CompareProducts;
