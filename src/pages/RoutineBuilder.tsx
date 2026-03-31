import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/api/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMyProfile, useSaveRoutine } from "@/hooks/api/useProfile";

type RoutineSlot = {
  id: string;
  step: string;
  productId: string;
  productName: string;
  notes: string;
};

type RoutineState = {
  morning: RoutineSlot[];
  night: RoutineSlot[];
};

const ROUTINE_KEY = "skinevora.routine.v1";

const DEFAULT_STEPS = ["Cleanser", "Treatment", "Moisturizer", "Sunscreen"];

function emptyRoutine(): RoutineState {
  return { morning: [], night: [] };
}

function hasRoutineItems(routine: RoutineState): boolean {
  return routine.morning.length > 0 || routine.night.length > 0;
}

function loadLocalRoutine(): RoutineState {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return emptyRoutine();
    const parsed = JSON.parse(raw) as RoutineState;
    return {
      morning: Array.isArray(parsed?.morning) ? parsed.morning : [],
      night: Array.isArray(parsed?.night) ? parsed.night : [],
    };
  } catch {
    return emptyRoutine();
  }
}

const RoutineBuilder = () => {
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [step, setStep] = useState(DEFAULT_STEPS[0]);
  const [notes, setNotes] = useState("");
  const [period, setPeriod] = useState<"morning" | "night">("morning");
  const [routine, setRoutine] = useState<RoutineState>(emptyRoutine);
  const hydratedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const lastSavedRoutineRef = useRef("");

  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const saveRoutine = useSaveRoutine();
  const saveRoutineMutation = saveRoutine.mutate;
  const { data: products } = useProducts({ search, limit: 20 });

  useEffect(() => {
    const userId = user?.id ?? null;
    if (lastUserIdRef.current !== userId) {
      lastUserIdRef.current = userId;
      hydratedRef.current = false;
      lastSavedRoutineRef.current = "";
    }
  }, [user?.id]);

  useEffect(() => {
    if (hydratedRef.current) return;

    if (user) {
      if (isProfileLoading) return;

      const remoteRoutine = profile?.routineData ?? null;
      const initialRoutine = remoteRoutine ?? loadLocalRoutine();
      setRoutine(initialRoutine);
      lastSavedRoutineRef.current = JSON.stringify(initialRoutine);
      hydratedRef.current = true;

      if (!remoteRoutine && hasRoutineItems(initialRoutine)) {
        saveRoutineMutation(initialRoutine);
      }
      return;
    }

    const localRoutine = loadLocalRoutine();
    setRoutine(localRoutine);
    lastSavedRoutineRef.current = JSON.stringify(localRoutine);
    hydratedRef.current = true;
  }, [user, isProfileLoading, profile?.routineData, saveRoutineMutation]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
    const serialized = JSON.stringify(routine);
    if (serialized === lastSavedRoutineRef.current) return;
    lastSavedRoutineRef.current = serialized;

    if (!user) return;

    const timer = setTimeout(() => {
      saveRoutineMutation(routine);
    }, 600);

    return () => clearTimeout(timer);
  }, [routine, user, saveRoutineMutation]);

  const selectedProduct = useMemo(
    () => products?.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  const addSlot = () => {
    if (!selectedProduct) {
      toast({ title: "Select a product first", variant: "destructive" });
      return;
    }

    const next: RoutineSlot = {
      id: `${selectedProduct.id}-${Date.now()}`,
      step,
      productId: selectedProduct.id,
      productName: `${selectedProduct.brand} ${selectedProduct.name}`,
      notes: notes.trim(),
    };

    setRoutine((prev) => ({
      ...prev,
      [period]: [...prev[period], next],
    }));

    setNotes("");
    setSelectedProductId("");
    toast({ title: "Added to routine" });
  };

  const removeSlot = (bucket: "morning" | "night", slotId: string) => {
    setRoutine((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((slot) => slot.id !== slotId),
    }));
  };

  const clearAll = () => {
    setRoutine(emptyRoutine());
    toast({ title: "Routine cleared" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Routine Builder"
        description="Build and save your AM/PM skincare routine by selecting products and ordering by step."
        canonical="/routine-builder"
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container px-4 md:px-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tools</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Routine Builder</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Create your morning and night routine in minutes, then adjust as your skin goals change.
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground/80">
              {user ? "Signed in: routine syncs to your profile across devices." : "Sign in to sync your routine across devices."}
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h2 className="font-display text-2xl font-semibold">Add Product</h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">When</label>
                    <div className="flex gap-2">
                      <Button type="button" variant={period === "morning" ? "default" : "outline"} onClick={() => setPeriod("morning")}>
                        Morning
                      </Button>
                      <Button type="button" variant={period === "night" ? "default" : "outline"} onClick={() => setPeriod("night")}>
                        Night
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step</label>
                    <select
                      value={step}
                      onChange={(event) => setStep(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {DEFAULT_STEPS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Find product</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product or brand" className="pl-9" />
                    </div>
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-border bg-background">
                      {(products ?? []).map((product) => {
                        const selected = product.id === selectedProductId;
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => setSelectedProductId(product.id)}
                            className={`w-full border-b border-border px-3 py-2 text-left text-sm last:border-0 ${selected ? "bg-primary/10" : "hover:bg-secondary/40"}`}
                          >
                            <p className="font-medium text-foreground">{product.brand} {product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ""}</p>
                          </button>
                        );
                      })}
                      {!products?.length && <p className="px-3 py-2 text-sm text-muted-foreground">No products found.</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (optional)</label>
                    <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Example: Use 3x weekly" />
                  </div>

                  <Button type="button" onClick={addSlot} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add To {period === "morning" ? "Morning" : "Night"} Routine
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">Morning</h3>
                    <span className="text-xs text-muted-foreground">{routine.morning.length} steps</span>
                  </div>
                  <div className="space-y-2">
                    {routine.morning.length === 0 && <p className="text-sm text-muted-foreground">No steps yet.</p>}
                    {routine.morning.map((slot) => (
                      <div key={slot.id} className="rounded-lg border border-border px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{slot.step}</p>
                            <p className="text-sm font-medium text-foreground">{slot.productName}</p>
                            {slot.notes && <p className="mt-1 text-xs text-muted-foreground">{slot.notes}</p>}
                          </div>
                          <button type="button" onClick={() => removeSlot("morning", slot.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">Night</h3>
                    <span className="text-xs text-muted-foreground">{routine.night.length} steps</span>
                  </div>
                  <div className="space-y-2">
                    {routine.night.length === 0 && <p className="text-sm text-muted-foreground">No steps yet.</p>}
                    {routine.night.map((slot) => (
                      <div key={slot.id} className="rounded-lg border border-border px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{slot.step}</p>
                            <p className="text-sm font-medium text-foreground">{slot.productName}</p>
                            {slot.notes && <p className="mt-1 text-xs text-muted-foreground">{slot.notes}</p>}
                          </div>
                          <button type="button" onClick={() => removeSlot("night", slot.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={clearAll} className="w-full">Clear Routine</Button>
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
