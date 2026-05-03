import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya S.",
    location: "Mumbai",
    avatar: "PS",
    text: "Found a ₹350 dupe for my ₹2,400 serum and honestly can't tell the difference. The ingredient comparison convinced me to try it.",
    product: "Vitamin C Serum",
    saved: "₹2,050",
  },
  {
    name: "Ananya R.",
    location: "Bangalore",
    avatar: "AR",
    text: "The ingredient analyzer helped me realise my old moisturiser had 3 comedogenic ingredients. Switched to a dupe and my skin cleared up in weeks.",
    product: "Daily Moisturiser",
    saved: "₹800",
  },
  {
    name: "Meera K.",
    location: "Delhi",
    avatar: "MK",
    text: "I was spending ₹5k+ monthly on skincare. Skinevora helped me build the same routine for under ₹1,500. Same actives, same results.",
    product: "Full Routine",
    saved: "₹3,500/mo",
  },
  {
    name: "Divya T.",
    location: "Hyderabad",
    avatar: "DT",
    text: "Love the skin type matching! It doesn't just find cheaper products — it finds ones that actually suit my sensitive, acne-prone skin.",
    product: "Sunscreen",
    saved: "₹650",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Real people, real savings
          </h2>
          <p className="mt-2 text-muted-foreground">
            See how Skinevora users are building smarter skincare routines
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft flex flex-col"
            >
              <Quote className="h-5 w-5 text-primary/30 mb-3" />
              <p className="text-sm text-foreground leading-relaxed flex-1">
                "{t.text}"
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {t.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold text-green-600 mt-0.5">
                    Saved {t.saved}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
