import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DupeCard from "@/components/cards/DupeCard";
import { useDupes } from "@/hooks/api/useDupes";
import { useSearchDupes } from "@/hooks/api/useSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "similarity", label: "Best Match" },
  { value: "savings", label: "Most Savings" },
  { value: "rating", label: "Top Rated" },
  { value: "trending", label: "Trending" },
] as const;

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || undefined;
  const sortParam = (searchParams.get("sort") as any) || "created_at";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: dupes, isLoading } = useDupes({
    category: categoryParam,
    sort: sortParam,
    limit: 12,
  });

  const { data: searchResults, isLoading: isSearching } = useSearchDupes(activeSearch);

  const displayDupes = activeSearch.length >= 2 ? searchResults : dupes;
  const loading = activeSearch.length >= 2 ? isSearching : isLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const setSort = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", sort);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6">
        {/* Search + filters */}
        <div className="mb-8 space-y-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {categoryParam
              ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Dupes`
              : "Browse All Dupes"}
          </h1>

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
          </form>

          {/* Sort buttons */}
          {!activeSearch && (
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sortParam === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
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
                />
              ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
