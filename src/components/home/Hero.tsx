import { useState } from "react";
import { Search, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TRUST_PILLS = [
  { icon: ShieldCheck, label: "Ingredient-verified" },
  { icon: Zap,         label: "2,500+ dupes" },
  { icon: Sparkles,    label: "AI-matched" },
];

const POPULAR = ["Charlotte Tilbury", "Drunk Elephant", "La Mer", "Tom Ford", "Tatcha"];

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="container relative px-4 py-24 md:py-36 md:px-6">
        <div className="mx-auto max-w-4xl text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Science-backed beauty dupes
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Luxury Look.
            <br />
            <span className="text-gradient-teal italic">Half the Price.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            Skinevora matches luxury skincare & makeup products with affordable dupes
            using ingredient science — not guesswork.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search a product or brand, e.g. La Mer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-xl border-border/60 bg-background/85 pl-12 pr-4 text-base shadow-card backdrop-blur-sm focus-visible:ring-primary"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 rounded-xl px-8 font-semibold shadow-gold tracking-wide"
            >
              Find Dupes
            </Button>
          </motion.form>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </motion.div>

          {/* Popular searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Popular
            </span>
            {POPULAR.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  setSearchQuery(brand);
                  navigate(`/browse?q=${encodeURIComponent(brand)}`);
                }}
                className="text-sm text-foreground/70 underline underline-offset-4 decoration-primary/30 transition-colors hover:text-primary hover:decoration-primary"
              >
                {brand}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/30 to-transparent" />
    </section>
  );
};

export default Hero;
