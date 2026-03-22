import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IngredientPreferencesPanel } from '@/components/dupes/IngredientPreferencesPanel';
import { useFilterDupesByIngredients } from '@/hooks/api/useIngredientAnalysis';
import { useProducts } from '@/hooks/api/useProducts';
import DupeCard from '@/components/cards/DupeCard';

const SKIN_TYPES = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'sensitive', label: 'Sensitive' },
  { value: 'combination', label: 'Combination' },
  { value: 'normal', label: 'Normal' },
];

export default function DupesFinderAdvanced() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('normal');
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Fetch products for autocomplete
  const { data: productsData = [] } = useProducts({
    limit: 50,
    search: search,
  });

  // Fetch filtered dupes
  const { data: dupesData, isLoading: dupesLoading, isError } = useFilterDupesByIngredients(
    selectedProduct || undefined,
    selectedSkinType,
    includeIngredients.length > 0 ? includeIngredients : undefined,
    excludeIngredients.length > 0 ? excludeIngredients : undefined,
    !!selectedProduct
  );

  return (
    <>
      <SEO
        title="Advanced Dupes Finder - Customize by Ingredients"
        description="Find product dupes with your ingredient preferences. Include or exclude specific ingredients and filter by skin type."
      />
      <Header />

      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">
              Advanced Dupes Finder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find dupes with your specific ingredient preferences. Choose which ingredients you
              want and which to avoid, tailored to your skin type.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Product Search */}
                <Card className="p-4">
                  <label className="text-sm font-semibold block mb-2">
                    Product to Find Dupes For
                  </label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  {search && productsData && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {productsData.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product.id);
                            setSearch('');
                          }}
                          className="w-full text-left p-2 text-sm hover:bg-secondary rounded transition-colors"
                        >
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedProduct && (
                    <div className="mt-2 p-2 bg-primary/10 rounded text-sm">
                      ✓ Product selected
                    </div>
                  )}
                </Card>

                {/* Skin Type Selector */}
                <Card className="p-4">
                  <label className="text-sm font-semibold block mb-2">
                    Your Skin Type
                  </label>
                  <Select value={selectedSkinType} onValueChange={setSelectedSkinType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKIN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>

                {/* Ingredient Preferences */}
                <IngredientPreferencesPanel
                  includeIngredients={includeIngredients}
                  excludeIngredients={excludeIngredients}
                  onIncludeChange={setIncludeIngredients}
                  onExcludeChange={setExcludeIngredients}
                />
              </div>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-3">
              {!selectedProduct ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Select a product to find dupes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Search for a product on the left to get started.
                  </p>
                </Card>
              ) : dupesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-96" />
                  ))}
                </div>
              ) : isError ? (
                <Card className="p-8 text-center">
                  <p className="text-red-600">Error loading dupes</p>
                </Card>
              ) : dupesData && dupesData.data.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Found {dupesData.total} dupe{dupesData.total !== 1 ? 's' : ''}
                      {dupesData.filters_applied.includeCount > 0 && (
                        <span className="ml-2">
                          (matching {dupesData.filters_applied.includeCount} preferred ingredients)
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dupesData.data.map((dupe) => (
                      <DupeCard
                        key={dupe.id}
                        id={dupe.id}
                        original={dupe.original}
                        dupe={dupe.dupe}
                        similarityScore={dupe.similarityScore}
                        category={dupe.category}
                        savingsPercent={dupe.savingsPercent}
                        dupeLabel={dupe.dupeLabel}
                        sharedActives={dupe.sharedActives ?? []}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No dupes found matching your preferences
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your ingredient filters or selecting a different product.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
