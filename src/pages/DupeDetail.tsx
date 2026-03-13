import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Users, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewSection from "@/components/dupe/ReviewSection";
import { useDupeDetail } from "@/hooks/api/useDupeDetail";
import { Skeleton } from "@/components/ui/skeleton";

const DupeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: dupe, isLoading, error } = useDupeDetail(id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 md:px-6">
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
          <div className="py-20 text-center text-muted-foreground">
            Dupe not found.
          </div>
        ) : (
          <div className="space-y-10">
            {/* Header */}
            <div>
              <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-3">
                {dupe.category}
              </span>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {dupe.original.brand} → {dupe.dupe.brand}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {Number(dupe.avgRating).toFixed(1)} rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {dupe.totalVotes.toLocaleString()} votes
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-sage" />
                  Save {dupe.savingsPercent}%
                </span>
              </div>
            </div>

            {/* Products side by side */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Original */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {dupe.original.image && (
                  <img
                    src={dupe.original.image}
                    alt={dupe.original.name}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">Original</p>
                  <p className="text-sm text-muted-foreground">{dupe.original.brand}</p>
                  <h2 className="font-semibold text-foreground mt-0.5">{dupe.original.name}</h2>
                  <p className="mt-1 text-lg font-bold text-muted-foreground line-through">
                    ${dupe.original.price}
                  </p>
                  {dupe.original.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{dupe.original.description}</p>
                  )}
                </div>
              </div>

              {/* Dupe */}
              <div className="rounded-2xl border-2 border-gold/40 bg-card overflow-hidden relative">
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
                    {dupe.similarityScore}% Match
                  </span>
                  <span className="rounded-full bg-sage/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                    Save {dupe.savingsPercent}%
                  </span>
                </div>
                {dupe.dupe.image && (
                  <img
                    src={dupe.dupe.image}
                    alt={dupe.dupe.name}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">Dupe Pick</p>
                  <p className="text-sm text-muted-foreground">{dupe.dupe.brand}</p>
                  <h2 className="font-semibold text-foreground mt-0.5">{dupe.dupe.name}</h2>
                  <p className="mt-1 text-lg font-bold text-gold">
                    ${dupe.dupe.price}
                  </p>
                  {dupe.dupe.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{dupe.dupe.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <ReviewSection dupeId={dupe.id} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DupeDetail;
