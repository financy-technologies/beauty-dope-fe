import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp,
  Sun, Moon, ArrowRight, ShieldAlert, FlaskConical, Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import INGREDIENT_DB, { type IngredientInfo } from "@/data/ingredientDb";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuideIngredient {
  name: string;
  verdict: "seek" | "avoid";
  reason: string;
}

interface RoutineStep {
  order: number;
  type: string;
  product: string;
  tip: string;
  when: "am" | "pm" | "both";
}

interface GuideGoal {
  label: string;
  slug: string;
  emoji: string;
  summary: string;
  detail: string;
  ingredients: GuideIngredient[];
  amRoutine: RoutineStep[];
  pmRoutine: RoutineStep[];
  proTips: string[];
  browseCategory: string;
  browseSubcategory?: string;
  browseQuery?: string;
}

// ─── Goal data ───────────────────────────────────────────────────────────────

const GOALS: GuideGoal[] = [
  {
    label: "Acne",
    slug: "acne",
    emoji: "🎯",
    summary: "Focus on oil balance, inflammation control, and gentle barrier support.",
    detail: "Acne happens when pores clog with dead skin cells and excess sebum, leading to bacterial overgrowth. The key is controlling oil without stripping the barrier — harsh cleansers actually trigger more oil production. Target ingredients that dissolve clogs (BHA), kill bacteria (benzoyl peroxide), and reduce inflammation (niacinamide).",
    ingredients: [
      { name: "Salicylic Acid", verdict: "seek", reason: "Oil-soluble BHA that penetrates pores to dissolve blackheads and whiteheads from inside" },
      { name: "Niacinamide", verdict: "seek", reason: "Reduces sebum production by up to 40%, calms redness, and minimises pore appearance" },
      { name: "Azelaic Acid", verdict: "seek", reason: "Kills acne bacteria, reduces inflammation, and fades post-acne marks. Pregnancy-safe" },
      { name: "Benzoyl Peroxide", verdict: "seek", reason: "Directly kills C. acnes bacteria — best for inflammatory acne. Start at 2.5%" },
      { name: "Zinc", verdict: "seek", reason: "Anti-inflammatory and sebum-regulating. Look for zinc PCA in serums" },
      { name: "Centella Asiatica", verdict: "seek", reason: "Calms active breakouts and speeds healing of acne lesions" },
      { name: "Coconut Oil", verdict: "avoid", reason: "Highly comedogenic (rating 4/5) — clogs pores and worsens acne" },
      { name: "Fragrance", verdict: "avoid", reason: "Irritates inflamed skin and can trigger more breakouts" },
      { name: "Sodium Lauryl Sulfate", verdict: "avoid", reason: "Strips skin too aggressively, causing rebound oil production" },
      { name: "Isopropyl Myristate", verdict: "avoid", reason: "Comedogenic — commonly found in makeup and moisturisers" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Gentle gel or foam cleanser (pH 5.5)", tip: "Don't over-cleanse — wash gently for 60 seconds max", when: "am" },
      { order: 2, type: "Treatment", product: "Niacinamide 5-10% serum", tip: "Controls oil throughout the day without drying", when: "am" },
      { order: 3, type: "Moisturiser", product: "Lightweight gel moisturiser (oil-free)", tip: "Never skip — dehydrated skin produces more oil", when: "am" },
      { order: 4, type: "Sunscreen", product: "Non-comedogenic SPF 30+ (gel or fluid)", tip: "Acne marks darken with UV — SPF is non-negotiable", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Oil-based cleanser (if wearing SPF/makeup)", tip: "Double cleanse: oil first, then gel cleanser", when: "pm" },
      { order: 2, type: "Cleanser", product: "Same gentle gel cleanser as AM", tip: "Second cleanse removes remaining residue", when: "pm" },
      { order: 3, type: "Treatment", product: "Salicylic acid 2% or Benzoyl peroxide 2.5%", tip: "Alternate nights to avoid over-drying. Don't combine both", when: "pm" },
      { order: 4, type: "Moisturiser", product: "Lightweight barrier repair moisturiser", tip: "Look for ceramides + niacinamide formulas", when: "pm" },
    ],
    proTips: [
      "Change pillowcases every 2-3 days",
      "Don't pick or squeeze — it leads to scarring and spreads bacteria",
      "Introduce one new active at a time, waiting 2 weeks between each",
      "If benzoyl peroxide and retinoid — use BP in AM, retinoid in PM",
    ],
    browseCategory: "skin",
    browseSubcategory: "face-wash",
    browseQuery: "acne",
  },
  {
    label: "Sensitive Skin",
    slug: "sensitive-skin",
    emoji: "🌸",
    summary: "Keep formulas simple and prioritize calming, fragrance-free products.",
    detail: "Sensitive skin has a compromised barrier that allows irritants to penetrate more easily, triggering redness, stinging, and reactivity. The goal is strengthening the barrier with ceramides and soothing botanicals while avoiding known irritants. Less is more — a 3-4 step routine is ideal.",
    ingredients: [
      { name: "Centella Asiatica", verdict: "seek", reason: "Gold-standard soothing ingredient — repairs barrier, reduces redness, anti-inflammatory" },
      { name: "Ceramides", verdict: "seek", reason: "Replenish the lipid barrier that sensitive skin lacks, preventing moisture loss" },
      { name: "Allantoin", verdict: "seek", reason: "Extremely gentle calming agent that promotes cell regeneration" },
      { name: "Panthenol", verdict: "seek", reason: "Vitamin B5 — deeply hydrates and soothes irritation. Great for post-procedure skin" },
      { name: "Colloidal Oatmeal", verdict: "seek", reason: "Clinically proven to reduce itching and inflammation in reactive skin" },
      { name: "Squalane", verdict: "seek", reason: "Lightweight oil that mimics skin's natural sebum — no irritation risk" },
      { name: "Fragrance", verdict: "avoid", reason: "Top allergen in skincare — causes contact dermatitis and sensitisation" },
      { name: "Alcohol Denat", verdict: "avoid", reason: "Strips the already compromised barrier, increasing sensitivity" },
      { name: "Essential Oils", verdict: "avoid", reason: "Contain volatile compounds that sensitise reactive skin over time" },
      { name: "Glycolic Acid", verdict: "avoid", reason: "Too aggressive for sensitive skin — use lactic acid or PHA instead if exfoliation needed" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Cream or micellar cleanser (no foam)", tip: "Avoid water that's too hot — lukewarm only", when: "am" },
      { order: 2, type: "Serum", product: "Centella or panthenol serum", tip: "Pat gently — don't rub sensitive skin", when: "am" },
      { order: 3, type: "Moisturiser", product: "Ceramide-rich barrier cream", tip: "Look for minimal ingredient lists (under 15 ingredients)", when: "am" },
      { order: 4, type: "Sunscreen", product: "Mineral SPF 30+ (zinc oxide)", tip: "Mineral filters sit on top of skin and are less irritating than chemical ones", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Same gentle cream cleanser", tip: "One cleanse is enough — no need to double cleanse", when: "pm" },
      { order: 2, type: "Serum", product: "Barrier-repair serum (ceramides + peptides)", tip: "Apply to slightly damp skin for better absorption", when: "pm" },
      { order: 3, type: "Moisturiser", product: "Rich ceramide night cream", tip: "Can layer squalane oil on top for extra barrier protection", when: "pm" },
    ],
    proTips: [
      "Patch test every new product on your jaw for 3 days before full-face use",
      "Keep your routine to 3-4 products max — more products = more irritant risk",
      "Avoid hot showers on your face — heat triggers flushing",
      "Introduce one new product every 2 weeks minimum",
    ],
    browseCategory: "skin",
    browseQuery: "sensitive",
  },
  {
    label: "Dark Spots",
    slug: "dark-spots",
    emoji: "✨",
    summary: "Treat pigmentation consistently and protect skin daily from UV exposure.",
    detail: "Hyperpigmentation occurs when melanocytes overproduce melanin in response to inflammation, hormones, or UV damage. Effective treatment requires a two-pronged approach: inhibit melanin production with brightening actives AND prevent new spots with rigorous sun protection. Results take 8-12 weeks of consistent use.",
    ingredients: [
      { name: "Vitamin C", verdict: "seek", reason: "Inhibits tyrosinase (melanin enzyme), brightens existing spots, and provides antioxidant protection" },
      { name: "Tranexamic Acid", verdict: "seek", reason: "Blocks melanin transfer to skin cells — especially effective for melasma and hormonal pigmentation" },
      { name: "Alpha Arbutin", verdict: "seek", reason: "Gentle melanin inhibitor — safer alternative to hydroquinone with fewer side effects" },
      { name: "Niacinamide", verdict: "seek", reason: "Prevents melanin from reaching the skin surface — works well combined with other brighteners" },
      { name: "Azelaic Acid", verdict: "seek", reason: "Disrupts melanin synthesis and reduces inflammation that triggers dark spots" },
      { name: "Kojic Acid", verdict: "seek", reason: "Potent brightener — use kojic dipalmitate for a more stable, less irritating form" },
      { name: "Hydroquinone", verdict: "avoid", reason: "Effective but causes rebound hyperpigmentation with prolonged use. Use only under dermatologist supervision" },
      { name: "Fragrance", verdict: "avoid", reason: "Can trigger post-inflammatory hyperpigmentation in sensitised skin" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Gentle low-pH cleanser", tip: "Avoid physical scrubs — they worsen post-inflammatory marks", when: "am" },
      { order: 2, type: "Serum", product: "Vitamin C 10-20% serum", tip: "Apply to clean, dry skin for best absorption. Wait 1 min before next step", when: "am" },
      { order: 3, type: "Serum", product: "Niacinamide 5% (optional layer)", tip: "Can be mixed with Vitamin C despite the old myth — they work fine together", when: "am" },
      { order: 4, type: "Moisturiser", product: "Lightweight moisturiser with alpha arbutin", tip: "Look for formulas that combine multiple brighteners", when: "am" },
      { order: 5, type: "Sunscreen", product: "SPF 50+ PA++++ (reapply every 2 hours)", tip: "This is the MOST important step — UV creates new spots faster than actives can fade them", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Oil cleanser + gentle second cleanser", tip: "Thorough SPF removal is essential — leftover SPF traps debris", when: "pm" },
      { order: 2, type: "Treatment", product: "Tranexamic acid 2-5% or azelaic acid 10%", tip: "Alternate with retinoid on different nights for maximum brightening", when: "pm" },
      { order: 3, type: "Serum", product: "Alpha arbutin 2% serum", tip: "Layer over treatment for combined brightening effect", when: "pm" },
      { order: 4, type: "Moisturiser", product: "Barrier-support night cream", tip: "Healthy barrier = less inflammation = fewer new dark spots", when: "pm" },
    ],
    proTips: [
      "SPF is 80% of your dark spot treatment — without it, actives can't work",
      "Results take 8-12 weeks — don't switch products too early",
      "Wear a hat outdoors — SPF alone isn't enough for melasma",
      "Avoid picking at spots — post-inflammatory pigmentation lasts months",
    ],
    browseCategory: "skin",
    browseSubcategory: "serum",
    browseQuery: "brightening",
  },
  {
    label: "Dry Skin",
    slug: "dry-skin",
    emoji: "💧",
    summary: "Rebuild barrier lipids and lock in hydration with low-irritation formulas.",
    detail: "Dry skin lacks both water (dehydration) and oil (dryness). The barrier is compromised, leading to increased transepidermal water loss. Treatment uses a layering strategy: humectants draw water in, emollients smooth the skin surface, and occlusives lock everything in. Avoid anything that strips the little oil your skin produces.",
    ingredients: [
      { name: "Ceramides", verdict: "seek", reason: "Restore the lipid mortar between skin cells — the #1 ingredient for dry skin barrier repair" },
      { name: "Hyaluronic Acid", verdict: "seek", reason: "Holds 1000x its weight in water — draws moisture into dehydrated skin layers" },
      { name: "Squalane", verdict: "seek", reason: "Lightweight emollient that mimics natural skin oils without feeling heavy" },
      { name: "Glycerin", verdict: "seek", reason: "Inexpensive but powerful humectant — look for it in the first 5 ingredients" },
      { name: "Shea Butter", verdict: "seek", reason: "Rich occlusive that seals moisture and nourishes with vitamins A and E" },
      { name: "Panthenol", verdict: "seek", reason: "Attracts and binds moisture, soothes tightness and flaking" },
      { name: "Alcohol Denat", verdict: "avoid", reason: "Evaporates quickly and takes skin moisture with it — extremely drying" },
      { name: "Sodium Lauryl Sulfate", verdict: "avoid", reason: "Harsh foaming agent that strips natural oils from already oil-depleted skin" },
      { name: "Salicylic Acid", verdict: "avoid", reason: "Oil-dissolving properties further deplete dry skin's limited sebum" },
      { name: "Fragrance", verdict: "avoid", reason: "Irritates the compromised barrier, increasing moisture loss" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Cream or oil cleanser (non-foaming)", tip: "If your skin feels tight after washing, your cleanser is too harsh", when: "am" },
      { order: 2, type: "Toner", product: "Hydrating toner with hyaluronic acid", tip: "Apply to damp skin and pat in layers (7-skin method)", when: "am" },
      { order: 3, type: "Serum", product: "Hyaluronic acid + ceramide serum", tip: "HA works best in humid environments — seal with moisturiser in dry climates", when: "am" },
      { order: 4, type: "Moisturiser", product: "Rich cream with ceramides + squalane", tip: "Look for a 3:1:1 ratio of ceramides, cholesterol, fatty acids", when: "am" },
      { order: 5, type: "Sunscreen", product: "Moisturising SPF 30+ (cream formula)", tip: "Avoid alcohol-based sunscreens — choose creamy, hydrating SPFs", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Oil or balm cleanser", tip: "Oil dissolves SPF/makeup without stripping moisture", when: "pm" },
      { order: 2, type: "Toner", product: "Same hydrating toner as AM", tip: "Multiple thin layers hydrate better than one thick layer", when: "pm" },
      { order: 3, type: "Serum", product: "Panthenol or ceramide concentrate", tip: "Night is when barrier repair happens — feed your skin", when: "pm" },
      { order: 4, type: "Moisturiser", product: "Heavy night cream or sleeping pack", tip: "Can layer facial oil on top as a final occlusive seal", when: "pm" },
    ],
    proTips: [
      "Humidity matters — use a humidifier in winter to prevent moisture loss",
      "Apply moisturiser within 60 seconds of cleansing to lock in water",
      "Avoid long hot showers — they strip natural oils",
      "Layer thinnest to thickest: toner → serum → cream → oil",
    ],
    browseCategory: "skin",
    browseSubcategory: "moisturizer",
    browseQuery: "dry skin",
  },
  {
    label: "Oily Skin",
    slug: "oily-skin",
    emoji: "🫧",
    summary: "Regulate sebum without stripping the skin and causing rebound oiliness.",
    detail: "Oily skin overproduces sebum, often due to genetics, hormones, or a damaged barrier. Counter-intuitively, aggressive cleansing and skipping moisturiser makes it worse — stripped skin overcompensates by producing even more oil. The goal is gentle sebum regulation, lightweight hydration, and non-comedogenic everything.",
    ingredients: [
      { name: "Niacinamide", verdict: "seek", reason: "Clinically proven to reduce sebum production by up to 40% at 5% concentration" },
      { name: "Salicylic Acid", verdict: "seek", reason: "Clears excess oil from inside pores, preventing the shine-breakout cycle" },
      { name: "Zinc", verdict: "seek", reason: "Anti-inflammatory and sebum-regulating — look for zinc PCA or zinc gluconate" },
      { name: "Azelaic Acid", verdict: "seek", reason: "Controls oil, reduces acne, and doesn't disrupt barrier like stronger acids" },
      { name: "Hyaluronic Acid", verdict: "seek", reason: "Lightweight water-based hydration — gives oily skin moisture without adding oil" },
      { name: "Coconut Oil", verdict: "avoid", reason: "Comedogenic rating 4/5 — will clog pores and make oiliness worse" },
      { name: "Mineral Oil", verdict: "avoid", reason: "Heavy occlusive that traps sebum and debris in already oily pores" },
      { name: "Isopropyl Palmitate", verdict: "avoid", reason: "Commonly found in makeup — highly comedogenic" },
      { name: "Shea Butter", verdict: "avoid", reason: "Too rich for oily skin — comedogenic rating 2-3, can cause congestion" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Gel cleanser with niacinamide (pH 5.5)", tip: "Wash for 60 seconds — not more. Over-cleansing triggers rebound oil", when: "am" },
      { order: 2, type: "Serum", product: "Niacinamide 10% serum", tip: "This is your MVP — controls shine all day without drying", when: "am" },
      { order: 3, type: "Moisturiser", product: "Oil-free gel moisturiser", tip: "Yes, oily skin NEEDS moisturiser — use gel or water-based formulas", when: "am" },
      { order: 4, type: "Sunscreen", product: "Mattifying SPF 30+ (gel or fluid texture)", tip: "Look for silica or zinc-based mattifying SPFs", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Oil cleanser (yes, oil!)", tip: "Oil dissolves oil — this removes SPF/sebum without harsh surfactants", when: "pm" },
      { order: 2, type: "Cleanser", product: "Same gel cleanser as AM", tip: "Double cleanse ensures pores are truly clean", when: "pm" },
      { order: 3, type: "Treatment", product: "Salicylic acid 2% or azelaic acid 10%", tip: "Use 3-4 nights per week, not every night", when: "pm" },
      { order: 4, type: "Moisturiser", product: "Lightweight gel cream", tip: "Skin repairs at night — skipping moisturiser means more oil tomorrow", when: "pm" },
    ],
    proTips: [
      "Blotting papers > powder — powder mixes with oil and clogs pores",
      "Don't skip moisturiser — dehydrated oily skin produces even MORE oil",
      "Use oil-based cleanser at night — it removes sebum better than foaming cleansers",
      "Mattifying primers with silica help control daytime shine",
    ],
    browseCategory: "skin",
    browseSubcategory: "serum",
    browseQuery: "oil control",
  },
  {
    label: "Anti-aging",
    slug: "anti-aging",
    emoji: "⏳",
    summary: "Combine collagen support with antioxidant defense and daily UV protection.",
    detail: "Skin aging is driven by two forces: intrinsic (collagen loss, slower cell turnover) and extrinsic (UV damage, pollution, smoking). Retinoids are the gold standard — they boost collagen, speed turnover, and reduce wrinkles. Vitamin C provides daytime antioxidant defence. And SPF prevents 80% of visible aging.",
    ingredients: [
      { name: "Retinol", verdict: "seek", reason: "Gold standard anti-ager — boosts collagen, speeds cell turnover, reduces wrinkles. Start low (0.3%)" },
      { name: "Peptides", verdict: "seek", reason: "Signal skin to produce more collagen and elastin — gentler alternative to retinoids" },
      { name: "Vitamin C", verdict: "seek", reason: "Morning antioxidant shield — neutralises free radicals before they damage collagen" },
      { name: "Ferulic Acid", verdict: "seek", reason: "Doubles the potency of Vitamin C and E when combined (CE Ferulic formula)" },
      { name: "Hyaluronic Acid", verdict: "seek", reason: "Plumps fine lines by drawing water into skin — instant and cumulative effect" },
      { name: "Bakuchiol", verdict: "seek", reason: "Plant-based retinol alternative — similar results with less irritation. Pregnancy-safe" },
      { name: "Fragrance", verdict: "avoid", reason: "Causes chronic low-grade inflammation that accelerates collagen breakdown" },
      { name: "Alcohol Denat", verdict: "avoid", reason: "Degrades the lipid barrier, accelerating skin dehydration and aging" },
    ],
    amRoutine: [
      { order: 1, type: "Cleanser", product: "Gentle cream or gel cleanser", tip: "Don't use anything that leaves skin feeling tight", when: "am" },
      { order: 2, type: "Serum", product: "Vitamin C 15-20% + Ferulic acid serum", tip: "Apply to dry skin, wait 1 minute. This is your morning antioxidant shield", when: "am" },
      { order: 3, type: "Eye Cream", product: "Peptide eye cream", tip: "The under-eye area has no oil glands — it ages fastest", when: "am" },
      { order: 4, type: "Moisturiser", product: "Peptide-rich moisturiser", tip: "Peptides work all day — look for matrixyl, argireline, or copper peptides", when: "am" },
      { order: 5, type: "Sunscreen", product: "SPF 50+ PA++++ (broad spectrum)", tip: "80% of visible aging is from UV. This is your #1 anti-aging product", when: "am" },
    ],
    pmRoutine: [
      { order: 1, type: "Cleanser", product: "Oil or balm cleanser + gentle second cleanser", tip: "Thorough but gentle — double cleanse removes SPF completely", when: "pm" },
      { order: 2, type: "Treatment", product: "Retinol 0.3-1% (build up gradually)", tip: "Start 2x/week, increase to nightly over 6-8 weeks. Apply to DRY skin", when: "pm" },
      { order: 3, type: "Eye Cream", product: "Retinol eye cream (lower concentration)", tip: "Use a dedicated eye retinol — facial retinol is too strong for this area", when: "pm" },
      { order: 4, type: "Moisturiser", product: "Rich ceramide night cream", tip: "Retinol is drying — a rich moisturiser prevents irritation", when: "pm" },
    ],
    proTips: [
      "Retinol + Vitamin C is fine — just use Vitamin C in AM and retinol in PM",
      "SPF prevents more wrinkles than any serum ever will",
      "Start retinol at 0.3%, graduate to 0.5%, then 1% over months",
      "Consistency beats concentration — daily 0.3% retinol > weekly 1%",
    ],
    browseCategory: "skin",
    browseSubcategory: "serum",
    browseQuery: "anti aging retinol",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DB_KEYS = Object.keys(INGREDIENT_DB);

function lookupDb(name: string): IngredientInfo | undefined {
  const key = name.toLowerCase().replace(/[^a-z0-9 /\-]/g, " ").replace(/\s+/g, " ").trim();
  if (INGREDIENT_DB[key]) return INGREDIENT_DB[key];
  for (const dbKey of DB_KEYS) {
    if (dbKey.length >= 4 && (key.includes(dbKey) || dbKey.includes(key))) {
      return INGREDIENT_DB[dbKey];
    }
  }
  return undefined;
}

// ─── IngredientRow ───────────────────────────────────────────────────────────

function IngredientRow({ ing }: { ing: GuideIngredient }) {
  const [expanded, setExpanded] = useState(false);
  const dbInfo = lookupDb(ing.name);
  const isSeek = ing.verdict === "seek";

  return (
    <div
      className={`rounded-xl border px-4 py-3 cursor-pointer transition-all hover:shadow-sm ${
        isSeek
          ? "border-green-200 bg-green-50/70"
          : "border-red-200 bg-red-50/70"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isSeek ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <X className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground">{ing.name}</span>
          <Badge
            variant="outline"
            className={`text-[10px] ${isSeek ? "border-green-300 text-green-700 bg-green-100" : "border-red-300 text-red-600 bg-red-100"}`}
          >
            {isSeek ? "Seek" : "Avoid"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dbInfo && !dbInfo.fungalAcneSafe && (
            <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 bg-orange-50 hidden sm:flex">
              FA Risk
            </Badge>
          )}
          {dbInfo?.comedogenic && (
            <Badge variant="outline" className="text-[10px] border-red-300 text-red-600 bg-red-50 hidden sm:flex">
              Comedogenic
            </Badge>
          )}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-current/10">
              {ing.reason}
            </p>
            {dbInfo && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground font-medium">{dbInfo.category}</span>
                {dbInfo.concern && (
                  <span className="text-[10px] text-amber-600">· {dbInfo.concern}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RoutineStepCard ─────────────────────────────────────────────────────────

function RoutineStepCard({ step }: { step: RoutineStep }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {step.order}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">{step.type}</span>
        </div>
        <p className="text-sm font-semibold text-foreground mt-0.5">{step.product}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.tip}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const SkinGuide = () => {
  const [searchParams] = useSearchParams();
  const [activeRoutineTab, setActiveRoutineTab] = useState<"am" | "pm">("am");
  const goalParam = searchParams.get("goal")?.toLowerCase();

  const selectedGoal = useMemo(() => {
    const fallback = GOALS[0];
    if (!goalParam) return fallback;
    return GOALS.find((goal) => goal.slug === goalParam) ?? fallback;
  }, [goalParam]);

  const seekIngredients = selectedGoal.ingredients.filter((i) => i.verdict === "seek");
  const avoidIngredients = selectedGoal.ingredients.filter((i) => i.verdict === "avoid");

  const browseUrl = `/browse?mode=products&category=${selectedGoal.browseCategory}${
    selectedGoal.browseSubcategory ? `&subcategory=${selectedGoal.browseSubcategory}` : ""
  }${selectedGoal.browseQuery ? `&q=${encodeURIComponent(selectedGoal.browseQuery)}` : ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${selectedGoal.label} Skin Guide — Ingredients, Routine & Tips`}
        description={`Complete ${selectedGoal.label.toLowerCase()} skincare guide: which ingredients to seek and avoid, step-by-step AM/PM routine, and expert tips. Free on Skinevora.`}
        canonical="/skin-guide"
        keywords={`${selectedGoal.label.toLowerCase()} skincare routine, ${selectedGoal.label.toLowerCase()} ingredients, skincare guide`}
      />
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  Skin Guide
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Your complete guide to
                <br />
                <span className="text-gradient-teal italic">{selectedGoal.label.toLowerCase()} care</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Ingredients to seek & avoid, a step-by-step AM/PM routine, and dermatologist-backed tips — all tailored to {selectedGoal.label.toLowerCase()}.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Goal picker */}
        <section className="py-8 border-b border-border">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {GOALS.map((goal) => (
                <Link
                  key={goal.slug}
                  to={`/skin-guide?goal=${goal.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selectedGoal.slug === goal.slug
                      ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-foreground/80 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <span className="mr-1.5">{goal.emoji}</span>
                  {goal.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGoal.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-4xl space-y-10"
              >

                {/* Overview */}
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{selectedGoal.emoji} Understanding {selectedGoal.label}</h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{selectedGoal.detail}</p>
                </div>

                {/* ── Ingredients Section ─────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Ingredients for {selectedGoal.label}
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Seek */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">
                          Ingredients to Seek ({seekIngredients.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {seekIngredients.map((ing) => (
                          <IngredientRow key={ing.name} ing={ing} />
                        ))}
                      </div>
                    </div>

                    {/* Avoid */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-red-600">
                          Ingredients to Avoid ({avoidIngredients.length})
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {avoidIngredients.map((ing) => (
                          <IngredientRow key={ing.name} ing={ing} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Routine Section ─────────────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Your {selectedGoal.label} Routine
                    </h2>
                  </div>

                  {/* AM / PM tabs */}
                  <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1 mb-5 max-w-xs">
                    {(["am", "pm"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveRoutineTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                          activeRoutineTab === tab
                            ? "bg-background shadow-soft text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === "am" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                        {tab === "am" ? "Morning" : "Night"}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          activeRoutineTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {tab === "am" ? selectedGoal.amRoutine.length : selectedGoal.pmRoutine.length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Routine steps */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedGoal.slug}-${activeRoutineTab}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-border bg-card p-5 md:p-6"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        {activeRoutineTab === "am" ? (
                          <Sun className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Moon className="h-5 w-5 text-indigo-500" />
                        )}
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {activeRoutineTab === "am" ? "Morning Routine" : "Night Routine"}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {(activeRoutineTab === "am" ? selectedGoal.amRoutine : selectedGoal.pmRoutine).map((step) => (
                          <RoutineStepCard key={`${step.order}-${step.type}`} step={step} />
                        ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-border">
                        <Link
                          to="/routine-builder"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Sparkles className="h-4 w-4" />
                          Build This Routine with Your Products
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <p className="text-xs text-muted-foreground mt-2">
                          Open the Routine Builder to search and add specific products for each step above.
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ── Pro Tips ────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h2 className="font-display text-lg font-semibold text-amber-800">
                      Pro Tips for {selectedGoal.label}
                    </h2>
                  </div>
                  <div className="space-y-2.5">
                    {selectedGoal.proTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-800">
                          {i + 1}
                        </span>
                        <p className="text-sm text-amber-900 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Bottom CTAs ─────────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to={browseUrl}
                    className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Browse {selectedGoal.label} Products
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Find products suited for {selectedGoal.label.toLowerCase()} with dupes
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto transition-colors" />
                    </div>
                  </Link>
                  <Link
                    to="/ingredient-analyzer"
                    className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <FlaskConical className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Check a Product's Ingredients
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Paste any ingredient list to see if it's right for {selectedGoal.label.toLowerCase()}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary ml-auto transition-colors" />
                    </div>
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  This guide is for educational purposes. Consult a dermatologist for personalised advice.
                </p>

              </motion.div>
            </AnimatePresence>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default SkinGuide;
