import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SKIN_GOALS = [
  { label: "Acne", to: "/skin-guide?goal=acne" },
  { label: "Sensitive Skin", to: "/skin-guide?goal=sensitive-skin" },
  { label: "Dark Spots", to: "/skin-guide?goal=dark-spots" },
  { label: "Dry Skin", to: "/skin-guide?goal=dry-skin" },
  { label: "Oily Skin", to: "/skin-guide?goal=oily-skin" },
  { label: "Anti-aging", to: "/skin-guide?goal=anti-aging" },
];

const CATEGORIES = [
  { label: "Cleansers", to: "/browse?subcategory=cleansers" },
  { label: "Moisturizers", to: "/browse?subcategory=moisturizers" },
  { label: "Sunscreens", to: "/browse?subcategory=sunscreens" },
  { label: "Serums", to: "/browse?subcategory=serums" },
  { label: "Exfoliators", to: "/browse?subcategory=exfoliators" },
  { label: "Toners", to: "/browse?subcategory=toners" },
];

const ACTIVES = [
  { label: "Retinoids", to: "/ingredients?q=retinol" },
  { label: "Vitamin C", to: "/ingredients?q=vitamin c" },
  { label: "Niacinamide", to: "/ingredients?q=niacinamide" },
  { label: "Hyaluronic Acid", to: "/ingredients?q=hyaluronic acid" },
  { label: "AHA", to: "/ingredients?q=aha" },
  { label: "BHA", to: "/ingredients?q=bha" },
];

function LinkPill({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-primary/35 hover:text-primary"
    >
      {label}
    </Link>
  );
}

const StartHere = () => {
  return (
    <section className="py-14 md:py-20">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Start here</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Not sure what to search?</h2>
          <p className="mt-3 text-muted-foreground">Browse by skin goal, category, or ingredient active to quickly narrow your picks.</p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-xl font-semibold">By Skin Goal</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SKIN_GOALS.map((item) => (
                <LinkPill key={item.label} to={item.to} label={item.label} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-xl font-semibold">By Category</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <LinkPill key={item.label} to={item.to} label={item.label} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-xl font-semibold">By Actives</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIVES.map((item) => (
                <LinkPill key={item.label} to={item.to} label={item.label} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartHere;
