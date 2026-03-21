import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFavorites, useToggleFavorite } from "@/hooks/api/useFavorites";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Product {
  name: string;
  brand: string;
  price: number;
  normalizedPriceInr?: number;
  currency?: string;
  image: string;
}

interface DupeCardProps {
  id: string;
  original: Product;
  dupe: Product;
  similarityScore: number;
  category: string;
  savingsPercent: number;
  dupeLabel?: string | null;
  sharedActives?: string[];
}

function formatPrice(product: Product): string {
  if (product.currency === 'USD') return `$${product.price.toLocaleString()}`;
  const inr = product.normalizedPriceInr ?? product.price;
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

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

const DupeCard = ({
  id,
  original,
  dupe,
  similarityScore,
  category,
  savingsPercent,
  dupeLabel,
  sharedActives = [],
}: DupeCardProps) => {
  const { user } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { toast } = useToast();

  const isFavorite = favorites?.includes(id) ?? false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favorites" });
      return;
    }
    try {
      await toggleFavorite.mutateAsync({ dupeId: id, isFavorite });
    } catch {
      toast({ title: "Error", description: "Could not update favorite", variant: "destructive" });
    }
  };

  const labelStyle = dupeLabel ? (LABEL_STYLES[dupeLabel] ?? 'bg-primary text-white') : 'bg-primary text-white';
  const labelText  = dupeLabel ? (LABEL_TEXT[dupeLabel] ?? dupeLabel) : `${similarityScore}% Match`;

  return (
    <Link
      to={`/dupe/${id}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
    >
      {/* Images */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 flex">
          <div className="relative w-1/2 overflow-hidden">
            <img
              src={original.image}
              alt={original.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
          </div>
          <div className="relative w-1/2 overflow-hidden">
            <img
              src={dupe.image}
              alt={dupe.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20" />
          </div>
        </div>

        {/* Center arrow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm", labelStyle)}>
            {labelText}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            Save {savingsPercent}%
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavoriteClick}
          disabled={toggleFavorite.isPending}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition-all hover:bg-background hover:shadow-md disabled:opacity-50"
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-rose text-rose" : "text-muted-foreground")} />
        </button>

        {/* Category tag */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Original */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{original.brand}</p>
            <p className="truncate text-sm font-medium text-foreground">{original.name}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted-foreground line-through">
            {formatPrice(original)}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-primary font-medium">DUPE</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Dupe */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{dupe.brand}</p>
            <p className="truncate text-sm font-medium text-foreground">{dupe.name}</p>
          </div>
          <span className="shrink-0 text-sm font-bold text-primary">
            {formatPrice(dupe)}
          </span>
        </div>

        {/* Shared actives pills */}
        {sharedActives.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {sharedActives.slice(0, 3).map((a) => (
              <span key={a} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                {a.replace(/-/g, ' ')}
              </span>
            ))}
            {sharedActives.length > 3 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{sharedActives.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default DupeCard;
