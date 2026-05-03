import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, Users, TrendingUp, ExternalLink, Zap,
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Info,
  FlaskConical, Droplets, Leaf, ChevronDown, ChevronUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewSection from "@/components/dupe/ReviewSection";
import { useDupeDetail, type DupeProduct, type IngredientBreakdown, type SkinTypeSuitability } from "@/hooks/api/useDupeDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Derive 0-100 efficacy score from ingredient breakdown + similarity */
function calcEfficacyScore(breakdown: IngredientBreakdown | null, similarity: number): number {
  if (!breakdown) return Math.round(similarity * 0.7);
  let score = 40; // baseline
  score += Math.min(breakdown.actives.length * 5, 25);
  score += Math.min(breakdown.humectants.length * 3, 12);
  score += Math.min(breakdown.emollients.length * 2, 8);
  if (breakdown.fungalAcneSafe) score += 5;
  if (breakdown.pregnancySafe) score += 3;
  score -= Math.min(breakdown.comedogenicCount * 2, 15);
  score = Math.max(20, Math.min(100, Math.round(score)));
  return score;
}

/** Irritancy level from comedogenic data */
function getIrritancyLevel(breakdown: IngredientBreakdown | null): { label: string; color: string; bg: string } {
  if (!breakdown) return { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted' };
  const { maxComedogenicity, comedogenicCount } = breakdown;
  if (maxComedogenicity >= 4 || comedogenicCount >= 3) return { label: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  if (maxComedogenicity >= 2 || comedogenicCount >= 1) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
}

const SKIN_TYPE_LABELS: Record<string, string> = {
  dry: 'Dry',
  oily: 'Oily',
  sensitive: 'Sensitive',
  combination: 'Combination',
  normal: 'Normal',
};

const ACTIVE_BENEFITS: Record<string, string[]> = {
  'hyaluronic acid': ['Deep Hydration', 'Plumping'],
  'niacinamide': ['Pore Minimising', 'Brightening', 'Oil Control'],
  'retinol': ['Anti-Aging', 'Cell Turnover'],
  'vitamin c': ['Brightening', 'Antioxidant'],
  'salicylic acid': ['Exfoliation', 'Acne Control'],
  'glycerin': ['Humectant', 'Hydration'],
  'ceramides': ['Barrier Repair', 'Moisture Lock'],
  'peptides': ['Firming', 'Anti-Aging'],
  'aha': ['Exfoliation', 'Brightening'],
  'bha': ['Pore Cleansing', 'Exfoliation'],
  'squalane': ['Emollient', 'Non-Comedogenic'],
  'centella asiatica': ['Soothing', 'Barrier Repair'],
  'vitamin e': ['Antioxidant', 'Moisturising'],
  'lactic acid': ['Gentle Exfoliation', 'Hydration'],
  'azelaic acid': ['Brightening', 'Acne Control'],
};

function getBenefitsForActives(actives: string[]): { active: string; benefits: string[] }[] {
  return actives
    .map((a) => ({
      active: a,
      benefits: ACTIVE_BENEFITS[a.toLowerCase()] ?? ['Active Ingredient'],
    }))
    .filter((x) => x.benefits.length > 0);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EfficacyBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const ring = score >= 75 ? 'border-emerald-300' : score >= 50 ? 'border-amber-300' : 'border-red-300';
  return (
    <div className={`flex flex-col items-center justify-center rounded-full border-4 ${ring} h-20 w-20 flex-shrink-0`}>
      <span className={`font-display text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Score</span>
    </div>
  );
}

function IrritancyBadge({ breakdown }: { breakdown: IngredientBreakdown | null }) {
  const { label, color, bg } = getIrritancyLevel(breakdown);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${bg} ${color}`}>
      {label === 'Low' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
       label === 'High' ? <XCircle className="h-3.5 w-3.5" /> :
       <AlertTriangle className="h-3.5 w-3.5" />}
      {label} Irritancy
    </span>
  );
}

function SafetyFlags({ breakdown }: { breakdown: IngredientBreakdown | null }) {
  if (!breakdown) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {breakdown.fungalAcneSafe && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" /> Fungal Acne Safe
        </span>
      )}
      {breakdown.pregnancySafe && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          <ShieldCheck className="h-3.5 w-3.5" /> Pregnancy Safe
        </span>
      )}
      {!breakdown.fungalAcneSafe && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" /> May Trigger Fungal Acne
        </span>
      )}
    </div>
  );
}

function SkinTypeBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function IngredientAnalysisPanel({ product, similarity }: { product: DupeProduct; similarity: number }) {
  const [tab, setTab] = useState<'actives' | 'all' | 'concerns'>('actives');
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const breakdown = product.ingredientBreakdown;
  const efficacy = calcEfficacyScore(breakdown, similarity);
  const irritancy = getIrritancyLevel(breakdown);
  const benefits = breakdown ? getBenefitsForActives(breakdown.actives) : [];

  const allIngredients = product.ingredientsTokens ?? [];
  const displayIngredients = showAllIngredients ? allIngredients : allIngredients.slice(0, 15);

  return (
    <div className="space-y-5">
      {/* Scores row */}
      <div className="flex flex-wrap items-center gap-4">
        <EfficacyBadge score={efficacy} />
        <div className="flex-1 space-y-2">
          <IrritancyBadge breakdown={breakdown} />
          {breakdown && (
            <p className="text-xs text-muted-foreground">
              {breakdown.tokenCount} ingredients · {breakdown.actives.length} actives · {breakdown.comedogenicCount} comedogenic
            </p>
          )}
          <SafetyFlags breakdown={breakdown} />
        </div>
      </div>

      {/* Can It Cause Trouble? */}
      {breakdown && (breakdown.comedogenicCount > 0 || !breakdown.fungalAcneSafe) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Can It Cause Trouble?
          </h4>
          <div className="space-y-1.5 text-xs text-amber-700">
            {breakdown.comedogenicCount > 0 && (
              <p>· Contains <strong>{breakdown.comedogenicCount}</strong> comedogenic ingredient{breakdown.comedogenicCount > 1 ? 's' : ''} (max rating: {breakdown.maxComedogenicity}/5). May clog pores for acne-prone skin.</p>
            )}
            {!breakdown.fungalAcneSafe && (
              <p>· Contains ingredients that may trigger pityrosporum (fungal) folliculitis.</p>
            )}
          </div>
        </div>
      )}

      {/* Works For / Benefits */}
      {benefits.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            Works For
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {benefits.map(({ active, benefits: bens }) => (
              <div key={active} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-2.5">
                <span className="text-sm font-medium capitalize">{active}</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {bens.map((b) => (
                    <span key={b} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skin type suitability */}
      {product.skinTypeSuitability && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            Skin Type Suitability
          </h4>
          <div className="space-y-2.5">
            {(Object.entries(product.skinTypeSuitability) as [string, number][]).map(([type, score]) => (
              <SkinTypeBar key={type} label={SKIN_TYPE_LABELS[type] ?? type} score={score} />
            ))}
          </div>
          {(product.skinTypeRecommendedFor?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.skinTypeRecommendedFor.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs capitalize rounded-full">
                  Best for {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ingredient tabs */}
      {breakdown && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            Ingredient Breakdown
          </h4>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full grid grid-cols-3 mb-4 h-9">
              <TabsTrigger value="actives" className="text-xs">Key Actives</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All ({allIngredients.length})</TabsTrigger>
              <TabsTrigger value="concerns" className="text-xs">Concerns</TabsTrigger>
            </TabsList>

            <TabsContent value="actives" className="space-y-2">
              {breakdown.actives.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recognised actives detected.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {breakdown.actives.map((a) => (
                    <div key={a} className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                      <p className="text-xs font-semibold capitalize text-primary">{a}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Active ingredient</p>
                    </div>
                  ))}
                </div>
              )}
              {breakdown.humectants.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">Humectants</p>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.humectants.map((h) => (
                      <span key={h} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium capitalize">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {breakdown.emollients.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">Emollients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.emollients.map((e) => (
                      <span key={e} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium capitalize">{e}</span>
                    ))}
                  </div>
                </div>
              )}
              {breakdown.preservatives.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">Preservatives</p>
                  <div className="flex flex-wrap gap-1.5">
                    {breakdown.preservatives.map((p) => (
                      <span key={p} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium capitalize">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              {allIngredients.length === 0 ? (
                <p className="text-xs text-muted-foreground">No ingredient data available.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {displayIngredients.map((ing, i) => (
                      <span key={ing + i} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium capitalize">
                        {i + 1}. {ing}
                      </span>
                    ))}
                  </div>
                  {allIngredients.length > 15 && (
                    <button
                      onClick={() => setShowAllIngredients((v) => !v)}
                      className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {showAllIngredients ? (
                        <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
                      ) : (
                        <><ChevronDown className="h-3.5 w-3.5" /> Show all {allIngredients.length} ingredients</>
                      )}
                    </button>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="concerns" className="space-y-3">
              {breakdown.comedogenicCount === 0 && breakdown.fungalAcneSafe && breakdown.pregnancySafe ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-700">No significant concerns detected. This formula looks clean!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {breakdown.comedogenicCount > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800">Comedogenic Risk</p>
                      <p className="text-xs text-amber-700 mt-1">{breakdown.comedogenicCount} comedogenic ingredient{breakdown.comedogenicCount > 1 ? 's' : ''} · highest rating {breakdown.maxComedogenicity}/5</p>
                    </div>
                  )}
                  {!breakdown.fungalAcneSafe && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                      <p className="text-xs font-semibold text-orange-800">Fungal Acne Trigger</p>
                      <p className="text-xs text-orange-700 mt-1">Contains ingredients that may worsen pityrosporum folliculitis.</p>
                    </div>
                  )}
                  {!breakdown.pregnancySafe && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-800">Not Pregnancy Safe</p>
                      <p className="text-xs text-red-700 mt-1">Contains ingredients not recommended during pregnancy. Consult your doctor.</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Raw ingredients text */}
      {product.rawIngredients && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 list-none">
            <Info className="h-3.5 w-3.5" />
            Full INCI ingredient list
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed font-mono">
            {product.rawIngredients}
          </p>
        </details>
      )}
    </div>
  );
}

function HonestyCheck({ similarityScore, sharedActives }: { similarityScore: number; sharedActives: string[] }) {
  const score = similarityScore;
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  const label = score >= 80 ? 'Highly Accurate Dupe' : score >= 60 ? 'Close Alternative' : 'Inspired By';
  const description = score >= 80
    ? 'The overall formulation — actives, base ingredients, and texture — closely mirrors the original.'
    : score >= 60
    ? 'Performs similarly for most use cases. Minor differences in supporting ingredients.'
    : 'Inspired by the original. Expect a different but budget-friendly experience.';

  return (
    <div className="rounded-xl border bg-muted/30 p-5">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Honesty Check
        <span className="text-xs text-muted-foreground font-normal ml-1">— Does it deliver on its promise?</span>
      </h3>
      <div className="flex items-center gap-5">
        <div className="text-center flex-shrink-0">
          <p className={`font-display text-4xl font-bold ${color}`}>{score}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">match</p>
        </div>
        <div className="flex-1 space-y-2">
          <p className={`font-semibold text-sm ${color}`}>{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          <Progress value={score} className="h-2" />
          {sharedActives.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {sharedActives.length} shared key active{sharedActives.length > 1 ? 's' : ''}: {sharedActives.slice(0, 3).join(', ')}{sharedActives.length > 3 ? '…' : ''}
              <span className="block mt-0.5 text-[10px]">Match % reflects full formulation similarity, not just actives.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

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

            {/* ── Honesty Check ───────────────────────────────────────── */}
            <HonestyCheck similarityScore={dupe.similarityScore} sharedActives={dupe.sharedActives ?? []} />

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
                  These are the hero actives shared by both products. The overall match score also factors in base ingredients, emollients, and formulation structure.
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
                  {dupe.original.size && (
                    <p className="text-xs text-muted-foreground mt-1">{dupe.original.size}</p>
                  )}
                  <p className="mt-2 text-xl font-bold text-muted-foreground line-through">
                    {formatPrice(dupe.original.price, dupe.original.currency, dupe.original.normalizedPriceInr)}
                  </p>
                  {dupe.original.sourceUrl && (
                    <a
                      href={dupe.original.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
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
                  {dupe.dupe.size && (
                    <p className="text-xs text-muted-foreground mt-1">{dupe.dupe.size}</p>
                  )}
                  <p className="mt-2 text-xl font-bold text-primary">
                    {formatPrice(dupe.dupe.price, dupe.dupe.currency, dupe.dupe.normalizedPriceInr)}
                  </p>
                  {dupe.dupe.sourceUrl && (
                    <a
                      href={dupe.dupe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
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

            {/* ── Ingredient Deep Dive ─────────────────────────────────── */}
            {(dupe.original.ingredientBreakdown || dupe.dupe.ingredientBreakdown) && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-5 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Ingredient Analysis
                </h2>
                <Tabs defaultValue="original">
                  <TabsList className="w-full grid grid-cols-2 mb-6">
                    <TabsTrigger value="original">
                      {dupe.original.brand} (Original)
                    </TabsTrigger>
                    <TabsTrigger value="dupe">
                      {dupe.dupe.brand} (Dupe)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="original">
                    <IngredientAnalysisPanel product={dupe.original} similarity={dupe.similarityScore} />
                  </TabsContent>
                  <TabsContent value="dupe">
                    <IngredientAnalysisPanel product={dupe.dupe} similarity={dupe.similarityScore} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* ── Side by side skin type suitability ───────────────────── */}
            {dupe.original.skinTypeSuitability && dupe.dupe.skinTypeSuitability && (
              <div className="rounded-xl border bg-muted/30 p-5">
                <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  Skin Type Comparison
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{dupe.original.brand}</p>
                    <div className="space-y-2.5">
                      {(Object.entries(dupe.original.skinTypeSuitability) as [string, number][]).map(([t, s]) => (
                        <SkinTypeBar key={t} label={SKIN_TYPE_LABELS[t] ?? t} score={s} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{dupe.dupe.brand}</p>
                    <div className="space-y-2.5">
                      {(Object.entries(dupe.dupe.skinTypeSuitability) as [string, number][]).map(([t, s]) => (
                        <SkinTypeBar key={t} label={SKIN_TYPE_LABELS[t] ?? t} score={s} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
