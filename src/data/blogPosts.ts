export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  tagColor: string;
  readingTime: string;
  publishedAt: string;   // ISO date string
  author: string;
  coverEmoji: string;    // fallback cover
  content: BlogSection[];
  relatedSlugs?: string[];
}

export interface BlogSection {
  type: "paragraph" | "heading" | "subheading" | "ingredient-card" | "tip-box" | "warning-box" | "ingredient-list" | "table";
  text?: string;
  items?: IngredientItem[];
  rows?: string[][];
  headers?: string[];
}

export interface IngredientItem {
  name: string;
  inci: string;
  benefit: string;
  skinTypes: string[];
  caution?: string;
}

// ─── Sample blog posts ────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "niacinamide-complete-guide",
    title: "Niacinamide: The Complete Ingredient Guide",
    excerpt: "Why niacinamide is the most versatile active in your bathroom cabinet — what it actually does, how to use it, and which concentrations work best for each skin type.",
    tag: "Ingredient Deep Dive",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    readingTime: "8 min read",
    publishedAt: "2026-04-01",
    author: "Skinevora Editorial",
    coverEmoji: "🧴",
    relatedSlugs: ["retinoid-beginners-guide", "routine-for-sensitive-skin"],
    content: [
      {
        type: "paragraph",
        text: "Niacinamide (vitamin B3) has earned its reputation as the workhorse of modern skincare. Unlike many trending actives that promise dramatic results for a narrow set of concerns, niacinamide genuinely benefits almost every skin type — and there is solid clinical research to support each claim.",
      },
      {
        type: "heading",
        text: "What is Niacinamide?",
      },
      {
        type: "paragraph",
        text: "Niacinamide is the amide form of vitamin B3 (nicotinic acid). INCI name: Niacinamide. It is water-soluble, stable across a wide pH range (3.5–7), and compatible with nearly every other skincare ingredient — making it one of the safest actives to layer.",
      },
      {
        type: "ingredient-card",
        items: [
          {
            name: "Niacinamide",
            inci: "Niacinamide",
            benefit: "Barrier repair, pore minimising, sebum regulation, brightening, anti-inflammatory",
            skinTypes: ["Oily", "Combination", "Sensitive", "Normal", "Dry"],
            caution: "High concentrations (>10%) may cause temporary flushing in very sensitive skin.",
          },
        ],
      },
      {
        type: "heading",
        text: "Clinically-Proven Benefits",
      },
      {
        type: "subheading",
        text: "1. Pore Size & Sebum Control",
      },
      {
        type: "paragraph",
        text: "A double-blind study published in the International Journal of Cosmetic Science found that 2% niacinamide applied twice daily for 8 weeks significantly reduced sebum excretion rate and pore size visibility. The mechanism: niacinamide inhibits the transfer of melanosomes and regulates the activity of sebaceous glands through PPAR-alpha pathways.",
      },
      {
        type: "subheading",
        text: "2. Skin Barrier Reinforcement",
      },
      {
        type: "paragraph",
        text: "Niacinamide upregulates the synthesis of ceramides, fatty acids, and cholesterol — the three pillars of a healthy stratum corneum (skin barrier). This makes it particularly valuable for dry and sensitive skin types where barrier compromise leads to transepidermal water loss (TEWL).",
      },
      {
        type: "subheading",
        text: "3. Hyperpigmentation & Uneven Tone",
      },
      {
        type: "paragraph",
        text: "At 4–5%, niacinamide has been shown to inhibit the transfer of melanosomes (pigment-containing vesicles) from melanocytes to keratinocytes. The result is a progressive reduction in dark spots, post-acne marks, and generalised uneven tone — typically visible after 4–8 weeks of consistent use.",
      },
      {
        type: "subheading",
        text: "4. Anti-Inflammatory Action",
      },
      {
        type: "paragraph",
        text: "Niacinamide suppresses pro-inflammatory cytokines (IL-6, IL-8) in skin cells. This translates to reduced redness, less reactive skin, and a calming effect on acne-prone and rosacea-adjacent skin types.",
      },
      {
        type: "tip-box",
        text: "Skinevora Tip: For most skin types, 5% niacinamide hits the sweet spot — enough to see real results without the risk of sensitivity. If you have very reactive skin, start at 2–4% and build up over 4–6 weeks.",
      },
      {
        type: "heading",
        text: "How Much Niacinamide Do You Need?",
      },
      {
        type: "table",
        headers: ["Concentration", "Best For", "Expected Timeframe"],
        rows: [
          ["2–4%", "Sensitive / beginner skin, general maintenance", "6–8 weeks"],
          ["5%", "Most skin types — the clinical sweet spot", "4–6 weeks"],
          ["8–10%", "Oily / acne-prone skin, significant pore concern", "4–6 weeks"],
          [">10%", "Rarely necessary — risk of flushing increases", "—"],
        ],
      },
      {
        type: "heading",
        text: "Layering Niacinamide: What Works With It",
      },
      {
        type: "paragraph",
        text: "One of niacinamide's superpowers is its compatibility. It works alongside most actives without destabilising either ingredient:",
      },
      {
        type: "ingredient-list",
        items: [
          { name: "Hyaluronic Acid", inci: "Sodium Hyaluronate", benefit: "Layer before niacinamide — both are hydrators and work synergistically", skinTypes: ["All"] },
          { name: "Retinol", inci: "Retinol", benefit: "Niacinamide helps buffer retinol irritation; apply niacinamide first then retinol", skinTypes: ["Normal", "Oily", "Combination"] },
          { name: "Vitamin C (L-AA)", inci: "Ascorbic Acid", benefit: "Older concern about nicotinic acid conversion is largely debunked at formulated pH — safe to use in separate routines", skinTypes: ["All"] },
          { name: "AHA / BHA", inci: "Glycolic Acid / Salicylic Acid", benefit: "Use niacinamide after acids to help restore barrier post-exfoliation", skinTypes: ["Oily", "Combination"] },
          { name: "Peptides", inci: "Various", benefit: "Excellent pairing — both support barrier function and collagen production", skinTypes: ["Dry", "Normal", "Mature"] },
        ],
      },
      {
        type: "warning-box",
        text: "Myth: 'Niacinamide cancels out Vitamin C.' This concern stems from a theoretical reaction that produces nicotinic acid (which causes flushing) from ascorbic acid + niacinamide. In practice, this reaction requires high heat over long durations. At room temperature, in a formulated product or when layered in a routine, the risk is negligible. You can safely use both.",
      },
      {
        type: "heading",
        text: "How to Read an Ingredient List for Niacinamide",
      },
      {
        type: "paragraph",
        text: "Niacinamide always appears as 'Niacinamide' on INCI lists — there are no alternative names to look for. Its position in the list indicates concentration: appearing in the top third suggests 5%+, mid-list suggests 2–5%, and at the bottom likely means less than 2%. Some brands list percentage on-pack — if yours doesn't, position is your best guide.",
      },
      {
        type: "heading",
        text: "Best Niacinamide Dupes on Skinevora",
      },
      {
        type: "paragraph",
        text: "Products containing 5% niacinamide range from ₹200 pharmacy options to ₹3,000+ prestige serums. Our ingredient analysis shows that many affordable serums match or exceed the niacinamide concentration of luxury counterparts. Browse the dupes below to find the best match for your budget.",
      },
      {
        type: "tip-box",
        text: "Look for: Niacinamide listed in the top 5 ingredients, Hyaluronic Acid as a co-ingredient, and a pH between 5.5–7 for optimal stability.",
      },
    ],
  },
  {
    slug: "retinoid-beginners-guide",
    title: "Retinoid 101: Choosing the Right Strength for Your Skin",
    excerpt: "Retinal, retinol, and retinoic acid are not interchangeable. Here's how to pick your entry point, build tolerance, and actually see results without the purge horror stories.",
    tag: "Actives Guide",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    readingTime: "6 min read",
    publishedAt: "2026-03-20",
    author: "Skinevora Editorial",
    coverEmoji: "🔬",
    relatedSlugs: ["niacinamide-complete-guide", "routine-for-sensitive-skin"],
    content: [
      {
        type: "paragraph",
        text: "Retinoids are vitamin A derivatives — the most evidence-backed anti-ageing and acne-treating ingredient class in skincare. But 'retinoid' is an umbrella term that covers a spectrum of potency, and choosing the wrong starting point is why most people quit before seeing results.",
      },
      {
        type: "heading",
        text: "The Retinoid Ladder",
      },
      {
        type: "table",
        headers: ["Name", "Conversion Steps to RA", "Potency", "Best For"],
        rows: [
          ["Retinyl Palmitate / Retinyl Acetate", "3 steps", "Very mild", "Sensitive beginners, maintenance"],
          ["Retinol", "2 steps", "Mild–moderate", "Most beginners, all concerns"],
          ["Retinaldehyde (Retinal)", "1 step", "Moderate–strong", "Experienced users, faster results"],
          ["Retinoic Acid (Tretinoin)", "0 steps (active form)", "Prescription-strength", "Clinical acne/ageing, under dermatologist guidance"],
        ],
      },
      {
        type: "tip-box",
        text: "Start with 0.025%–0.05% retinol if you're a beginner. Use it once or twice a week, at night only, after moisturiser (the sandwich method). Build frequency over 6–8 weeks before increasing concentration.",
      },
      {
        type: "heading",
        text: "The Sandwich Method (For Beginners)",
      },
      {
        type: "paragraph",
        text: "Apply a thin layer of plain moisturiser, wait 1–2 minutes, apply retinol, then seal with another layer of moisturiser. This reduces transepidermal water loss during retinol's initial irritation phase without significantly blunting efficacy. As your skin acclimates, you can move to applying retinol directly to dry skin.",
      },
      {
        type: "warning-box",
        text: "Do not use retinoids while pregnant or breastfeeding. Always apply SPF the next morning — retinoids increase photosensitivity.",
      },
    ],
  },
  {
    slug: "routine-for-sensitive-skin",
    title: "Building a Minimal Routine for Sensitive Skin",
    excerpt: "A low-risk approach that focuses on barrier repair first, then adds treatment actives in the right order — with ingredient recommendations at every step.",
    tag: "Skin Goals",
    tagColor: "bg-rose-100 text-rose-700 border-rose-200",
    readingTime: "5 min read",
    publishedAt: "2026-03-10",
    author: "Skinevora Editorial",
    coverEmoji: "🌸",
    relatedSlugs: ["niacinamide-complete-guide"],
    content: [
      {
        type: "paragraph",
        text: "Sensitive skin doesn't need a 10-step routine — it needs the right 4. The foundational principle is barrier first, actives second. A compromised skin barrier is both the cause and consequence of sensitive skin, so every step should either repair it or avoid disrupting it further.",
      },
      {
        type: "heading",
        text: "The 4-Step Sensitive Skin Framework",
      },
      {
        type: "subheading",
        text: "Step 1: Gentle Cleanser",
      },
      {
        type: "paragraph",
        text: "Look for: Betaine (from sugar beet), Sodium Cocoyl Isethionate, Disodium Lauryl Sulfosuccinate. Avoid: SLS (Sodium Lauryl Sulphate), SLES, strong fragrances. A good sensitive-skin cleanser should have a pH of 4.5–5.5 to match the skin's natural acid mantle.",
      },
      {
        type: "subheading",
        text: "Step 2: Barrier Serum",
      },
      {
        type: "ingredient-list",
        items: [
          { name: "Centella Asiatica", inci: "Centella Asiatica Extract", benefit: "Reduces redness, supports collagen, calms reactive skin", skinTypes: ["Sensitive", "Acne-prone"] },
          { name: "Panthenol", inci: "Panthenol (Pro-Vitamin B5)", benefit: "Humectant + emollient, accelerates barrier recovery", skinTypes: ["All", "especially Sensitive"] },
          { name: "Allantoin", inci: "Allantoin", benefit: "Soothes irritation, promotes cell regeneration", skinTypes: ["Sensitive", "Dry"] },
          { name: "Beta-Glucan", inci: "Beta-Glucan", benefit: "Calming, anti-inflammatory, mimics Hyaluronic Acid", skinTypes: ["Sensitive", "Mature"] },
        ],
      },
      {
        type: "subheading",
        text: "Step 3: Moisturiser",
      },
      {
        type: "paragraph",
        text: "Ceramide-rich formulas are the gold standard for sensitive skin. Ceramides 1, 3, and 6-II work synergistically with cholesterol and fatty acids to rebuild the stratum corneum. For daytime, choose a lightweight lotion; for night, a richer cream is beneficial.",
      },
      {
        type: "subheading",
        text: "Step 4: SPF (AM Only)",
      },
      {
        type: "paragraph",
        text: "Mineral sunscreens (Zinc Oxide, Titanium Dioxide) are the preferred choice for sensitive skin — they sit on top of the skin rather than being absorbed, and rarely cause contact reactions. Look for a formula that doubles as your moisturiser for fewer steps.",
      },
      {
        type: "tip-box",
        text: "Wait 4–6 weeks before introducing any actives (niacinamide, AHAs, retinoids). A healed barrier tolerates actives far better than a compromised one — building the foundation first means fewer flares.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
