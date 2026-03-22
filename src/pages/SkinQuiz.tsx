import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ─── Quiz data ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "feel",
    question: "How does your skin feel a few hours after washing your face (no products applied)?",
    options: [
      { label: "Tight and uncomfortable", value: "dry" },
      { label: "Comfortable and normal", value: "normal" },
      { label: "Shiny or greasy all over", value: "oily" },
      { label: "Oily in T-zone, dry on cheeks", value: "combination" },
      { label: "Itchy, red or easily irritated", value: "sensitive" },
    ],
  },
  {
    id: "pores",
    question: "How would you describe your pores?",
    options: [
      { label: "Barely visible anywhere", value: "dry" },
      { label: "Small and not noticeable", value: "normal" },
      { label: "Large and visible, especially on nose", value: "oily" },
      { label: "Large on nose and forehead, small on cheeks", value: "combination" },
      { label: "Normal but my skin often reacts", value: "sensitive" },
    ],
  },
  {
    id: "breakouts",
    question: "How often do you experience breakouts?",
    options: [
      { label: "Rarely — mostly dry flakiness instead", value: "dry" },
      { label: "Occasionally, usually around hormonal changes", value: "normal" },
      { label: "Frequently, especially forehead and chin", value: "oily" },
      { label: "Sometimes, mostly T-zone", value: "combination" },
      { label: "My skin reacts to many products, not always breakouts", value: "sensitive" },
    ],
  },
  {
    id: "makeup",
    question: "What happens to your makeup or moisturiser a few hours after application?",
    options: [
      { label: "Flakes off, my skin absorbs it completely", value: "dry" },
      { label: "Stays in place nicely", value: "normal" },
      { label: "Slides off — my skin looks slick", value: "oily" },
      { label: "Breaks down on the nose and forehead", value: "combination" },
      { label: "Sometimes causes redness or stinging", value: "sensitive" },
    ],
  },
  {
    id: "morning",
    question: "How does your skin look first thing in the morning?",
    options: [
      { label: "Dull, sometimes with dry patches", value: "dry" },
      { label: "Fresh and hydrated", value: "normal" },
      { label: "Very shiny — pillow leaves an oil print", value: "oily" },
      { label: "Shiny on nose/forehead, tight on cheeks", value: "combination" },
      { label: "Sometimes irritated or reactive overnight", value: "sensitive" },
    ],
  },
  {
    id: "climate",
    question: "How does your skin react to seasonal or climate changes?",
    options: [
      { label: "Gets very dry and flaky in winter", value: "dry" },
      { label: "Minor adjustments needed — mostly fine", value: "normal" },
      { label: "Gets oilier in summer heat", value: "oily" },
      { label: "T-zone gets oilier in summer, cheeks drier in winter", value: "combination" },
      { label: "Easily irritated by heat, cold, wind or humidity", value: "sensitive" },
    ],
  },
];

// ─── Skin type result definitions ─────────────────────────────────────────────
const SKIN_TYPES = {
  dry: {
    label: "Dry Skin",
    emoji: "🌿",
    description: "Your skin produces less sebum than normal, which can lead to tightness, flakiness, and a dull complexion. Your barrier needs replenishment.",
    keyNeeds: ["Rich moisturisers", "Ceramides", "Hyaluronic Acid", "Gentle cleansers", "Avoid over-exfoliation"],
    ingredients: ["Ceramides", "Hyaluronic Acid", "Squalane", "Panthenol (Vitamin B5)", "Glycerin", "Shea Butter"],
    avoid: ["Alcohol Denat (high amounts)", "SLS-heavy cleansers", "Over-exfoliation"],
    color: "from-blue-50 to-sky-50",
    accent: "text-blue-600",
    border: "border-blue-200",
  },
  normal: {
    label: "Normal Skin",
    emoji: "✨",
    description: "Your skin is well-balanced — neither too oily nor too dry. You have small pores, minimal blemishes and a healthy complexion. Lucky you!",
    keyNeeds: ["Maintenance routine", "Antioxidant protection", "SPF", "Light hydration"],
    ingredients: ["Niacinamide", "Vitamin C", "Hyaluronic Acid", "SPF", "Peptides"],
    avoid: ["Heavy occlusives", "Skipping SPF"],
    color: "from-green-50 to-emerald-50",
    accent: "text-green-600",
    border: "border-green-200",
  },
  oily: {
    label: "Oily Skin",
    emoji: "💧",
    description: "Your sebaceous glands are overactive, leading to excess shine, enlarged pores and frequent breakouts. The good news: oily skin ages more slowly.",
    keyNeeds: ["Oil control", "Non-comedogenic products", "Lightweight hydration", "Exfoliation"],
    ingredients: ["Niacinamide", "Salicylic Acid", "Zinc", "Azelaic Acid", "Lightweight Hyaluronic Acid"],
    avoid: ["Heavy oils", "Comedogenic ingredients", "Skipping moisturiser"],
    color: "from-amber-50 to-yellow-50",
    accent: "text-amber-600",
    border: "border-amber-200",
  },
  combination: {
    label: "Combination Skin",
    emoji: "⚖️",
    description: "You have different skin types across your face — typically oily T-zone (forehead, nose, chin) with normal to dry cheeks. Your routine needs to balance both zones.",
    keyNeeds: ["Balanced hydration", "Targeted treatments", "Gentle exfoliation", "Zone-specific care"],
    ingredients: ["Niacinamide", "Hyaluronic Acid", "Salicylic Acid (T-zone)", "Squalane"],
    avoid: ["Heavy creams all over", "Ignoring T-zone oil"],
    color: "from-purple-50 to-violet-50",
    accent: "text-purple-600",
    border: "border-purple-200",
  },
  sensitive: {
    label: "Sensitive Skin",
    emoji: "🌸",
    description: "Your skin reacts easily to ingredients, products or environmental factors. It may become red, sting, itch or break out when exposed to triggers.",
    keyNeeds: ["Minimal ingredients", "Fragrance-free", "Barrier repair", "Gentle actives"],
    ingredients: ["Ceramides", "Centella Asiatica (Cica)", "Allantoin", "Panthenol", "Azelaic Acid", "Bakuchiol"],
    avoid: ["Fragrance", "High-concentration AHAs/BHAs", "Alcohol Denat", "Multiple actives at once"],
    color: "from-rose-50 to-pink-50",
    accent: "text-rose-600",
    border: "border-rose-200",
  },
};

// ─── Score calculator ──────────────────────────────────────────────────────────
function calculateResult(answers: string[]): keyof typeof SKIN_TYPES {
  const counts: Record<string, number> = { dry: 0, normal: 0, oily: 0, combination: 0, sensitive: 0 };
  answers.forEach((a) => { if (a in counts) counts[a]++; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as keyof typeof SKIN_TYPES;
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const SkinQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<keyof typeof SKIN_TYPES | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    setTimeout(() => {
      const newAnswers = [...answers, value];
      if (currentQ + 1 < QUESTIONS.length) {
        setAnswers(newAnswers);
        setCurrentQ((q) => q + 1);
        setSelectedOption(null);
      } else {
        setResult(calculateResult(newAnswers));
      }
    }, 350);
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setSelectedOption(null);
  };

  const skinType = result ? SKIN_TYPES[result] : null;

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
                Answer {QUESTIONS.length} quick questions to identify your skin type and get
                personalised ingredient and product recommendations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quiz / Result */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">

              <AnimatePresence mode="wait">

                {/* Result */}
                {result && skinType ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  >
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
                        <h3 className="font-semibold text-sm mb-3">
                          Best ingredients for you
                        </h3>
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

                    {/* CTAs */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button asChild className="flex-1 font-semibold gap-2">
                        <Link to={`/browse?skin_type=${result}`}>
                          Browse Products for {skinType.label}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 gap-2">
                        <Link to="/ingredient-analyzer">
                          Analyze Ingredients
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={handleReset} className="sm:w-auto gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Retake
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* Questions */
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Progress bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
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
                      {QUESTIONS[currentQ].question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3">
                      {QUESTIONS[currentQ].options.map((opt) => (
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
