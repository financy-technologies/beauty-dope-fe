import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DupeCard from "@/components/cards/DupeCard";
import { useDupes } from "@/hooks/api/useDupes";
import { useCategories } from "@/hooks/api/useCategories";
import { useSearchDupes } from "@/hooks/api/useSearch";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Package, ArrowRight, Layers } from "lucide-react";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "similarity",  label: "Best Match" },
  { value: "savings",     label: "Most Savings" },
  { value: "confidence",  label: "High Confidence" },
  { value: "rating",      label: "Top Rated" },
  { value: "created_at",  label: "Newest" },
] as const;

const PAGE_SIZE_DUPES    = 12;
const PAGE_SIZE_PRODUCTS = 16;

// ─── Product types ─────────────────────────────────────────────────────────────

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  normalizedPriceInr?: number;
  currency?: string;
  imageUrl?: string;
  category: string;
  subcategory?: string;
}

function formatPrice(price: number, currency?: string, normalizedInr?: number): string {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  const inr = normalizedInr ?? price;
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

// ─── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-elevated transition-all duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <span className="rounded-full bg-background/90 backdrop-blur-sm border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
            {product.subcategory ?? product.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="bg-white text-primary text-sm font-semibold rounded-xl px-4 py-2 shadow-lg flex items-center gap-1.5">
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      <div className="p-3.5 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{product.brand}</p>
        <p className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{product.name}</p>
        <p className="text-base font-bold text-primary mt-1">
          {formatPrice(product.price, product.currency, product.normalizedPriceInr)}
        </p>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square rounded-2xl" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

// ─── Products query hook ───────────────────────────────────────────────────────

function useAllProducts(options: {
  search?: string;
  limit?: number;
  category?: string;
  enabled: boolean;
}) {
  const { search = '', limit = PAGE_SIZE_PRODUCTS, category, enabled } = options;
  return useQuery<ProductItem[]>({
    queryKey: ['browse-products', { search, limit, category }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (search.length >= 2) params.set('q', search);
      if (category) params.set('category', category);
      const res = await api.get<ProductItem[]>(`/products?${params}`);
      return Array.isArray(res) ? res : [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Browse Page ───────────────────────────────────────────────────────────────

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const mode             = (searchParams.get("mode") as 'dupes' | 'products') || 'dupes';
  const categoryParam    = searchParams.get("category")    || undefined;
  const subcategoryParam = searchParams.get("subcategory") || undefined;
  const sortParam        = (searchParams.get("sort") as any) || "similarity";

  const initialQuery = searchParams.get("q") || "";
  const [searchQuery,    setSearchQuery]    = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // Simple limit-growth for "Load More" — no accumulator state needed
  const [dupeLimit,    setDupeLimit]    = useState(PAGE_SIZE_DUPES);
  const [productLimit, setProductLimit] = useState(PAGE_SIZE_PRODUCTS);

  const { data: categories } = useCategories();

  // ── Dupes ──────────────────────────────────────────────────────────────────
  const { data: dupes, isLoading: dupesLoading } = useDupes({
    category:    categoryParam,
    subcategory: subcategoryParam,
    sort:        sortParam,
    limit:       dupeLimit,
    offset:      0,                 // single growing window, no offset needed
  });

  const { data: searchResults, isLoading: isSearching } = useSearchDupes(debouncedQuery);

  // ── Products ───────────────────────────────────────────────────────────────
  const { data: products, isLoading: productsLoading } = useAllProducts({
    search:   debouncedQuery,
    limit:    productLimit,
    category: categoryParam,
    enabled:  mode === 'products',   // only fetch when in products mode
  });

  // Reset limits when filters / mode change so we don't carry over a big limit
  useEffect(() => {
    setDupeLimit(PAGE_SIZE_DUPES);
  }, [categoryParam, subcategoryParam, sortParam, mode]);

  useEffect(() => {
    setProductLimit(PAGE_SIZE_PRODUCTS);
  }, [categoryParam, debouncedQuery, mode]);

  // Derived display data — read directly from query results, no accumulator
  const displayDupes    = debouncedQuery.length >= 2 ? (searchResults ?? []) : (dupes ?? []);
  const displayProducts = products ?? [];

  const loading = mode === 'dupes'
    ? (debouncedQuery.length >= 2 ? isSearching : dupesLoading)
    : productsLoading;

  const isPending = searchQuery !== debouncedQuery && searchQuery.length >= 2;

  const activeCategory     = categories?.find((c) => c.slug === categoryParam);
  const subcategoryOptions = activeCategory?.subcategories ?? [];

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const setMode = (m: 'dupes' | 'products') => {
    const next = new URLSearchParams(searchParams);
    if (m === 'dupes') next.delete('mode');       // default, keep URL clean
    else next.set('mode', m);
    next.delete('sort');
    next.delete('subcategory');
    setSearchParams(next, { replace: true });
  };

  // Sync search state when URL changes externally (e.g. back button)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    setDebouncedQuery(q);
  }, [searchParams]);

  const handleChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value) {
      setDebouncedQuery("");
      setParam("q", undefined);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim());
      setParam("q", value.trim() || undefined);
    }, 350);
  };

  const handleClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setParam("q", undefined);
    inputRef.current?.focus();
  };

  // Ctrl/Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const dupeHasMore    = !debouncedQuery && (dupes?.length ?? 0) >= dupeLimit;
  const productHasMore = (products?.length ?? 0) >= productLimit;

  const pageTitle = mode === 'products'
    ? (categoryParam
        ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Products`
        : 'Browse All Products')
    : (subcategoryParam
        ? subcategoryParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Dupes'
        : categoryParam
        ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + ' Dupes'
        : 'Browse All Dupes');

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={pageTitle}
        description={
          mode === 'products'
            ? 'Discover skincare and makeup products with ingredient analysis, SkinEvora scores, and affordable dupes on Skinevora.'
            : 'Browse 2,500+ ingredient-matched dupes for luxury skincare and makeup on Skinevora.'
        }
        canonical="/browse"
      />
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6">

        {/* ── Mode toggle + Title ─────────────────────────────── */}
        <div className="mb-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{pageTitle}</h1>

            <div className="flex items-center bg-muted rounded-xl p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMode('dupes')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                  mode === 'dupes'
                    ? 'bg-background text-primary shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className="h-4 w-4" /> Dupes
              </button>
              <button
                type="button"
                onClick={() => setMode('products')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                  mode === 'products'
                    ? 'bg-background text-primary shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Package className="h-4 w-4" /> Products
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              {isPending || (debouncedQuery.length >= 2 && isSearching) ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                ref={inputRef}
                placeholder={
                  mode === 'products'
                    ? "Search products by brand or name…"
                    : "Search dupes by brand or product… (⌘K)"
                }
                value={searchQuery}
                onChange={(e) => handleChange(e.target.value)}
                className="pl-9 pr-9"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active search label */}
          {debouncedQuery.length >= 2 && (
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Searching…"
                : mode === 'dupes'
                ? `${displayDupes.length} dupe${displayDupes.length !== 1 ? "s" : ""} for "${debouncedQuery}"`
                : `${displayProducts.length} product${displayProducts.length !== 1 ? "s" : ""} for "${debouncedQuery}"`}
            </p>
          )}

          {/* Dupes-only sort + subcategory filters */}
          {mode === 'dupes' && !debouncedQuery && (
            <>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={sortParam === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParam("sort", opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              {subcategoryOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!subcategoryParam ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setParam("subcategory", undefined)}
                  >
                    All
                  </Button>
                  {subcategoryOptions.map((sub) => (
                    <Button
                      key={sub}
                      variant={subcategoryParam === sub ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setParam("subcategory", sub)}
                      className="capitalize"
                    >
                      {sub.replace(/-/g, ' ')}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Dupes Grid ─────────────────────────────────────── */}
        {mode === 'dupes' && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dupesLoading && displayDupes.length === 0
                ? [...Array(PAGE_SIZE_DUPES)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : displayDupes.length === 0 && !loading
                ? (
                  <div className="col-span-full py-16 text-center">
                    <Search className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">No dupes found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try a different search or browse by category.
                    </p>
                  </div>
                )
                : displayDupes.map((dupe) => (
                    <DupeCard
                      key={dupe.id}
                      id={dupe.id}
                      original={dupe.original}
                      dupe={dupe.dupe}
                      similarityScore={dupe.similarityScore}
                      category={dupe.category}
                      savingsPercent={dupe.savingsPercent}
                      dupeLabel={(dupe as any).dupeLabel}
                      sharedActives={(dupe as any).sharedActives ?? []}
                    />
                  ))}
            </div>

            {/* Load more — grows the limit, re-queries */}
            {!debouncedQuery && dupeHasMore && !dupesLoading && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 gap-2"
                  onClick={() => setDupeLimit((l) => l + PAGE_SIZE_DUPES)}
                >
                  Load more dupes
                </Button>
                <p className="text-xs text-muted-foreground">Showing {displayDupes.length}</p>
              </div>
            )}
            {dupesLoading && displayDupes.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </>
        )}

        {/* ── Products Grid ───────────────────────────────────── */}
        {mode === 'products' && (
          <>
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {productsLoading && displayProducts.length === 0
                ? [...Array(PAGE_SIZE_PRODUCTS)].map((_, i) => <ProductSkeleton key={i} />)
                : displayProducts.length === 0 && !productsLoading
                ? (
                  <div className="col-span-full py-16 text-center">
                    <Package className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">No products found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try a different search term.
                    </p>
                  </div>
                )
                : displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>

            {/* Load more — grows the limit, re-queries */}
            {productHasMore && !productsLoading && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 gap-2"
                  onClick={() => setProductLimit((l) => l + PAGE_SIZE_PRODUCTS)}
                >
                  Load more products
                </Button>
                <p className="text-xs text-muted-foreground">Showing {displayProducts.length}</p>
              </div>
            )}
            {productsLoading && displayProducts.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Browse;
