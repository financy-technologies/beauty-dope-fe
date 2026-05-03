import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, scaleIn } from "@/lib/animations";

const SKIN_GOALS = [
  { label: "Acne", to: "/skin-guide?goal=acne" },
  { label: "Sensitive Skin", to: "/skin-guide?goal=sensitive-skin" },
  { label: "Dark Spots", to: "/skin-guide?goal=dark-spots" },
  { label: "Dry Skin", to: "/skin-guide?goal=dry-skin" },
  { label: "Oily Skin", to: "/skin-guide?goal=oily-skin" },
  { label: "Anti-aging", to: "/skin-guide?goal=anti-aging" },
];

const CATEGORIES = [
  { label: "Cleansers",    to: "/browse?subcategory=cleanser" },
  { label: "Moisturizers", to: "/browse?subcategory=moisturiser" },
  { label: "Sunscreens",   to: "/browse?subcategory=sunscreen" },
  { label: "Serums",       to: "/browse?subcategory=serum" },
  { label: "Foundations",  to: "/browse?subcategory=foundation" },
  { label: "Lipsticks",    to: "/browse?subcategory=lipstick" },
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
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
      <Link
        to={to}
        className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-primary/35 hover:text-primary"
      >
        {label}
      </Link>
    </motion.div>
  );
}

const SECTIONS = [
  { title: "By Skin Goal", items: SKIN_GOALS },
  { title: "By Category", items: CATEGORIES },
  { title: "By Actives", items: ACTIVES },
];

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

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 grid gap-6 lg:grid-cols-3"
        >
          {SECTIONS.map((section) => (
            <motion.div key={section.title} variants={scaleIn} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-xl font-semibold">{section.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <LinkPill key={item.label} to={item.to} label={item.label} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StartHere;
