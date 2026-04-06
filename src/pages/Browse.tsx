import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DupeCard from "@/components/cards/DupeCard";
import { useDupes } from "@/hooks/api/useDupes";
import { useCategories } from "@/hooks/api/useCategories";
import { useSearchDupes } from "@/hooks/api/useSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";

const SORT_OPTIONS = [
  { value: "similarity",  label: "Best Match" },
  { value: "savings",     label: "Most Savings" },
  { value: "confidence",  label: "High Confidence" },
  { value: "rating",      label: "Top Rated" },
  { value: "created_at",  label: "Newest" },
] as const;

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam    = searchParams.get("category")   || undefined;
  const subcategoryParam = searchParams.get("subcategory") || undefined;
  const sortParam        = (searchParams.get("sort") as any) || "similarity";

  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery]   = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();

  const { data: dupes, isLoading } = useDupes({
    category:    categoryParam,
    subcategory: subcategoryParam,
    sort:        sortParam,
    limit:       24,
  });

  const { data: searchResults, isLoading: isSearching } = useSearchDupes(debouncedQuery);

  const displayDupes = debouncedQuery.length >= 2 ? searchResults : dupes;
  const loading      = debouncedQuery.length >= 2 ? isSearching  : isLoading;
  // Show spinner only when user has typed but debounce hasn't fired yet
  const isPending    = searchQuery !== debouncedQuery && searchQuery.length >= 2;

  const activeCategory      = categories?.find((c) => c.slug === categoryParam);
  const subcategoryOptions  = activeCategory?.subcategories ?? [];

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  // Sync with URL on navigation
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    setDebouncedQuery(q);
  }, [searchParams]);

  // Debounce: fire search 350 ms after the user stops typing
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

  // Global shortcut: Cmd+K / Ctrl+K focuses the search bar
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

  const pageTitle = subcategoryParam
    ? subcategoryParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Dupes'
    : categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + ' Dupes'
    : 'Browse All Dupes';

  const seoTitle = subcategoryParam
    ? subcategoryParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Dupes'
    : categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + ' Dupes'
    : 'Browse All Skincare & Makeup Dupes';

  const seoDescription = categoryParam
    ? `Browse ingredient-matched ${categoryParam} dupes on Skinevora. Find affordable alternatives verified by science and community reviews.`
    : 'Browse 2,500+ ingredient-matched dupes for luxury skincare and makeup on Skinevora. Sort by savings, similarity, and top-rated picks.';

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={seoTitle} description={seoDescription} canonical="/browse" />
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6">

        {/* ── Search + Title ─────────────────────────────────── */}
        <div className="mb-8 space-y-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{pageTitle}</h1>

          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              {isPending || (debouncedQuery.length >= 2 && isSearching) ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                ref={inputRef}
                placeholder="Search by brand or product… (⌘K)"
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
              {isSearching
                ? "Searching…"
                : `${searchResults?.length ?? 0} result${(searchResults?.length ?? 0) !== 1 ? "s" : ""} for "${debouncedQuery}"`}
            </p>
          )}

          {!debouncedQuery && (
            <>
              {/* ── Sort ─────────────────────────────────────────── */}
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

              {/* ── Subcategory filter ─────────────────────────────── */}
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

        {/* ── Grid ──────────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : displayDupes?.length === 0
            ? (
              <div className="col-span-full py-16 text-center">
                <Search className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">No dupes found.</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search or browse by category.</p>
              </div>
            )
            : displayDupes?.map((dupe) => (
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
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
