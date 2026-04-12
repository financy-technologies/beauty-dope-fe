import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Sparkles, ShieldCheck, Zap, X, ArrowRight, TrendingUp, Layers, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useSearchDupes } from "@/hooks/api/useSearch";
import { useProductSearch } from "@/hooks/api/useProductDetail";
import type { DupeWithProducts } from "@/integrations/supabase/types";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TRUST_PILLS = [
  { icon: ShieldCheck, label: "Ingredient-verified" },
  { icon: Zap,         label: "2,500+ dupes" },
  { icon: Sparkles,    label: "AI-matched" },
];

const POPULAR_BRANDS = ["Charlotte Tilbury", "Drunk Elephant", "La Mer", "Tom Ford", "Tatcha", "NARS"];

const CATEGORIES = [
  { label: "Skincare",  href: "/browse?category=skincare", emoji: "🧴" },
  { label: "Makeup",    href: "/browse?category=makeup",   emoji: "💄" },
  { label: "Trending",  href: "/browse?sort=trending",     emoji: "🔥" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Pill({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
    >
      {children}
    </button>
  );
}

function SimilarityBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    score >= 75 ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none ${color}`}>
      {score}% match
    </span>
  );
}

function SavingsBadge({ pct }: { pct: number }) {
  return (
    <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold leading-none text-rose-700">
      Save {pct}%
    </span>
  );
}

// ─── Suggestion item ───────────────────────────────────────────────────────────
function SuggestionItem({
  dupe,
  isFocused,
  onClick,
}: {
  dupe: DupeWithProducts;
  isFocused: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isFocused ? "bg-primary/8" : "hover:bg-muted/60"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={dupe.original.image || "/placeholder.svg"}
          alt={dupe.original.name}
          className="h-10 w-10 rounded-lg object-cover bg-muted"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
        <img
          src={dupe.dupe.image || "/placeholder.svg"}
          alt={dupe.dupe.name}
          className="h-7 w-7 rounded-lg object-cover bg-muted border-2 border-background absolute -bottom-1.5 -right-1.5"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {dupe.original.brand} {dupe.original.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Dupe: <span className="text-foreground/80">{dupe.dupe.brand} {dupe.dupe.name}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <SimilarityBadge score={dupe.similarityScore} />
            {dupe.savingsPercent > 0 && <SavingsBadge pct={dupe.savingsPercent} />}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-10 w-10 rounded-lg bg-muted animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
    </div>
  );
}

// ─── Product suggestion item ───────────────────────────────────────────────────
function ProductSuggestionItem({
  product,
  onClick,
}: {
  product: { id: string; name: string; brand: string; price: number; imageUrl?: string; normalizedPriceInr?: number; currency?: string };
  onClick: () => void;
}) {
  const price = product.currency === 'USD'
    ? `$${product.price.toLocaleString()}`
    : `₹${Math.round(product.normalizedPriceInr ?? product.price).toLocaleString('en-IN')}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
    >
      <div className="h-9 w-9 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
        ) : (
          <Package className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-tight">{product.brand} {product.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{price}</p>
      </div>
      <span className="text-[10px] font-semibold rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 shrink-0">Product</span>
    </button>
  );
}

// ─── Suggestions dropdown ──────────────────────────────────────────────────────
function SuggestionsDropdown({
  query,
  dupeResults,
  productResults,
  isLoading,
  focusedIndex,
  onSelectDupe,
  onSelectProduct,
  onBrandClick,
}: {
  query: string;
  dupeResults: DupeWithProducts[] | undefined;
  productResults: { id: string; name: string; brand: string; price: number; imageUrl?: string; normalizedPriceInr?: number; currency?: string }[] | undefined;
  isLoading: boolean;
  focusedIndex: number;
  onSelectDupe: (id: string) => void;
  onSelectProduct: (id: string) => void;
  onBrandClick: (brand: string) => void;
}) {
  const navigate = useNavigate();
  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;
  const hasDupes = (dupeResults?.length ?? 0) > 0;
  const hasProducts = (productResults?.length ?? 0) > 0;
  const hasAny = hasDupes || hasProducts;

  return (
    <motion.div
      key="dropdown"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border bg-background shadow-elevated overflow-hidden"
    >
      {/* ── Idle / short query: popular + categories ────────── */}
      {!isSearching && (
        <>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Popular brands
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_BRANDS.map((b) => (
                <Pill key={b} onClick={() => onBrandClick(b)}>{b}</Pill>
              ))}
            </div>
          </div>

          <div className="border-t border-border px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Layers className="h-3 w-3" /> Browse by category
            </p>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  to={c.href}
                  className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-center text-xs font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="block text-base mb-0.5">{c.emoji}</span>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Loading skeletons ────────────────────────────────── */}
      {isSearching && isLoading && (
        <div className="py-1">
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Searching…
          </p>
          {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {isSearching && !isLoading && hasAny && (
        <div className="max-h-96 overflow-y-auto">
          {/* Dupes section */}
          {hasDupes && (
            <>
              <div className="px-4 py-2 bg-muted/30 border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-primary" /> Dupe matches
                </p>
              </div>
              <div className="divide-y divide-border/60">
                {dupeResults!.slice(0, 4).map((dupe, i) => (
                  <SuggestionItem
                    key={dupe.id}
                    dupe={dupe}
                    isFocused={focusedIndex === i}
                    onClick={() => onSelectDupe(dupe.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Products section */}
          {hasProducts && (
            <>
              <div className="px-4 py-2 bg-muted/30 border-t border-b border-border">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-primary" /> Individual products
                </p>
              </div>
              <div className="divide-y divide-border/60">
                {productResults!.slice(0, 4).map((product) => (
                  <ProductSuggestionItem
                    key={product.id}
                    product={product}
                    onClick={() => onSelectProduct(product.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer CTA when we have results */}
      {isSearching && !isLoading && hasAny && (
        <div className="border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={() => navigate(`/browse?q=${encodeURIComponent(trimmed)}`)}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2 py-0.5"
          >
            View all results for "{trimmed}"
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── No results ───────────────────────────────────────── */}
      {isSearching && !isLoading && !hasAny && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground mb-1">No results found for "{trimmed}"</p>
          <p className="text-xs text-muted-foreground mb-4">
            Try a different brand name or browse all categories.
          </p>
          <button
            type="button"
            onClick={() => navigate("/browse?mode=products")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2"
          >
            Browse all products <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen]             = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const navigate     = useNavigate();

  const { data: dupeResults, isLoading: dupesLoading } = useSearchDupes(debouncedQuery);
  const { data: productResults, isLoading: productsLoading } = useProductSearch(debouncedQuery);
  const isLoading = dupesLoading || productsLoading;

  // Debounce the API query (300ms)
  const handleChange = (value: string) => {
    setSearchQuery(value);
    setFocusedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 300);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    const count = Math.min((dupeResults?.length ?? 0) + (productResults?.length ?? 0), 8);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, count - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && dupeResults?.[focusedIndex]) {
        handleSelectDupe(dupeResults[focusedIndex].id);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSelectDupe = useCallback((id: string) => {
    setIsOpen(false);
    navigate(`/dupe/${id}`);
  }, [navigate]);

  const handleSelectProduct = useCallback((id: string) => {
    setIsOpen(false);
    navigate(`/product/${id}`);
  }, [navigate]);

  const handleBrandClick = useCallback((brand: string) => {
    setSearchQuery(brand);
    setDebouncedQuery(brand);
    setIsOpen(true);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    setIsOpen(false);
    const q = searchQuery.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  const handleClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setFocusedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="container relative px-4 py-24 md:py-36 md:px-6">
        <div className="mx-auto max-w-4xl text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Science-backed beauty dupes
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Luxury Look.
            <br />
            <span className="text-gradient-teal italic">Half the Price.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            Skinevora matches luxury skincare &amp; makeup products with affordable dupes
            using ingredient science — not guesswork.
          </motion.p>

          {/* ── Search box + dropdown ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            {/* Input row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Input + dropdown wrapper */}
              <div ref={containerRef} className="relative flex-1">
                {/* Search icon */}
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />

                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search a product or brand, e.g. La Mer…"
                  value={searchQuery}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-14 rounded-xl border-border/60 bg-background/85 pl-12 pr-10 text-base shadow-card backdrop-blur-sm focus-visible:ring-primary"
                />

                {/* Clear button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors z-10"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {isOpen && (
                    <SuggestionsDropdown
                      query={searchQuery}
                      dupeResults={dupeResults}
                      productResults={productResults as any}
                      isLoading={isLoading}
                      focusedIndex={focusedIndex}
                      onSelectDupe={handleSelectDupe}
                      onSelectProduct={handleSelectProduct}
                      onBrandClick={handleBrandClick}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                className="h-14 rounded-xl px-8 font-semibold shadow-gold tracking-wide gap-2"
              >
                Find Dupes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Popular
            </span>
            {POPULAR_BRANDS.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => handleBrandClick(brand)}
                className="text-sm text-foreground/70 underline underline-offset-4 decoration-primary/30 transition-colors hover:text-primary hover:decoration-primary"
              >
                {brand}
              </button>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/30 to-transparent" />
    </section>
  );
};

export default Hero;
