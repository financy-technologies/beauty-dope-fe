import { useState } from "react";
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
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "similarity",  label: "Best Match" },
  { value: "savings",     label: "Most Savings" },
  { value: "confidence",  label: "High Confidence" },
  { value: "rating",      label: "Top Rated" },
  { value: "created_at",  label: "Newest" },
] as const;

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam   = searchParams.get("category")   || undefined;
  const subcategoryParam = searchParams.get("subcategory") || undefined;
  const sortParam       = (searchParams.get("sort") as any) || "similarity";

  const [searchQuery, setSearchQuery]   = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: categories } = useCategories();

  const { data: dupes, isLoading } = useDupes({
    category:    categoryParam,
    subcategory: subcategoryParam,
    sort:        sortParam,
    limit:       24,
  });

  const { data: searchResults, isLoading: isSearching } = useSearchDupes(activeSearch);

  const displayDupes = activeSearch.length >= 2 ? searchResults : dupes;
  const loading      = activeSearch.length >= 2 ? isSearching : isLoading;

  // Subcategories for the selected category
  const activeCategory   = categories?.find((c) => c.slug === categoryParam);
  const subcategoryOptions = activeCategory?.subcategories ?? [];

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const pageTitle = subcategoryParam
    ? subcategoryParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Dupes'
    : categoryParam
    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + ' Dupes'
    : 'Browse All Dupes';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6">

        {/* ── Search + Title ─────────────────────────────────── */}
        <div className="mb-8 space-y-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{pageTitle}</h1>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by brand or product…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setActiveSearch("");
                }}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
            {activeSearch && (
              <Button type="button" variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setActiveSearch(""); }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>

          {!activeSearch && (
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

              {/* ── Subcategory filter (shown when category selected) ─ */}
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
              <div className="col-span-full py-16 text-center text-muted-foreground">
                No dupes found. Try a different search or filter.
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
