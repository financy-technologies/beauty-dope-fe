import { motion } from "framer-motion";
import { TrendingUp, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrendingDupes } from "@/hooks/api/useDupes";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimatedCounter, staggerContainer, staggerChild } from "@/lib/animations";

function AnimatedStat({ target, prefix = "", suffix = "", label }: { target: number; prefix?: string; suffix?: string; label: string }) {
  const { ref, count } = useAnimatedCounter(target);
  const display = target >= 1000
    ? `${(count / 1000).toFixed(1)}k`
    : target % 1 !== 0
      ? count.toFixed(1)
      : Math.round(count).toString();

  return (
    <div className="text-center">
      <p className="font-display text-4xl font-semibold text-foreground md:text-5xl">
        <span ref={ref}>{prefix}{display}{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const TrendingSection = () => {
  const { data: trendingDupes, isLoading, error } = useTrendingDupes(5);

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Trending List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Trending Now</span>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl mb-8">
              Most-Loved Dupes
            </h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Unable to load trending dupes.</p>
                </div>
              ) : (
                trendingDupes?.map((item) => (
                  <motion.div key={item.id} variants={staggerChild}>
                    <Link
                      to={`/dupe/${item.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-display text-lg font-semibold text-foreground">
                        {item.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">
                          {item.original.brand} → {item.dupe.brand}
                        </p>
                        <p className="truncate font-medium text-foreground">
                          {item.original.name}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{item.votes.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-accent">Save {item.savings}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>

          {/* Right Column - Stats & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="rounded-2xl bg-gradient-hero border border-border/50 p-5 sm:p-8 md:p-12">
              {/* Stats Grid — animated counters */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <AnimatedStat target={2500} suffix="+" label="Verified Dupes" />
                <AnimatedStat target={4000} prefix="₹" suffix="+" label="Avg. Savings" />
                <AnimatedStat target={50000} suffix="+" label="Happy Users" />
                <AnimatedStat target={4.8} label="Community Rating" />
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Join the Community
                </h3>
                <p className="text-muted-foreground">
                  Share your dupe discoveries, rate submissions, and save on luxury beauty products.
                </p>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Get Started Free
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
