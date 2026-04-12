import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Heart, Share2, ExternalLink, ShieldCheck,
  ChevronDown, ChevronUp, Leaf, Droplets, Zap, AlertTriangle,
  CheckCircle2, XCircle, Info, FlaskConical, Sparkles,
  Package, Globe, Award, Users, BookOpen, ArrowRight,
  Recycle, MapPin, TrendingDown, TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductDetail, type ParsedIngredient, type DupeForProduct } from "@/hooks/api/useProductDetail";
import { motion } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency?: string, normalizedInr?: number): string {
  if (currency === 'USD') return `$${price.toLocaleString()}`;
  const inr = normalizedInr ?? price;
  return `₹${Math.round(inr).toLocaleString('en-IN')}`;
}

function scoreColor(score: number) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-600', ring: 'border-emerald-300' };
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600', ring: 'border-amber-300' };
  return { bar: 'bg-red-500', text: 'text-red-600', ring: 'border-red-300' };
}

function irritancyStyle(level: 'low' | 'medium' | 'high') {
  if (level === 'low') return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', label: 'Low Irritancy — suitable for sensitive skin' };
  if (level === 'medium') return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', label: 'Medium Irritancy — patch test recommended' };
  return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: 'text-red-500', label: 'High Irritancy — not ideal for reactive skin' };
}

const SKIN_TYPE_ICONS: Record<string, string> = {
  dry: '🏜️', oily: '✨', combination: '⚖️', sensitive: '🌸', normal: '🌿',
};

const CONCERN_ICONS: Record<string, string> = {
  acne: '💊', pigmentation: '☀️', aging: '⏳', dullness: '💡', redness: '🔴',
};

const GROUP_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  starActives:    { label: 'Star Actives',              icon: <Sparkles className="h-4 w-4" />, color: 'text-primary border-primary/30 bg-primary/5' },
  hydrators:      { label: 'Hydrators & Humectants',    icon: <Droplets className="h-4 w-4" />, color: 'text-blue-600 border-blue-200 bg-blue-50' },
  barrierBuilders:{ label: 'Barrier Builders',          icon: <ShieldCheck className="h-4 w-4" />, color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  botanicals:     { label: 'Botanical Extracts',        icon: <Leaf className="h-4 w-4" />, color: 'text-green-600 border-green-200 bg-green-50' },
  watchList:      { label: 'Watch List',                icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-600 border-amber-200 bg-amber-50' },
  functional:     { label: 'Functional Ingredients',   icon: <FlaskConical className="h-4 w-4" />, color: 'text-slate-600 border-slate-200 bg-slate-50' },
  other:          { label: 'Other Ingredients',         icon: <Package className="h-4 w-4" />, color: 'text-muted-foreground border-border bg-muted/30' },
};

const EVIDENCE_STYLES: Record<string, string> = {
  proven:     'bg-emerald-100 text-emerald-700',
  promising:  'bg-blue-100 text-blue-700',
  limited:    'bg-amber-100 text-amber-700',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const { text, ring } = scoreColor(score);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/40" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke="currentColor" strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-700", score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500')}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-xl font-bold", text)}>
          {score}
        </span>
      </div>
      <span className="text-xs font-medium text-center text-muted-foreground leading-tight max-w-[80px]">{label}</span>
    </div>
  );
}

function IngredientRow({ ing }: { ing: ParsedIngredient }) {
  const [open, setOpen] = useState(false);
  // Defensive: skip rows with no usable name
  const displayName = ing.name || ing.canonicalName || '';
  if (!displayName) return null;

  const evidenceStr = (ing.effects ?? []).length > 0 ? 'promising' : 'limited';

  return (
    <div className="border-b border-border/60 last:border-0">
      {/* Row header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors gap-3"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground capitalize truncate">{displayName}</span>
          {(ing.comedogenicity ?? 0) >= 3 && (
            <span className="shrink-0 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5">
              Watch
            </span>
          )}
          {ing.fungalAcneSafe === false && (
            <span className="shrink-0 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold px-1.5 py-0.5">
              Not FA Safe
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(ing.effects ?? []).slice(0, 2).map((e) => (
            <span key={e} className="hidden sm:inline-block rounded-full bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 capitalize">
              {e.replace(/-/g, ' ')}
            </span>
          ))}
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />}
        </div>
      </button>

      {/* Expanded detail — pure CSS, no Framer needed (avoids nested height:auto conflict) */}
      {open && (
        <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {ing.canonicalName && ing.canonicalName !== displayName && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">INCI Name</p>
                <p className="text-foreground/80 capitalize">{ing.canonicalName}</p>
              </div>
            )}
            {ing.description && (
              <div className="sm:col-span-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">What it does</p>
                <p className="text-foreground/80 leading-relaxed">{ing.description}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Evidence</p>
                <span className={cn('rounded-full text-[11px] font-semibold px-2.5 py-1 capitalize', EVIDENCE_STYLES[evidenceStr] ?? EVIDENCE_STYLES.limited)}>
                  {evidenceStr.charAt(0).toUpperCase() + evidenceStr.slice(1)}
                </span>
              </div>
              {ing.comedogenicity !== undefined && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Comedogenicity</p>
                  <span className={cn('rounded-full text-[11px] font-semibold px-2.5 py-1',
                    ing.comedogenicity >= 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                    {ing.comedogenicity}/5
                  </span>
                </div>
              )}
              {ing.skinTypeScores && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Best for</p>
                  <span className="text-xs text-foreground/70 capitalize">
                    {Object.entries(ing.skinTypeScores)
                      .filter(([, v]) => (v as number) >= 70)
                      .map(([k]) => k)
                      .join(', ') || 'All skin types'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DupeCardCompact({ dupe, originalPrice, originalCurrency }: { dupe: DupeForProduct; originalPrice: number; originalCurrency?: string }) {
  const savings = formatPrice(
    Math.abs(dupe.dupeProduct.normalizedPriceInr - originalPrice),
    originalCurrency,
    Math.abs(dupe.dupeProduct.normalizedPriceInr - originalPrice)
  );
  const labelColors: Record<string, string> = {
    'exact-match': 'bg-primary text-white',
    'close-dupe': 'bg-accent text-white',
    'inspired-by': 'bg-secondary text-secondary-foreground',
  };
  const labelText: Record<string, string> = {
    'exact-match': 'Exact Match', 'close-dupe': 'Close Dupe', 'inspired-by': 'Inspired By',
  };
  const priceRange = dupe.dupeProduct.normalizedPriceInr;
  const tier = priceRange < 500 ? 'budget' : priceRange < 1500 ? 'mid' : 'premium';

  return (
    <Link
      to={`/product/${dupe.dupeProduct.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-200"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={dupe.dupeProduct.imageUrl || '/placeholder.svg'}
          alt={dupe.dupeProduct.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {dupe.dupeLabel && (
            <span className={cn('rounded-full text-[10px] font-semibold px-2 py-0.5 shadow-sm', labelColors[dupe.dupeLabel] ?? 'bg-primary text-white')}>
              {labelText[dupe.dupeLabel] ?? dupe.dupeLabel}
            </span>
          )}
          <span className={cn('rounded-full text-[10px] font-semibold px-2 py-0.5 bg-background/90 text-foreground shadow-sm',
            tier === 'budget' ? 'border border-emerald-300' : tier === 'mid' ? 'border border-blue-300' : 'border border-purple-300')}>
            {tier === 'budget' ? 'Budget' : tier === 'mid' ? 'Mid-Range' : 'Premium Alt'}
          </span>
        </div>
        <div className="absolute top-2 right-2 bg-background/90 rounded-full px-2 py-0.5 text-[11px] font-bold text-primary shadow-sm">
          {dupe.similarityScore}% match
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{dupe.dupeProduct.brand}</p>
        <p className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2">{dupe.dupeProduct.name}</p>
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="text-base font-bold text-primary">
            {formatPrice(dupe.dupeProduct.price, dupe.dupeProduct.currency, dupe.dupeProduct.normalizedPriceInr)}
          </span>
          <span className="text-[11px] font-semibold text-accent bg-accent/10 rounded-full px-2 py-0.5">
            Save {dupe.savingsPercent}%
          </span>
        </div>
        {dupe.sharedActives.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {dupe.sharedActives.slice(0, 2).map((a) => (
              <span key={a} className="rounded-full bg-primary/10 text-primary text-[10px] font-medium px-1.5 py-0.5 capitalize">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function ReviewStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

// ─── Sticky Section Nav ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'hero',        label: 'Overview' },
  { id: 'scores',      label: 'Scores' },
  { id: 'summary',     label: 'Summary' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'dupes',       label: 'Dupes' },
  { id: 'worksfor',    label: 'Works For' },
  { id: 'ethics',      label: 'Ethics' },
  { id: 'reviews',     label: 'Reviews' },
];

function StickyNav({ activeSection }: { activeSection: string }) {
  return (
    <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container px-4 md:px-6">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide py-0">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                'shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeSection === s.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Zone 8 — Ethics card ──────────────────────────────────────────────────────

const ETHICS_META: Record<string, { icon: React.ReactNode; desc: string }> = {
  'Fragrance Free':    { icon: <Leaf className="h-5 w-5" />,       desc: 'No synthetic fragrance or parfum' },
  'Alcohol Free':      { icon: <Droplets className="h-5 w-5" />,   desc: 'No drying denatured alcohol' },
  'Paraben Free':      { icon: <ShieldCheck className="h-5 w-5" />,desc: 'No parabens as preservatives' },
  'Silicone Free':     { icon: <Sparkles className="h-5 w-5" />,   desc: 'No occlusive silicones' },
  'Fungal Acne Safe':  { icon: <Award className="h-5 w-5" />,      desc: 'Safe for malassezia-prone skin' },
  'Pregnancy Safe':    { icon: <Users className="h-5 w-5" />,      desc: 'No pregnancy-restricted ingredients' },
};

function EthicsCard({ label, value }: { label: string; value: boolean | null }) {
  const meta = ETHICS_META[label];
  const isTrue = value === true;
  const isFalse = value === false;
  const isUnknown = value === null;

  return (
    <div className={cn(
      'relative flex flex-col gap-3 rounded-2xl border p-4 transition-all',
      isTrue    ? 'border-emerald-200 bg-emerald-50/60'  : '',
      isFalse   ? 'border-red-200 bg-red-50/40'          : '',
      isUnknown ? 'border-border bg-muted/30'             : '',
    )}>
      {/* Status badge top-right */}
      <div className="absolute top-3 right-3">
        {isTrue    && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" />Yes</span>}
        {isFalse   && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-700"><XCircle className="h-3 w-3" />No</span>}
        {isUnknown && <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Unknown</span>}
      </div>

      {/* Icon */}
      <div className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl',
        isTrue    ? 'bg-emerald-100 text-emerald-600' : '',
        isFalse   ? 'bg-red-100 text-red-500'         : '',
        isUnknown ? 'bg-muted text-muted-foreground'  : '',
      )}>
        {meta?.icon}
      </div>

      {/* Label + desc */}
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {meta?.desc && <p className="text-xs text-muted-foreground mt-0.5 leading-snug pr-12">{meta.desc}</p>}
      </div>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="container px-4 py-10 md:px-6 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-14 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProductDetail(id);
  const [activeSection, setActiveSection] = useState('hero');
  const [dupeTier, setDupeTier] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');
  const [wishlist, setWishlist] = useState(false);
  const [openIngGroup, setOpenIngGroup] = useState<string | null>('starActives');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1"><ProductDetailSkeleton /></main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold text-foreground">Product not found</p>
            <Link to="/browse?mode=products" className="text-primary underline underline-offset-4">Browse all products</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const scores = product.skinevoraScores;
  const irritStyle = irritancyStyle(scores.irritancy);
  const filteredDupes = dupeTier === 'all' ? product.dupes :
    dupeTier === 'budget' ? product.dupes.filter(d => d.dupeProduct.normalizedPriceInr < 500) :
    dupeTier === 'mid' ? product.dupes.filter(d => d.dupeProduct.normalizedPriceInr >= 500 && d.dupeProduct.normalizedPriceInr < 1500) :
    product.dupes.filter(d => d.dupeProduct.normalizedPriceInr >= 1500);

  const topDupe = product.dupes[0];
  const suitability = product.skinTypeSuitability;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SEO
        canonical={`/product/${product.id}`}
        description={`${product.brand} ${product.name} — SkinEvora analysis, ingredient breakdown, dupes and reviews.`}
      />
      <Header />
      <StickyNav activeSection={activeSection} />

      <main className="flex-1">

        {/* ───────────────────────────────── ZONE 1 — HERO ──── */}
        <section id="hero" className="bg-gradient-to-b from-secondary/20 to-background pt-8 pb-12">
          <div className="container px-4 md:px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/browse" className="hover:text-primary transition-colors">Browse</Link>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* Product image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square shadow-card">
                  <img
                    src={product.imageUrl || '/placeholder.svg'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  {/* SkinEvora Verdict badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-3 shadow-elevated border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">SkinEvora Verdict</p>
                        <p className={cn("text-base font-bold mt-0.5",
                          scores.efficacy >= 75 ? 'text-emerald-600' :
                          scores.efficacy >= 55 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {scores.efficacy >= 75 ? 'Highly Recommended' : scores.efficacy >= 55 ? 'Good Pick' : 'Better Dupes Available'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className={cn("rounded-full border-2 flex items-center justify-center h-12 w-12 font-bold text-sm", scoreColor(scores.efficacy).ring, scoreColor(scores.efficacy).text)}>
                          {scores.efficacy}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Product info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-5"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary mb-1">{product.brand}</p>
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-foreground">{product.name}</h1>
                  {product.description && (
                    <p className="mt-3 text-muted-foreground text-sm leading-relaxed line-clamp-3">{product.description}</p>
                  )}
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap gap-2">
                  {product.ethics.fragranceFree === true && (
                    <Badge variant="secondary" className="text-xs gap-1"><ShieldCheck className="h-3 w-3" />Fragrance Free</Badge>
                  )}
                  {product.ingredientBreakdown?.fungalAcneSafe && (
                    <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Fungal Acne Safe</Badge>
                  )}
                  {product.ingredientBreakdown?.pregnancySafe && (
                    <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Pregnancy Safe</Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="text-xs capitalize">{product.category}</Badge>
                  )}
                  {product.subcategory && (
                    <Badge variant="outline" className="text-xs capitalize">{product.subcategory}</Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(product.price, product.currency, product.normalizedPriceInr)}
                  </span>
                  {product.size && (
                    <span className="text-sm text-muted-foreground">{product.size}</span>
                  )}
                </div>

                {topDupe && (
                  <div className="flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-emerald-700">
                    <TrendingDown className="h-4 w-4 shrink-0" />
                    <span>
                      Best dupe saves you <strong>{topDupe.savingsPercent}%</strong> —{' '}
                      <span className="font-semibold">{topDupe.dupeProduct.brand} {topDupe.dupeProduct.name}</span>{' '}
                      at {formatPrice(topDupe.dupeProduct.price, topDupe.dupeProduct.currency, topDupe.dupeProduct.normalizedPriceInr)}
                    </span>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex items-center gap-3">
                  {product.sourceUrl ? (
                    <Button asChild className="flex-1 gap-2 h-12 rounded-xl font-semibold shadow-teal">
                      <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Buy Original
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="flex-1 gap-2 h-12 rounded-xl font-semibold opacity-60">
                      <ExternalLink className="h-4 w-4" />
                      Buy Original
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("h-12 w-12 rounded-xl", wishlist && "border-rose text-rose")}
                    onClick={() => setWishlist((v) => !v)}
                    aria-label="Wishlist"
                  >
                    <Heart className={cn("h-5 w-5 transition-colors", wishlist && "fill-rose text-rose")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    aria-label="Share"
                    onClick={() => navigator.share?.({ title: `${product.brand} ${product.name}`, url: window.location.href })}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Dupes shortcut */}
                {product.dupes.length > 0 && (
                  <a href="#dupes" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4">
                    <Zap className="h-4 w-4" />
                    View {product.dupes.length} ingredient-matched dupes
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 2 — SCORES ──── */}
        <section id="scores" className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold text-foreground">SkinEvora Score Card</h2>
              <p className="text-muted-foreground text-sm mt-1">Science-backed analysis across four dimensions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Circle scores */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-around">
                  <ScoreCircle score={scores.efficacy} label="Efficacy Score" />
                  <ScoreCircle score={scores.value} label="Value Score" />
                  <ScoreCircle score={scores.clean} label="Clean Score" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Scores are derived from ingredient analysis and dupe availability
                </p>
              </div>

              {/* Irritancy + metric bars */}
              <div className="space-y-4">
                {/* Irritancy banner */}
                <div className={cn('flex items-center gap-3 rounded-2xl border px-5 py-4', irritStyle.bg)}>
                  <AlertTriangle className={cn("h-5 w-5 shrink-0", irritStyle.icon)} />
                  <div>
                    <p className={cn("text-sm font-semibold", irritStyle.text)}>{irritStyle.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">Irritancy level: <strong>{scores.irritancy}</strong></p>
                  </div>
                </div>

                {/* Score bars */}
                {[
                  { label: 'Efficacy', score: scores.efficacy, hint: 'Does it work as claimed?' },
                  { label: 'Value', score: scores.value, hint: 'Worth the price vs. dupes?' },
                  { label: 'Clean Formula', score: scores.clean, hint: 'Free from unnecessary additives?' },
                ].map(({ label, score, hint }) => (
                  <div key={label} className="bg-card rounded-xl border border-border px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                      <span className={cn("text-lg font-bold", scoreColor(score).text)}>{score}</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 3 — SUMMARY ──── */}
        <section id="summary" className="py-12 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Product Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'What it is', value: [product.category, product.subcategory].filter(Boolean).join(' · ') || 'Skincare product', icon: <Package className="h-4 w-4" /> },
                { label: 'Best for skin types', value: product.skinTypeRecommendedFor?.length ? product.skinTypeRecommendedFor.join(', ') : 'All skin types', icon: <Users className="h-4 w-4" /> },
                { label: 'Routine placement', value: 'AM / PM — check product instructions', icon: <Zap className="h-4 w-4" /> },
                { label: 'Size / Format', value: product.size ?? 'See product listing', icon: <Package className="h-4 w-4" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">{icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-sm text-foreground mt-0.5 capitalize">{value}</p>
                  </div>
                </div>
              ))}

              {/* Key actives */}
              {(product.ingredientBreakdown?.actives?.length ?? 0) > 0 && (
                <div className="bg-card rounded-xl border border-border p-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Actives</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredientBreakdown!.actives.map((a) => (
                      <span key={a} className="rounded-full border border-primary/30 bg-primary/8 text-primary text-sm font-medium px-3 py-1 capitalize">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pairs well / Do not mix */}
              {(product.ingredientBreakdown?.actives?.length ?? 0) > 0 && (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Pairs well with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getPairsWell(product.ingredientBreakdown!.actives).map((i) => (
                        <span key={i} className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 capitalize">{i}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-2">Do not mix with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getDoNotMix(product.ingredientBreakdown!.actives).map((i) => (
                        <span key={i} className="rounded-full bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 capitalize">{i}</span>
                      ))}
                    </div>
                    {getDoNotMix(product.ingredientBreakdown!.actives).length === 0 && (
                      <p className="text-xs text-muted-foreground">No known conflicts</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 4 — INGREDIENTS ──── */}
        <section id="ingredients" className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Ingredient Analysis</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.parsedIngredients.length} ingredients identified and categorised
                </p>
              </div>
            </div>

            {/* Irritancy banner */}
            <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-3.5 mb-6', irritStyle.bg)}>
              <AlertTriangle className={cn("h-5 w-5 shrink-0", irritStyle.icon)} />
              <p className={cn("text-sm font-medium", irritStyle.text)}>{irritStyle.label}</p>
            </div>

            {/* Grouped ingredients */}
            {Object.entries(product.ingredientGroups)
              .filter(([, items]) => items.length > 0)
              .map(([key, items]) => {
                const meta = GROUP_META[key] ?? GROUP_META.other;
                const isOpen = openIngGroup === key;
                return (
                  <div key={key} className="mb-3 rounded-2xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenIngGroup(isOpen ? null : key)}
                      className={cn('w-full flex items-center justify-between px-5 py-4 text-left transition-colors', isOpen ? 'bg-muted/50' : 'hover:bg-muted/30')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', meta.color)}>
                          {meta.icon}
                          {meta.label}
                        </div>
                        <span className="text-sm text-muted-foreground">{items.length} ingredient{items.length !== 1 ? 's' : ''}</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-border/60 bg-background">
                        {items.map((ing: ParsedIngredient, i: number) => (
                          <IngredientRow key={(ing.name || ing.canonicalName || '') + i} ing={ing} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {product.parsedIngredients.length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-2xl border border-border">
                <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No ingredient data available for this product yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 6 — DUPES ──── */}
        <section id="dupes" className="py-12 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Ingredient-Matched Dupes</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.dupes.length} verified alternatives ranked by formula similarity
                </p>
              </div>
              {/* Tier filter */}
              <div className="flex items-center gap-1.5 bg-background rounded-xl border border-border p-1 self-start">
                {(['all', 'budget', 'mid', 'premium'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDupeTier(t)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize',
                      dupeTier === t ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t === 'all' ? 'All' : t === 'budget' ? 'Under ₹500' : t === 'mid' ? '₹500–1500' : 'Premium'}
                  </button>
                ))}
              </div>
            </div>

            {filteredDupes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredDupes.map((dupe) => (
                  <DupeCardCompact
                    key={dupe.id}
                    dupe={dupe}
                    originalPrice={product.normalizedPriceInr}
                    originalCurrency={product.currency}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-background rounded-2xl border border-border">
                <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No dupes found in this price range.</p>
                <button
                  type="button"
                  onClick={() => setDupeTier('all')}
                  className="mt-3 text-sm text-primary underline underline-offset-4"
                >
                  Show all dupes
                </button>
              </div>
            )}

            {/* Formula comparison (top dupe) */}
            {topDupe && (
              <div className="mt-8 bg-background rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Side-by-Side Formula Comparison</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{product.brand} — Original</p>
                    <div className="space-y-1.5">
                      {(product.ingredientBreakdown?.actives ?? []).slice(0, 5).map((a) => (
                        <div key={a} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="capitalize">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{topDupe.dupeProduct.brand} — Top Dupe</p>
                    <div className="space-y-1.5">
                      {(topDupe.sharedActives ?? []).slice(0, 5).map((a) => (
                        <div key={a} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="capitalize">{a}</span>
                        </div>
                      ))}
                      {(topDupe.missingActives ?? []).slice(0, 3).map((a) => (
                        <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span className="capitalize">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 7 — WORKS FOR ──── */}
        <section id="worksfor" className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Works For</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skin types */}
              {suitability && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Skin Types
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(suitability).map(([type, score]) => (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize flex items-center gap-1.5">
                            <span>{SKIN_TYPE_ICONS[type] ?? '🌿'}</span> {type}
                          </span>
                          <span className={cn('text-xs font-semibold', score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-500')}>
                            {score >= 70 ? 'Great fit' : score >= 40 ? 'Suitable' : 'Avoid'}
                          </span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin concerns + recommended for */}
              <div className="space-y-4">
                {product.skinTypeRecommendedFor?.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Best Suited For
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.skinTypeRecommendedFor.map((s) => (
                        <span key={s} className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-3 py-1.5 capitalize">
                          {SKIN_TYPE_ICONS[s.toLowerCase()] ?? '✓'} {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns list from actives */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Key Skin Concerns Addressed
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getConcernsFromActives(product.ingredientBreakdown?.actives ?? []).map((c) => (
                      <span key={c.concern} className="rounded-full bg-secondary text-secondary-foreground text-sm font-medium px-3 py-1.5 capitalize flex items-center gap-1.5">
                        <span>{c.icon}</span> {c.concern}
                      </span>
                    ))}
                    {getConcernsFromActives(product.ingredientBreakdown?.actives ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">General skincare maintenance</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 8 — ETHICS ──── */}
        <section id="ethics" className="py-12 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Ethics & Transparency</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Flags derived from ingredient analysis. Not all brands carry official certifications — here's what the formula tells us.
              </p>
            </div>

            {/* Ethics cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <EthicsCard label="Fragrance Free"   value={product.ethics.fragranceFree} />
              <EthicsCard label="Alcohol Free"     value={product.ethics.alcoholFree} />
              <EthicsCard label="Paraben Free"     value={product.ethics.parabenFree} />
              <EthicsCard label="Silicone Free"    value={product.ethics.siliconeFree} />
              <EthicsCard label="Fungal Acne Safe" value={product.ingredientBreakdown?.fungalAcneSafe ?? null} />
              <EthicsCard label="Pregnancy Safe"   value={product.ingredientBreakdown?.pregnancySafe ?? null} />
            </div>

            {/* Available on + disclaimer row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {product.platform && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 self-start">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Available on</span>
                  <span className="text-sm font-semibold text-foreground capitalize">{product.platform}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-xl">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>Ethics flags are automatically derived from the ingredient list. Manual verification by Skinevora editors is ongoing. Always read the product label for the most accurate information.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 9 — REVIEWS ──── */}
        <section id="reviews" className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Reviews</h2>

            {product.reviews.total > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating summary */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="text-center mb-4">
                    <p className="text-6xl font-bold font-display text-foreground">{product.reviews.avgRating?.toFixed(1)}</p>
                    <ReviewStars rating={Math.round(product.reviews.avgRating ?? 0)} size="md" />
                    <p className="text-sm text-muted-foreground mt-1">{product.reviews.total} review{product.reviews.total !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-2">
                    {product.reviews.ratingBreakdown.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2.5 text-sm">
                        <span className="w-4 text-muted-foreground text-right">{star}</span>
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <Progress value={product.reviews.total > 0 ? (count / product.reviews.total) * 100 : 0} className="flex-1 h-2" />
                        <span className="text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="lg:col-span-2 space-y-4">
                  {product.reviews.items.map((review) => (
                    <div key={review.id} className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">{review.userName}</p>
                          <ReviewStars rating={review.rating} />
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border">
                <Star className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium text-foreground mb-1">No reviews yet</p>
                <p className="text-sm text-muted-foreground">Reviews are aggregated from dupe comparisons. Be the first to try a dupe and share your experience.</p>
              </div>
            )}
          </div>
        </section>

        {/* ───────────────────────────────── ZONE 11 — BOTTOM NAV ──── */}
        <section className="py-12 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* More from brand */}
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> More from {product.brand}
                </h3>
                <Link
                  to={`/browse?q=${encodeURIComponent(product.brand)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-xl px-4 py-2.5 hover:bg-primary/5 transition-colors"
                >
                  Browse all {product.brand} dupes & products
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {/* Similar category */}
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Similar {product.subcategory ?? product.category}
                </h3>
                <Link
                  to={`/browse?category=${encodeURIComponent(product.category)}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 rounded-xl px-4 py-2.5 hover:bg-primary/5 transition-colors"
                >
                  Explore {product.category} products
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

// ─── Local helpers for Zone 3 ──────────────────────────────────────────────────

const PAIRS_WELL: Record<string, string[]> = {
  'retinol':         ['niacinamide', 'hyaluronic acid', 'squalane'],
  'vitamin c':       ['vitamin e', 'ferulic acid', 'niacinamide'],
  'niacinamide':     ['hyaluronic acid', 'ceramides', 'peptides'],
  'salicylic acid':  ['niacinamide', 'zinc', 'green tea'],
  'hyaluronic acid': ['ceramides', 'glycerin', 'niacinamide'],
  'aha':             ['hyaluronic acid', 'niacinamide', 'ceramides'],
  'glycolic acid':   ['hyaluronic acid', 'niacinamide'],
  'peptides':        ['hyaluronic acid', 'ceramides', 'niacinamide'],
  'ceramides':       ['hyaluronic acid', 'niacinamide', 'peptides'],
};

const DO_NOT_MIX: Record<string, string[]> = {
  'retinol':         ['vitamin c', 'aha', 'bha', 'benzoyl peroxide'],
  'vitamin c':       ['retinol', 'aha', 'bha', 'niacinamide (high conc.)'],
  'aha':             ['retinol', 'vitamin c', 'bha (same time)'],
  'bha':             ['aha (same time)', 'retinol'],
  'salicylic acid':  ['retinol', 'glycolic acid'],
  'benzoyl peroxide':['retinol', 'vitamin c'],
};

function getPairsWell(actives: string[]): string[] {
  const result = new Set<string>();
  for (const a of actives) {
    const pairs = PAIRS_WELL[a.toLowerCase()];
    if (pairs) pairs.forEach((p) => result.add(p));
  }
  return Array.from(result).slice(0, 5);
}

function getDoNotMix(actives: string[]): string[] {
  const result = new Set<string>();
  for (const a of actives) {
    const conflicts = DO_NOT_MIX[a.toLowerCase()];
    if (conflicts) conflicts.forEach((c) => result.add(c));
  }
  return Array.from(result).slice(0, 5);
}

const CONCERN_MAP: Record<string, { concern: string; icon: string }[]> = {
  'retinol':          [{ concern: 'Anti-Aging', icon: '⏳' }, { concern: 'Cell Renewal', icon: '🔄' }],
  'vitamin c':        [{ concern: 'Brightening', icon: '✨' }, { concern: 'Antioxidant', icon: '🛡️' }],
  'niacinamide':      [{ concern: 'Pores', icon: '🌀' }, { concern: 'Oil Control', icon: '💧' }],
  'salicylic acid':   [{ concern: 'Acne', icon: '💊' }, { concern: 'Exfoliation', icon: '🔬' }],
  'hyaluronic acid':  [{ concern: 'Hydration', icon: '💦' }],
  'aha':              [{ concern: 'Brightening', icon: '✨' }, { concern: 'Exfoliation', icon: '🔬' }],
  'azelaic acid':     [{ concern: 'Pigmentation', icon: '☀️' }, { concern: 'Redness', icon: '🔴' }],
  'ceramides':        [{ concern: 'Barrier Repair', icon: '🛡️' }],
  'peptides':         [{ concern: 'Firming', icon: '💪' }, { concern: 'Anti-Aging', icon: '⏳' }],
};

function getConcernsFromActives(actives: string[]) {
  const seen = new Set<string>();
  const result: { concern: string; icon: string }[] = [];
  for (const a of actives) {
    const concerns = CONCERN_MAP[a.toLowerCase()];
    if (concerns) {
      for (const c of concerns) {
        if (!seen.has(c.concern)) {
          seen.add(c.concern);
          result.push(c);
        }
      }
    }
  }
  return result.slice(0, 6);
}

export default ProductDetail;
