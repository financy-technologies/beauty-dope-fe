import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Plus, Trash2, Sun, Moon, Loader2, X,
  Sparkles, ChevronDown, CheckCircle2, CloudSun, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMyProfile, useSaveRoutine } from "@/hooks/api/useProfile";
import type { ProfileRoutineData, ProfileRoutineSlot } from "@/hooks/api/useProfile";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/integrations/api/client";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  category: string;
  subcategory?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUTINE_KEY = "skinevora.routine.v1";

const STEPS = [
  { value: "Cleanser",     emoji: "🧼", desc: "Remove dirt, oil and makeup" },
  { value: "Toner",        emoji: "💧", desc: "Balance pH and prep skin" },
  { value: "Serum",        emoji: "🔬", desc: "Active treatment layer" },
  { value: "Eye Cream",    emoji: "👁️",  desc: "Delicate under-eye area" },
  { value: "Moisturiser",  emoji: "🧴", desc: "Lock in hydration" },
  { value: "Sunscreen",    emoji: "☀️",  desc: "AM only — non-negotiable" },
  { value: "Treatment",    emoji: "⚗️",  desc: "Spot treatment or retinoid" },
  { value: "Facial Oil",   emoji: "🌿", desc: "Seal and nourish (PM)" },
  { value: "Mask",         emoji: "🎭", desc: "Weekly treatment" },
  { value: "Other",        emoji: "✨",  desc: "Custom step" },
];

const STEP_COLORS: Record<string, string> = {
  Cleanser:    "bg-blue-50   border-blue-200   text-blue-700",
  Toner:       "bg-sky-50    border-sky-200    text-sky-700",
  Serum:       "bg-violet-50 border-violet-200 text-violet-700",
  "Eye Cream": "bg-rose-50   border-rose-200   text-rose-700",
  Moisturiser: "bg-emerald-50 border-emerald-200 text-emerald-700",
  Sunscreen:   "bg-amber-50  border-amber-200  text-amber-700",
  Treatment:   "bg-purple-50 border-purple-200 text-purple-700",
  "Facial Oil":"bg-green-50  border-green-200  text-green-700",
  Mask:        "bg-pink-50   border-pink-200   text-pink-700",
  Other:       "bg-muted     border-border     text-foreground",
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
function emptyRoutine(): ProfileRoutineData {
  return { morning: [], night: [] };
}

function loadLocalRoutine(): ProfileRoutineData {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return emptyRoutine();
    const p = JSON.parse(raw) as ProfileRoutineData;
    return {
      morning: Array.isArray(p?.morning) ? p.morning : [],
      night:   Array.isArray(p?.night)   ? p.night   : [],
    };
  } catch {
    return emptyRoutine();
  }
}

// ─── Product search hook (server-side, debounced) ─────────────────────────────
function useProductSearch(query: string) {
  return useQuery<Product[]>({
    queryKey: ["product-search", query],
    queryFn: () =>
      query.trim().length >= 2
        ? api.get<Product[]>(`/products?q=${encodeURIComponent(query.trim())}&limit=8`)
        : Promise.resolve([]),
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}

// ─── Routine slot card ────────────────────────────────────────────────────────
function SlotCard({
  slot,
  index,
  onRemove,
}: {
  slot: ProfileRoutineSlot;
  index: number;
  onRemove: () => void;
}) {
  const stepMeta = STEPS.find((s) => s.value === slot.step);
  const colorClass = STEP_COLORS[slot.step] ?? STEP_COLORS.Other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors"
    >
      {/* Step number */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
            {stepMeta?.emoji} {slot.step}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-foreground leading-tight">
          {slot.productName}
        </p>
        {slot.notes && (
          <p className="mt-0.5 text-xs text-muted-foreground italic">"{slot.notes}"</p>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
        aria-label="Remove step"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Empty routine state ──────────────────────────────────────────────────────
function EmptyRoutine({ period }: { period: "morning" | "night" }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
      {period === "morning"
        ? <Sun className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
        : <Moon className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
      }
      <p className="text-sm text-muted-foreground">No steps added yet.</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">Use the form to add your first step.</p>
    </div>
  );
}

// ─── Product search dropdown ──────────────────────────────────────────────────
function ProductSearchDropdown({
  onSelect,
}: {
  onSelect: (p: Product) => void;
}) {
  const [inputValue, setInputValue]     = useState("");
  const [debouncedQ, setDebouncedQ]     = useState("");
  const [isOpen, setIsOpen]             = useState(false);
  const [selected, setSelected]         = useState<Product | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isFetching } = useProductSearch(debouncedQ);

  const handleChange = (val: string) => {
    setInputValue(val);
    setSelected(null);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(val.trim()), 300);
  };

  const handleSelect = (p: Product) => {
    setSelected(p);
    setInputValue(`${p.brand} — ${p.name}`);
    setIsOpen(false);
    onSelect(p);
  };

  const handleClear = () => {
    setSelected(null);
    setInputValue("");
    setDebouncedQ("");
    setIsOpen(false);
    onSelect(null as any);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = isOpen && inputValue.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        {isFetching ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        ) : selected ? (
          <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => inputValue.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search brand or product name…"
          className={`pl-9 pr-8 ${selected ? "border-primary/40 bg-primary/5" : ""}`}
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Hint */}
      {!selected && inputValue.length > 0 && inputValue.length < 2 && (
        <p className="mt-1 text-xs text-muted-foreground px-1">Type 1 more character to search…</p>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-border bg-background shadow-elevated overflow-hidden max-h-56 overflow-y-auto"
          >
            {isFetching && (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </div>
            )}

            {!isFetching && results.length === 0 && (
              <div className="py-5 px-4 text-center">
                <p className="text-sm font-medium text-foreground">No products found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different name or brand.</p>
              </div>
            )}

            {!isFetching && results.length > 0 && (
              <div className="divide-y divide-border/60">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {p.brand.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.brand}{p.price ? ` · ₹${Number(p.price).toLocaleString("en-IN")}` : ""}
                      </p>
                    </div>
                    {p.category && (
                      <span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground flex-shrink-0 capitalize">
                        {p.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const RoutineBuilder = () => {
  const [step, setStep]     = useState(STEPS[0].value);
  const [notes, setNotes]   = useState("");
  const [period, setPeriod] = useState<"morning" | "night">("morning");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [routine, setRoutine]  = useState<ProfileRoutineData>(emptyRoutine);
  const [activeTab, setActiveTab] = useState<"morning" | "night">("morning");

  const hydratedRef        = useRef(false);
  const lastUserIdRef      = useRef<string | null>(null);
  const lastSavedRef       = useRef("");

  const { toast }                  = useToast();
  const { user }                   = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const saveRoutineMut             = useSaveRoutine();

  // ── Hydrate from profile / localStorage ───────────────────────────────────
  useEffect(() => {
    const uid = user?.id ?? null;
    if (lastUserIdRef.current !== uid) {
      lastUserIdRef.current = uid;
      hydratedRef.current = false;
      lastSavedRef.current = "";
    }
  }, [user?.id]);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (user) {
      if (isProfileLoading) return;
      const remote  = profile?.routineData ?? null;
      const initial = remote ?? loadLocalRoutine();
      setRoutine(initial);
      lastSavedRef.current = JSON.stringify(initial);
      hydratedRef.current  = true;
      if (!remote && (initial.morning.length > 0 || initial.night.length > 0)) {
        saveRoutineMut.mutate(initial);
      }
      return;
    }
    const local = loadLocalRoutine();
    setRoutine(local);
    lastSavedRef.current = JSON.stringify(local);
    hydratedRef.current  = true;
  }, [user, isProfileLoading, profile?.routineData, saveRoutineMut]);

  // ── Auto-save (debounced) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
    const s = JSON.stringify(routine);
    if (s === lastSavedRef.current) return;
    lastSavedRef.current = s;
    if (!user) return;
    const t = setTimeout(() => saveRoutineMut.mutate(routine), 600);
    return () => clearTimeout(t);
  }, [routine, user, saveRoutineMut]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addSlot = () => {
    if (!selectedProduct) {
      toast({ title: "Select a product first", variant: "destructive" });
      return;
    }
    const slot: ProfileRoutineSlot = {
      id: `${selectedProduct.id}-${Date.now()}`,
      step,
      productId: selectedProduct.id,
      productName: `${selectedProduct.brand} ${selectedProduct.name}`,
      notes: notes.trim(),
    };
    setRoutine((prev) => ({ ...prev, [period]: [...prev[period], slot] }));
    setSelectedProduct(null);
    setNotes("");
    setActiveTab(period);
    toast({ title: `Added to ${period} routine ✓` });
  };

  const removeSlot = (bucket: "morning" | "night", id: string) =>
    setRoutine((prev) => ({ ...prev, [bucket]: prev[bucket].filter((s) => s.id !== id) }));

  const clearAll = () => {
    setRoutine(emptyRoutine());
    toast({ title: "Routine cleared" });
  };

  const totalSteps = routine.morning.length + routine.night.length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Routine Builder — Build Your AM/PM Skincare Routine"
        description="Build and save your personalised AM/PM skincare routine. Add steps, pick products, and sync across devices with Skinevora."
        canonical="/routine-builder"
      />
      <Header />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
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
                  Routine Builder
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Build your
                <br />
                <span className="text-gradient-teal italic">AM/PM routine</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Add products step-by-step. Your routine saves automatically
                {user ? " and syncs to your profile." : " to this device."}
              </p>

              {/* Sync status */}
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                {user ? (
                  <>
                    <Save className="h-3.5 w-3.5 text-primary" />
                    <span>Syncing to your profile across devices</span>
                  </>
                ) : (
                  <>
                    <span>Saved locally only —</span>
                    <Link to="/login" className="text-primary underline underline-offset-2 font-medium">
                      sign in to sync
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[420px_1fr]">

              {/* ── LEFT: Add product form ─────────────────────────────── */}
              <div>
                <div className="sticky top-20 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                  {/* Card header */}
                  <div className="bg-secondary/30 px-5 py-4 border-b border-border">
                    <h2 className="font-display text-xl font-semibold text-foreground">Add a Step</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Search a product and assign it to a step.</p>
                  </div>

                  <div className="px-5 py-5 space-y-5">

                    {/* When */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        When
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPeriod("morning")}
                          className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                            period === "morning"
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-border bg-background text-muted-foreground hover:bg-secondary/40"
                          }`}
                        >
                          <Sun className="h-4 w-4" />
                          Morning
                        </button>
                        <button
                          type="button"
                          onClick={() => setPeriod("night")}
                          className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                            period === "night"
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-border bg-background text-muted-foreground hover:bg-secondary/40"
                          }`}
                        >
                          <Moon className="h-4 w-4" />
                          Night
                        </button>
                      </div>
                    </div>

                    {/* Step type */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Step type
                      </label>
                      <div className="relative">
                        <select
                          value={step}
                          onChange={(e) => setStep(e.target.value)}
                          className="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {STEPS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.emoji}  {s.value} — {s.desc}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Product search */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Find product
                      </label>
                      <ProductSearchDropdown
                        onSelect={(p) => setSelectedProduct(p ?? null)}
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Note <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
                      </label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Use 3× weekly, avoid eyes…"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Add button */}
                    <Button
                      type="button"
                      onClick={addSlot}
                      disabled={!selectedProduct}
                      className="w-full gap-2 rounded-xl h-11 font-semibold"
                    >
                      <Plus className="h-4 w-4" />
                      Add to {period === "morning" ? "Morning" : "Night"} Routine
                    </Button>

                    {!selectedProduct && (
                      <p className="text-center text-xs text-muted-foreground -mt-2">
                        Search and select a product above to continue
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Routine view ────────────────────────────────── */}
              <div className="space-y-5">

                {/* Stats bar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-foreground">{routine.morning.length} morning</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                      <Moon className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-foreground">{routine.night.length} night</span>
                    </div>
                    {totalSteps > 0 && (
                      <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                        <CloudSun className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">{totalSteps} total steps</span>
                      </div>
                    )}
                  </div>
                  {totalSteps > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* AM / PM tabs */}
                <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                  {(["morning", "night"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-background shadow-soft text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "morning"
                        ? <Sun className="h-4 w-4 text-amber-500" />
                        : <Moon className="h-4 w-4 text-indigo-500" />
                      }
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        activeTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {routine[tab].length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Routine steps */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {routine[activeTab].length === 0 ? (
                      <EmptyRoutine period={activeTab} />
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {routine[activeTab].map((slot, i) => (
                            <SlotCard
                              key={slot.id}
                              slot={slot}
                              index={i}
                              onRemove={() => removeSlot(activeTab, slot.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Step legend */}
                {totalSteps > 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
                      Routine tip
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Apply products thinnest to thickest — serums before moisturisers, and always finish your morning routine with SPF.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default RoutineBuilder;
