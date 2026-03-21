import { motion } from "framer-motion";
import { Search, FlaskConical, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Search Any Product",
    description:
      "Type the name of any luxury skincare or makeup product — foundation, serum, moisturiser, lipstick. We know 50,000+ products.",
  },
  {
    number: "02",
    icon: FlaskConical,
    title: "We Analyse Ingredients",
    description:
      "Our engine compares ingredient lists, active concentrations, and formulation similarities across thousands of affordable alternatives.",
  },
  {
    number: "03",
    icon: BadgeCheck,
    title: "Save Without Compromise",
    description:
      "Get ranked dupes with similarity scores, community ratings, and real savings — so you always know exactly what you're buying.",
  },
];

const HowItWorks = () => (
  <section className="py-20 md:py-28 bg-background">
    <div className="container px-4 md:px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          How it works
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Ingredient science,<br className="hidden sm:block" /> not brand loyalty
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Every recommendation is backed by real ingredient data — not just price or popularity.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="relative grid gap-8 md:grid-cols-3">
        {/* Connector line (desktop only) */}
        <div className="absolute left-0 right-0 top-10 hidden h-px bg-border md:block" style={{ left: "calc(16.67% + 2rem)", right: "calc(16.67% + 2rem)" }} />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative flex flex-col items-center text-center"
          >
            {/* Icon circle */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-card ring-1 ring-border">
              <step.icon className="h-8 w-8 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {step.number.replace("0", "")}
              </span>
            </div>

            <h3 className="mb-3 font-display text-xl font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-14 text-center"
      >
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-all hover:bg-primary/90 hover:shadow-elevated"
        >
          Start Exploring Dupes
        </Link>
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
