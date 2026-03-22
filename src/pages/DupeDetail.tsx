import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, TrendingUp, ExternalLink, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewSection from "@/components/dupe/ReviewSection";
import { useDupeDetail } from "@/hooks/api/useDupeDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

const LABEL_STYLES: Record<string, string> = {
  'exact-match': 'bg-primary text-white',
  'close-dupe':  'bg-accent text-white',
  'inspired-by': 'bg-secondary text-secondary-foreground',
};

const LABEL_TEXT: Record<string, string> = {
  'exact-match': 'Exact Match',
  'close-dupe':  'Close Dupe',
  'inspired-by': 'Inspired By',
};

function formatPrice(price: number, currency?: string, normalizedPriceInr?: number): string {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  const inr = normalizedPriceInr ?? price;
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

const DupeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dupe, isLoading, error } = useDupeDetail(id);

  const seoBrand = dupe?.original?.brand ?? "";
  const seoName  = dupe?.original?.name ?? "";
  const dupeBrand = dupe?.dupe?.brand ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoName ? `${seoName} Dupe — ${seoBrand} vs ${dupeBrand}` : "Dupe Comparison"}
        description={seoName ? `Compare ${seoName} by ${seoBrand} with its affordable dupe by ${dupeBrand}. See ingredient similarity, savings, and community reviews on Skinevora.` : "Ingredient-matched dupe comparison on Skinevora."}
        canonical={id ? `/dupe/${id}` : undefined}
        ogType="product"
      />
      <Header />
      <main className="flex-1 container px-4 py-8 md:px-6 max-w-5xl">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="aspect-square rounded-2xl" />
            </div>
          </div>
        ) : error || !dupe ? (
          <div className="py-20 text-center text-muted-foreground">Dupe not found.</div>
        ) : (
          <div className="space-y-10">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {dupe.category}
                </span>
                {dupe.dupeLabel && (
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", LABEL_STYLES[dupe.dupeLabel] ?? 'bg-primary text-white')}>
                    {LABEL_TEXT[dupe.dupeLabel] ?? dupe.dupeLabel}
                  </span>
                )}
                {dupe.dupeRank === 1 && (
                  <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-medium text-gold-dark">
                    #1 Best Dupe
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {dupe.original.brand} → {dupe.dupe.brand}
              </h1>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {Number(dupe.avgRating).toFixed(1)} rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {dupe.totalVotes.toLocaleString()} votes
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Save {dupe.savingsPercent}%
                </span>
                {dupe.priceRatio && (
                  <span className="flex items-center gap-1.5 text-accent font-medium">
                    <Zap className="h-4 w-4" />
                    {Number(dupe.priceRatio).toFixed(1)}× cheaper
                  </span>
                )}
              </div>
            </div>

            {/* ── Shared Key Actives ──────────────────────────────────── */}
            {dupe.sharedActives?.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Shared Key Actives
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dupe.sharedActives.map((active) => (
                    <span
                      key={active}
                      className="rounded-full border border-primary/30 bg-white px-3 py-1 text-xs font-medium capitalize text-primary shadow-sm"
                    >
                      {active.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  These are the efficacy-driving ingredients that both products share — why they work the same way.
                </p>
              </div>
            )}

            {/* ── Products Side-by-Side ───────────────────────────────── */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Original */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                {dupe.original.image && (
                  <img src={dupe.original.image} alt={dupe.original.name} className="w-full aspect-square object-cover" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Original</p>
                  <p className="text-sm text-muted-foreground">{dupe.original.brand}</p>
                  <h2 className="font-semibold text-foreground mt-0.5 flex-1">{dupe.original.name}</h2>
                  <p className="mt-2 text-xl font-bold text-muted-foreground line-through">
                    {formatPrice(dupe.original.price, dupe.original.currency, dupe.original.normalizedPriceInr)}
                  </p>
                  {dupe.original.sourceUrl && (
                    <a
                      href={dupe.original.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on {dupe.original.platform ?? 'store'}
                    </a>
                  )}
                </div>
              </div>

              {/* Dupe */}
              <div className="rounded-2xl border-2 border-primary/40 bg-card overflow-hidden relative flex flex-col">
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {dupe.dupeLabel && (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm", LABEL_STYLES[dupe.dupeLabel] ?? 'bg-primary text-white')}>
                      {LABEL_TEXT[dupe.dupeLabel] ?? dupe.dupeLabel}
                    </span>
                  )}
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                    Save {dupe.savingsPercent}%
                  </span>
                </div>
                {dupe.dupe.image && (
                  <img src={dupe.dupe.image} alt={dupe.dupe.name} className="w-full aspect-square object-cover" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Dupe Pick</p>
                  <p className="text-sm text-muted-foreground">{dupe.dupe.brand}</p>
                  <h2 className="font-semibold text-foreground mt-0.5 flex-1">{dupe.dupe.name}</h2>
                  <p className="mt-2 text-xl font-bold text-primary">
                    {formatPrice(dupe.dupe.price, dupe.dupe.currency, dupe.dupe.normalizedPriceInr)}
                  </p>
                  {dupe.dupe.sourceUrl && (
                    <a
                      href={dupe.dupe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-xs font-medium text-gold-dark hover:bg-primary/20 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Buy on {dupe.dupe.platform ?? 'store'}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Score Breakdown ──────────────────────────────────────── */}
            <div className="rounded-xl border bg-muted/30 p-5">
              <h3 className="text-sm font-semibold mb-4">Score Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ScoreStat label="Similarity" value={`${dupe.similarityScore}%`} />
                <ScoreStat label="Savings" value={`${dupe.savingsPercent}%`} />
                {dupe.priceRatio && <ScoreStat label="Price Ratio" value={`${Number(dupe.priceRatio).toFixed(1)}×`} />}
                {dupe.scoreConfidence != null && (
                  <ScoreStat label="Confidence" value={`${Math.round(Number(dupe.scoreConfidence) * 100)}%`} />
                )}
              </div>
            </div>

            {/* ── Reviews ──────────────────────────────────────────────── */}
            <ReviewSection dupeId={dupe.id} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

function ScoreStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default DupeDetail;
