import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DupeCard from "@/components/cards/DupeCard";
import { useFavoritesDupes } from "@/hooks/api/useFavorites";
import { useAuth } from "@/hooks/auth/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: favDupes, isLoading } = useFavoritesDupes();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-10 md:px-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="font-display text-2xl font-semibold">Your Favorites</h1>
            <p className="text-muted-foreground">Sign in to see your saved dupes</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-6 w-6 text-rose fill-rose" />
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your Favorites</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : !favDupes?.length ? (
          <div className="py-20 text-center space-y-4">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No favorites yet.</p>
            <Button asChild variant="outline">
              <Link to="/browse">Browse Dupes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favDupes.map((dupe) => (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
