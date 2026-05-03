import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Plus, Trash2, Sun, Moon, Loader2, X,
  Sparkles, ChevronDown, CheckCircle2, CloudSun, Save,
  Bell, Calendar, Flame, ArrowRightLeft, TrendingDown,
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

// Extended slot with optional price
interface ExtendedSlot extends ProfileRoutineSlot {
  price?: number;
}

// ─── Routine Logs ────────────────────────────────────────────────────────────
interface RoutineLogEntry {
  date: string; // YYYY-MM-DD
  morning: boolean;
  night: boolean;
}

const LOGS_KEY = "skinevora.routine.logs.v1";
const REMINDERS_KEY = "skinevora.routine.reminders.v1";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLogs(): RoutineLogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? (JSON.parse(raw) as RoutineLogEntry[]) : [];
  } catch { return []; }
}

function saveLogs(logs: RoutineLogEntry[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function calcStreak(logs: RoutineLogEntry[]): number {
  const completed = new Set(
    logs.filter((l) => l.morning || l.night).map((l) => l.date),
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (completed.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    days.push(t.toISOString().slice(0, 10));
  }
  return days;
}

// ─── Reminders ───────────────────────────────────────────────────────────────
interface ReminderPrefs {
  amEnabled: boolean;
  pmEnabled: boolean;
  amTime: string; // "07:00"
  pmTime: string; // "21:00"
}

function loadReminders(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) return JSON.parse(raw) as ReminderPrefs;
  } catch {}
  return { amEnabled: false, pmEnabled: false, amTime: "07:00", pmTime: "21:00" };
}

function saveReminders(prefs: ReminderPrefs) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(prefs));
}

// ─── Dupe types ──────────────────────────────────────────────────────────────
interface DupeResult {
  id: string;
  similarityScore: number;
  savingsPercent: number;
  dupeProduct: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl?: string;
  };
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
  onSwap,
}: {
  slot: ExtendedSlot;
  index: number;
  onRemove: () => void;
  onSwap: (dupe: DupeResult["dupeProduct"]) => void;
}) {
  const stepMeta = STEPS.find((s) => s.value === slot.step);
  const colorClass = STEP_COLORS[slot.step] ?? STEP_COLORS.Other;
  const [showDupes, setShowDupes] = useState(false);

  const { data: dupes, isFetching: dupesFetching } = useQuery<DupeResult[]>({
    queryKey: ["slot-dupes", slot.productId],
    queryFn: () => api.get<DupeResult[]>(`/dupes/by-product/${slot.productId}`),
    enabled: showDupes,
    staleTime: 60_000,
  });

  const topDupes = (dupes ?? []).slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-3 p-3">
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
            {(slot as ExtendedSlot).price != null && (
              <span className="text-[10px] font-semibold text-muted-foreground">
                ₹{Number((slot as ExtendedSlot).price).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground leading-tight">
            {slot.productName}
          </p>
          {slot.notes && (
            <p className="mt-0.5 text-xs text-muted-foreground italic">"{slot.notes}"</p>
          )}
          {/* Find cheaper alternative link */}
          <button
            type="button"
            onClick={() => setShowDupes((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline underline-offset-2"
          >
            <TrendingDown className="h-3 w-3" />
            {showDupes ? "Hide alternatives" : "Find cheaper alternative"}
          </button>
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
      </div>

      {/* Dupes section */}
      <AnimatePresence>
        {showDupes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 pb-3 pt-2 space-y-1.5">
              {dupesFetching && (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Finding alternatives...
                </div>
              )}
              {!dupesFetching && topDupes.length === 0 && (
                <p className="text-xs text-muted-foreground py-1">No cheaper alternatives found.</p>
              )}
              {topDupes.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{d.dupeProduct.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.dupeProduct.brand} · ₹{Number(d.dupeProduct.price).toLocaleString("en-IN")}
                      {d.savingsPercent > 0 && (
                        <span className="ml-1 text-emerald-600 font-semibold">
                          {d.savingsPercent}% cheaper
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSwap(d.dupeProduct)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <ArrowRightLeft className="h-2.5 w-2.5" />
                    Swap
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  const [logs, setLogs] = useState<RoutineLogEntry[]>(loadLogs);
  const [reminders, setReminders] = useState<ReminderPrefs>(loadReminders);

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
    const slot: ExtendedSlot = {
      id: `${selectedProduct.id}-${Date.now()}`,
      step,
      productId: selectedProduct.id,
      productName: `${selectedProduct.brand} ${selectedProduct.name}`,
      notes: notes.trim(),
      price: selectedProduct.price || undefined,
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

  // ── Total routine cost ────────────────────────────────────────────────────
  const totalCost = [...routine.morning, ...routine.night].reduce(
    (sum, s) => sum + ((s as ExtendedSlot).price ?? 0), 0,
  );

  // ── Routine logs ──────────────────────────────────────────────────────────
  const today = todayStr();
  const todayLog = logs.find((l) => l.date === today);
  const streak = calcStreak(logs);
  const last30 = getLast30Days();
  const completedDates = new Set(logs.filter((l) => l.morning || l.night).map((l) => l.date));

  const toggleLog = useCallback((period: "morning" | "night") => {
    setLogs((prev) => {
      const existing = prev.find((l) => l.date === today);
      let next: RoutineLogEntry[];
      if (existing) {
        next = prev.map((l) =>
          l.date === today ? { ...l, [period]: !l[period] } : l,
        );
      } else {
        next = [...prev, { date: today, morning: period === "morning", night: period === "night" }];
      }
      saveLogs(next);
      return next;
    });
  }, [today]);

  // ── Reminders scheduling ──────────────────────────────────────────────────
  const scheduleNotification = useCallback((label: string, timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target.getTime() - now.getTime();
    return setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Skinevora Routine Reminder", {
          body: `Time for your ${label} skincare routine!`,
          icon: "/favicon.ico",
        });
      }
    }, ms);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reminders.amEnabled) timers.push(scheduleNotification("morning", reminders.amTime));
    if (reminders.pmEnabled) timers.push(scheduleNotification("night", reminders.pmTime));
    return () => timers.forEach(clearTimeout);
  }, [reminders, scheduleNotification]);

  const toggleReminder = useCallback((which: "am" | "pm") => {
    const key = which === "am" ? "amEnabled" : "pmEnabled";
    const newVal = !reminders[key];
    if (newVal && typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "denied") {
            toast({ title: "Notification permission denied", variant: "destructive" });
          }
        });
      } else if (Notification.permission === "denied") {
        toast({ title: "Notifications blocked — enable in browser settings", variant: "destructive" });
        return;
      }
    } else if (newVal && typeof Notification === "undefined") {
      toast({ title: "Browser notifications not supported", variant: "destructive" });
      return;
    }
    const updated = { ...reminders, [key]: newVal };
    setReminders(updated);
    saveReminders(updated);
  }, [reminders, toast]);

  // ── Swap handler ──────────────────────────────────────────────────────────
  const swapProduct = useCallback(
    (bucket: "morning" | "night", slotId: string, dupe: DupeResult["dupeProduct"]) => {
      setRoutine((prev) => ({
        ...prev,
        [bucket]: prev[bucket].map((s) =>
          s.id === slotId
            ? {
                ...s,
                productId: dupe.id,
                productName: `${dupe.brand} ${dupe.name}`,
                price: dupe.price,
              } as ExtendedSlot
            : s,
        ),
      }));
      toast({ title: `Swapped to ${dupe.brand} ${dupe.name} ✓` });
    },
    [toast],
  );

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
                    {totalCost > 0 && (
                      <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                        <span className="text-xs font-semibold text-emerald-700">₹{totalCost.toLocaleString("en-IN")} total</span>
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

                {/* ── Routine Log Section ──────────────────────────── */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily Log</span>
                    </div>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5">
                        <Flame className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700">{streak} day streak</span>
                      </div>
                    )}
                  </div>

                  {/* Mark as done buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLog("morning")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        todayLog?.morning
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      {todayLog?.morning ? "AM Done ✓" : "Mark AM Done"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLog("night")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all ${
                        todayLog?.night
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      {todayLog?.night ? "PM Done ✓" : "Mark PM Done"}
                    </button>
                  </div>

                  {/* 30-day calendar grid */}
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">Last 30 days</p>
                    <div className="grid grid-cols-7 gap-1">
                      {last30.map((d) => {
                        const done = completedDates.has(d);
                        const isToday = d === today;
                        return (
                          <div
                            key={d}
                            title={d}
                            className={`h-5 w-full rounded-sm flex items-center justify-center text-[8px] font-bold ${
                              done
                                ? "bg-emerald-400 text-white"
                                : isToday
                                  ? "border border-primary/40 bg-primary/5 text-primary"
                                  : "bg-muted/50 text-muted-foreground/40"
                            }`}
                          >
                            {new Date(d).getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                              slot={slot as ExtendedSlot}
                              index={i}
                              onRemove={() => removeSlot(activeTab, slot.id)}
                              onSwap={(dupe) => swapProduct(activeTab, slot.id, dupe)}
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

                {/* ── Reminders Section ──────────────────────────────── */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reminders</span>
                  </div>
                  <div className="space-y-2">
                    {/* AM reminder */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-foreground">Morning</span>
                        <span className="text-[10px] text-muted-foreground">{reminders.amTime.replace(":", ":")} AM</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleReminder("am")}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          reminders.amEnabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                            reminders.amEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                    </div>
                    {/* PM reminder */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Moon className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-xs font-semibold text-foreground">Night</span>
                        <span className="text-[10px] text-muted-foreground">{reminders.pmTime.replace(":", ":")} PM</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleReminder("pm")}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          reminders.pmEnabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                            reminders.pmEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {(reminders.amEnabled || reminders.pmEnabled) && (
                    <p className="text-[10px] text-muted-foreground">
                      Keep this tab open to receive notifications.
                    </p>
                  )}
                </div>

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
