import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, RotateCcw, CheckCircle2, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSaveSkinQuiz } from "@/hooks/api/useProfile";
import { useToast } from "@/hooks/use-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
type SkinTypeKey = "dry" | "normal" | "oily" | "combination" | "sensitive";

// ─── Sections & Questions ──────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "basics",
    title: "Skin Basics",
    subtitle: "Understanding your skin's fundamental character",
    questions: [
      {
        id: "feel",
        question: "How does your skin feel a few hours after washing your face (no products applied)?",
        options: [
          { label: "Tight and uncomfortable",         value: "dry" },
          { label: "Comfortable and normal",          value: "normal" },
          { label: "Shiny or greasy all over",        value: "oily" },
          { label: "Oily in T-zone, dry on cheeks",   value: "combination" },
          { label: "Itchy, red or easily irritated",  value: "sensitive" },
        ],
      },
      {
        id: "pores",
        question: "How would you describe your pores?",
        options: [
          { label: "Barely visible anywhere",                           value: "dry" },
          { label: "Small and not noticeable",                          value: "normal" },
          { label: "Large and visible, especially on nose",             value: "oily" },
          { label: "Large on nose and forehead, small on cheeks",       value: "combination" },
          { label: "Normal but my skin often reacts",                   value: "sensitive" },
        ],
      },
    ],
  },
  {
    id: "behaviour",
    title: "Skin Behaviour",
    subtitle: "How your skin acts in everyday situations",
    questions: [
      {
        id: "breakouts",
        question: "How often do you experience breakouts?",
        options: [
          { label: "Rarely — mostly dry flakiness instead",                  value: "dry" },
          { label: "Occasionally, usually around hormonal changes",           value: "normal" },
          { label: "Frequently, especially forehead and chin",                value: "oily" },
          { label: "Sometimes, mostly T-zone",                                value: "combination" },
          { label: "My skin reacts to many products, not always breakouts",   value: "sensitive" },
        ],
      },
      {
        id: "makeup",
        question: "What happens to your makeup or moisturiser a few hours after application?",
        options: [
          { label: "Flakes off, my skin absorbs it completely",  value: "dry" },
          { label: "Stays in place nicely",                      value: "normal" },
          { label: "Slides off — my skin looks slick",           value: "oily" },
          { label: "Breaks down on the nose and forehead",       value: "combination" },
          { label: "Sometimes causes redness or stinging",       value: "sensitive" },
        ],
      },
    ],
  },
  {
    id: "environment",
    title: "Environment & Lifestyle",
    subtitle: "How external factors affect your skin",
    questions: [
      {
        id: "morning",
        question: "How does your skin look first thing in the morning?",
        options: [
          { label: "Dull, sometimes with dry patches",              value: "dry" },
          { label: "Fresh and hydrated",                            value: "normal" },
          { label: "Very shiny — pillow leaves an oil print",       value: "oily" },
          { label: "Shiny on nose/forehead, tight on cheeks",       value: "combination" },
          { label: "Sometimes irritated or reactive overnight",     value: "sensitive" },
        ],
      },
      {
        id: "climate",
        question: "How does your skin react to seasonal or climate changes?",
        options: [
          { label: "Gets very dry and flaky in winter",                              value: "dry" },
          { label: "Minor adjustments needed — mostly fine",                          value: "normal" },
          { label: "Gets oilier in summer heat",                                      value: "oily" },
          { label: "T-zone gets oilier in summer, cheeks drier in winter",           value: "combination" },
          { label: "Easily irritated by heat, cold, wind or humidity",               value: "sensitive" },
        ],
      },
    ],
  },
];

const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions);

// ─── Skin type metadata ────────────────────────────────────────────────────────
const SKIN_TYPES: Record<SkinTypeKey, {
  label: string; emoji: string; description: string;
  keyNeeds: string[]; ingredients: string[]; avoid: string[];
  color: string; accent: string; border: string;
}> = {
  dry: {
    label: "Dry Skin", emoji: "🌿",
    description: "Your skin produces less sebum than normal, which can lead to tightness, flakiness, and a dull complexion. Your barrier needs replenishment.",
    keyNeeds: ["Rich moisturisers", "Ceramides", "Hyaluronic Acid", "Gentle cleansers", "Avoid over-exfoliation"],
    ingredients: ["Ceramides", "Hyaluronic Acid", "Squalane", "Panthenol (Vitamin B5)", "Glycerin", "Shea Butter"],
    avoid: ["Alcohol Denat (high amounts)", "SLS-heavy cleansers", "Over-exfoliation"],
    color: "from-blue-50 to-sky-50", accent: "text-blue-600", border: "border-blue-200",
  },
  normal: {
    label: "Normal Skin", emoji: "✨",
    description: "Your skin is well-balanced — neither too oily nor too dry. You have small pores, minimal blemishes and a healthy complexion. Lucky you!",
    keyNeeds: ["Maintenance routine", "Antioxidant protection", "SPF", "Light hydration"],
    ingredients: ["Niacinamide", "Vitamin C", "Hyaluronic Acid", "SPF", "Peptides"],
    avoid: ["Heavy occlusives", "Skipping SPF"],
    color: "from-green-50 to-emerald-50", accent: "text-green-600", border: "border-green-200",
  },
  oily: {
    label: "Oily Skin", emoji: "💧",
    description: "Your sebaceous glands are overactive, leading to excess shine, enlarged pores and frequent breakouts. The good news: oily skin ages more slowly.",
    keyNeeds: ["Oil control", "Non-comedogenic products", "Lightweight hydration", "Exfoliation"],
    ingredients: ["Niacinamide", "Salicylic Acid", "Zinc", "Azelaic Acid", "Lightweight Hyaluronic Acid"],
    avoid: ["Heavy oils", "Comedogenic ingredients", "Skipping moisturiser"],
    color: "from-amber-50 to-yellow-50", accent: "text-amber-600", border: "border-amber-200",
  },
  combination: {
    label: "Combination Skin", emoji: "⚖️",
    description: "You have different skin types across your face — typically oily T-zone with normal to dry cheeks. Your routine needs to balance both zones.",
    keyNeeds: ["Balanced hydration", "Targeted treatments", "Gentle exfoliation", "Zone-specific care"],
    ingredients: ["Niacinamide", "Hyaluronic Acid", "Salicylic Acid (T-zone)", "Squalane"],
    avoid: ["Heavy creams all over", "Ignoring T-zone oil"],
    color: "from-purple-50 to-violet-50", accent: "text-purple-600", border: "border-purple-200",
  },
  sensitive: {
    label: "Sensitive Skin", emoji: "🌸",
    description: "Your skin reacts easily to ingredients, products or environmental factors. It may become red, sting, itch or break out when exposed to triggers.",
    keyNeeds: ["Minimal ingredients", "Fragrance-free", "Barrier repair", "Gentle actives"],
    ingredients: ["Ceramides", "Centella Asiatica (Cica)", "Allantoin", "Panthenol", "Azelaic Acid", "Bakuchiol"],
    avoid: ["Fragrance", "High-concentration AHAs/BHAs", "Alcohol Denat", "Multiple actives at once"],
    color: "from-rose-50 to-pink-50", accent: "text-rose-600", border: "border-rose-200",
  },
};

// ─── Score calculator ──────────────────────────────────────────────────────────
function calculateResult(answers: string[]): SkinTypeKey {
  const counts: Record<string, number> = { dry: 0, normal: 0, oily: 0, combination: 0, sensitive: 0 };
  answers.forEach((a) => { if (a in counts) counts[a]++; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as SkinTypeKey;
}

// Returns a brief "tendency" label for section summaries
function getTendencyLabel(answers: string[]): { type: SkinTypeKey; confidence: "clear" | "mixed" } {
  const counts: Record<string, number> = { dry: 0, normal: 0, oily: 0, combination: 0, sensitive: 0 };
  answers.forEach((a) => { if (a in counts) counts[a]++; });
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const top = sorted[0][1];
  const second = sorted[1][1];
  return {
    type: sorted[0][0] as SkinTypeKey,
    confidence: top > second ? "clear" : "mixed",
  };
}

// ─── Section Result Card ──────────────────────────────────────────────────────
function SectionResult({
  sectionIndex,
  sectionTitle,
  answers,
  onContinue,
  isLast,
}: {
  sectionIndex: number;
  sectionTitle: string;
  answers: string[];
  onContinue: () => void;
  isLast: boolean;
}) {
  const { type, confidence } = getTendencyLabel(answers);
  const st = SKIN_TYPES[type];

  return (
    <motion.div
      key={`section-result-${sectionIndex}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
    >
      {/* Section badge */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {sectionIndex + 1}
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          Section {sectionIndex + 1} complete — {sectionTitle}
        </span>
      </div>

      {/* Tendency card */}
      <div className={`rounded-2xl border ${st.border} bg-gradient-to-br ${st.color} p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{st.emoji}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {confidence === "clear" ? "Strong signal" : "Mixed signals"}
            </p>
            <h3 className={`font-display text-2xl font-bold ${st.accent}`}>
              {st.label} tendencies
            </h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {confidence === "clear"
            ? `Based on this section, your skin strongly leans toward ${st.label.toLowerCase()} characteristics.`
            : `This section shows mixed signals — you may have a combination of skin traits. The next section will help clarify.`}
        </p>

        {/* Quick ingredient preview */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {st.ingredients.slice(0, 3).map((ing) => (
            <span key={ing} className="rounded-full bg-white/60 border border-white/80 px-2.5 py-1 text-xs font-medium text-foreground">
              {ing}
            </span>
          ))}
          <span className="rounded-full bg-white/40 px-2.5 py-1 text-xs text-muted-foreground">
            +{st.ingredients.length - 3} more
          </span>
        </div>
      </div>

      <Button
        onClick={onContinue}
        className="mt-6 w-full gap-2 font-semibold"
        size="lg"
      >
        {isLast ? "See My Full Result" : `Continue to Section ${sectionIndex + 2}`}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

// ─── Final Result ─────────────────────────────────────────────────────────────
function FinalResult({
  result,
  onReset,
  savedToProfile,
  onSave,
  isSaving,
  user,
}: {
  result: SkinTypeKey;
  onReset: () => void;
  savedToProfile: boolean;
  onSave: () => void;
  isSaving: boolean;
  user: any;
}) {
  const skinType = SKIN_TYPES[result];
  return (
    <motion.div
      key="final-result"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Result banner */}
      <div className={`rounded-3xl border ${skinType.border} bg-gradient-to-br ${skinType.color} p-8 text-center`}>
        <div className="text-5xl mb-4">{skinType.emoji}</div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Your skin type
        </p>
        <h2 className={`font-display text-4xl font-bold mb-4 ${skinType.accent}`}>
          {skinType.label}
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {skinType.description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Key needs */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Your skin needs
          </h3>
          <ul className="space-y-1.5">
            {skinType.keyNeeds.map((need) => (
              <li key={need} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">·</span> {need}
              </li>
            ))}
          </ul>
        </div>

        {/* Best ingredients */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">Best ingredients for you</h3>
          <div className="flex flex-wrap gap-1.5">
            {skinType.ingredients.map((ing) => (
              <span key={ing} className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Avoid */}
        <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3 text-amber-700">
            Ingredients to be cautious with
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skinType.avoid.map((a) => (
              <span key={a} className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Save to profile */}
      {user && !savedToProfile && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Save to your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Earn <span className="font-semibold text-primary">+25 points</span> and get personalised product picks.
            </p>
          </div>
          <Button size="sm" className="flex-shrink-0 gap-1.5" onClick={onSave} disabled={isSaving}>
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
      {user && savedToProfile && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Saved! +25 points earned</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Visit your <Link to="/profile" className="underline">profile</Link> to add more skin details.
            </p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1 font-semibold gap-2">
          <Link to={`/browse?skin_type=${result}`}>
            Browse Products for {skinType.label}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 gap-2">
          <Link to="/ingredient-analyzer">Analyze Ingredients</Link>
        </Button>
        <Button variant="ghost" onClick={onReset} className="sm:w-auto gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const SkinQuiz = () => {
  // Flat question index across all sections
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // "showSectionResult" = we've finished a section and are showing the section summary
  const [showSectionResult, setShowSectionResult] = useState(false);
  // Final result
  const [finalResult, setFinalResult] = useState<SkinTypeKey | null>(null);

  const [savedToProfile, setSavedToProfile] = useState(false);
  const { user } = useAuth();
  const saveSkinQuiz = useSaveSkinQuiz();
  const { toast } = useToast();

  // Derived state
  const totalQ = ALL_QUESTIONS.length;
  const progress = (currentQ / totalQ) * 100;

  // Which section does currentQ belong to?
  let questionsSeen = 0;
  let currentSectionIdx = 0;
  for (let si = 0; si < SECTIONS.length; si++) {
    if (currentQ < questionsSeen + SECTIONS[si].questions.length) {
      currentSectionIdx = si;
      break;
    }
    questionsSeen += SECTIONS[si].questions.length;
  }
  const currentSection = SECTIONS[currentSectionIdx];
  const sectionStartQ  = SECTIONS.slice(0, currentSectionIdx).reduce((sum, s) => sum + s.questions.length, 0);
  const isLastQInSection = currentQ === sectionStartQ + currentSection.questions.length - 1;
  const isLastSection    = currentSectionIdx === SECTIONS.length - 1;
  const sectionAnswers   = answers.slice(sectionStartQ, sectionStartQ + currentSection.questions.length);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    setTimeout(() => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (isLastQInSection) {
        // End of a section — show section result
        setShowSectionResult(true);
        setSelectedOption(null);
      } else {
        // Next question
        setCurrentQ((q) => q + 1);
        setSelectedOption(null);
      }
    }, 350);
  };

  const handleContinueFromSection = () => {
    setShowSectionResult(false);
    if (isLastSection) {
      // All done — compute final result
      setFinalResult(calculateResult(answers.concat(/* already added */ [])));
    } else {
      setCurrentQ((q) => q + 1);
    }
  };

  // Edge case: if answers already has the last question's answer when we set showSectionResult
  // We derive the final result from `answers` at that moment.
  // Fix: compute final after all answers are in
  const handleContinueFromLastSection = () => {
    setShowSectionResult(false);
    setFinalResult(calculateResult(answers));
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setFinalResult(null);
    setSelectedOption(null);
    setShowSectionResult(false);
    setSavedToProfile(false);
  };

  const handleSaveToProfile = async () => {
    if (!finalResult) return;
    try {
      await saveSkinQuiz.mutateAsync({ skinType: finalResult, skinConcerns: [], skinSensitivities: [] });
      setSavedToProfile(true);
      toast({ title: "Saved to your profile! +25 points", description: "Visit your profile to add more details." });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Skin Type Quiz — Find Your Skin Type in 6 Questions"
        description="Not sure if you have oily, dry, combination or sensitive skin? Take Skinevora's 6-question skin type quiz and get personalised ingredient recommendations instantly."
        canonical="/quiz"
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
                  Skin Type Quiz
                </span>
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Discover your
                <br />
                <span className="text-gradient-teal italic">skin type</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
                Answer {totalQ} quick questions across 3 sections to identify your skin type and get
                personalised ingredient and product recommendations.
              </p>

              {/* Section indicators */}
              {!finalResult && (
                <div className="flex justify-center gap-2 mt-6">
                  {SECTIONS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className={`flex h-7 items-center justify-center rounded-full px-3 text-xs font-semibold transition-colors ${
                        i < currentSectionIdx
                          ? "bg-primary text-primary-foreground"
                          : i === currentSectionIdx
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {i < currentSectionIdx ? <CheckCircle2 className="h-3 w-3" /> : i + 1} {s.title}
                      </div>
                      {i < SECTIONS.length - 1 && (
                        <div className={`h-px w-6 ${i < currentSectionIdx ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Quiz / Result */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <AnimatePresence mode="wait">

                {/* Final result */}
                {finalResult ? (
                  <FinalResult
                    result={finalResult}
                    onReset={handleReset}
                    savedToProfile={savedToProfile}
                    onSave={handleSaveToProfile}
                    isSaving={saveSkinQuiz.isPending}
                    user={user}
                  />
                ) : showSectionResult ? (
                  /* Section summary */
                  <SectionResult
                    key={`section-${currentSectionIdx}`}
                    sectionIndex={currentSectionIdx}
                    sectionTitle={currentSection.title}
                    answers={sectionAnswers}
                    onContinue={isLastSection ? handleContinueFromLastSection : handleContinueFromSection}
                    isLast={isLastSection}
                  />
                ) : (
                  /* Questions */
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Section header */}
                    <div className="mb-6 rounded-xl bg-secondary/50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
                        Section {currentSectionIdx + 1} of {SECTIONS.length} — {currentSection.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{currentSection.subtitle}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Question {currentQ + 1} of {totalQ}</span>
                        <span>{Math.round(progress)}% complete</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <motion.div
                          className="h-2 rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <h2 className="font-display text-xl font-semibold text-foreground mb-6 leading-snug">
                      {ALL_QUESTIONS[currentQ].question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3">
                      {ALL_QUESTIONS[currentQ].options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(opt.value)}
                          className={`w-full text-left rounded-2xl border px-5 py-4 text-sm font-medium transition-all duration-200 ${
                            selectedOption === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                                selectedOption === opt.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            />
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Back button */}
                    {currentQ > 0 && (
                      <button
                        onClick={() => {
                          setCurrentQ((q) => q - 1);
                          setAnswers((a) => a.slice(0, -1));
                          setSelectedOption(null);
                          setShowSectionResult(false);
                        }}
                        className="mt-5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                      >
                        ← Go back
                      </button>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SkinQuiz;
