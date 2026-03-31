import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/api/useProducts";
import { Search } from "lucide-react";

type BrandSummary = {
  name: string;
  products: number;
  categories: number;
};

const Brands = () => {
  const [query, setQuery] = useState("");
  const { data: products, isLoading } = useProducts({ limit: 5000 });

  const brands = useMemo<BrandSummary[]>(() => {
    if (!products?.length) return [];

    const brandMap = new Map<string, { products: number; categories: Set<string> }>();

    for (const product of products) {
      const brandName = product.brand?.trim();
      if (!brandName) continue;

      const row = brandMap.get(brandName) ?? { products: 0, categories: new Set<string>() };
      row.products += 1;
      if (product.category) row.categories.add(product.category.toLowerCase());
      brandMap.set(brandName, row);
    }

    const normalizedQuery = query.toLowerCase().trim();

    return Array.from(brandMap.entries())
      .map(([name, row]) => ({
        name,
        products: row.products,
        categories: row.categories.size,
      }))
      .filter((row) => (normalizedQuery ? row.name.toLowerCase().includes(normalizedQuery) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Browse Brands"
        description="Browse skincare and makeup brands on Skinevora and discover ingredient-matched alternatives by brand."
        canonical="/brands"
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Browse</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Brands Directory</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Explore brands across skincare and makeup, then jump directly into dupe results.
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brand name"
                className="pl-9"
              />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
                  ))
                : brands.map((brand) => (
                    <Link
                      key={brand.name}
                      to={`/browse?q=${encodeURIComponent(brand.name)}`}
                      className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                    >
                      <p className="font-semibold text-foreground">{brand.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {brand.products} products · {brand.categories} categories
                      </p>
                    </Link>
                  ))}
            </div>

            {!isLoading && brands.length === 0 && (
              <p className="mt-10 text-center text-muted-foreground">No brands match your search.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Brands;
