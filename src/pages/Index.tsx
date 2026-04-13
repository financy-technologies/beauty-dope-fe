import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryNav from "@/components/home/CategoryNav";
import FeaturedDupes from "@/components/home/FeaturedDupes";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrendingSection from "@/components/home/TrendingSection";
import StartHere from "@/components/home/StartHere";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Skinevora — Find your skin's smarter match",
  "description": "Discover affordable, ingredient-matched dupes for luxury skincare and makeup. 2,500+ verified dupe pairs on Skinevora.",
  "url": "https://skinevora.com/",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://skinevora.com/" }]
  }
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <SEO
        canonical="/"
        description="Discover affordable, ingredient-matched dupes for luxury skincare and makeup. Science-backed analysis, 2,500+ verified dupe pairs — free on Skinevora."
        jsonLd={HOME_JSON_LD}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <StartHere />
        <HowItWorks />
        <CategoryNav />
        <FeaturedProducts />
        <FeaturedDupes />
        <TrendingSection />

        {/* ── Internal Link Hub (SEO: helps Google discover & crawl all key pages) ── */}
        <section className="py-16 bg-secondary/30 border-t border-border">
          <div className="container px-4 md:px-6">
            <h2 className="font-display text-2xl font-semibold text-foreground text-center mb-2">Explore Skinevora</h2>
            <p className="text-sm text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Everything you need to decode your skincare routine — ingredient tools, dupe finders, brand guides, and more.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { href: "/browse",               label: "Browse All Dupes",        desc: "2,500+ ingredient-verified dupe pairs" },
                { href: "/browse?category=skin",  label: "Skincare Dupes",          desc: "Moisturisers, serums, toners & more" },
                { href: "/browse?category=makeup",label: "Makeup Dupes",            desc: "Foundation, blush, lip and eye" },
                { href: "/dupes",                 label: "Dupe Finder",             desc: "Find dupes with ingredient tweaking" },
                { href: "/ingredient-analyzer",   label: "Ingredient Analyzer",     desc: "Decode any INCI ingredient list" },
                { href: "/compare",               label: "Compare Products",        desc: "Side-by-side ingredient comparison" },
                { href: "/ingredients",           label: "Ingredients Database",    desc: "60+ skincare ingredients explained" },
                { href: "/brands",                label: "Browse by Brand",         desc: "Explore products brand by brand" },
                { href: "/quiz",                  label: "Skin Type Quiz",          desc: "Personalise your recommendations" },
                { href: "/skin-story",            label: "Skin Story",              desc: "Deep personalised skin analysis" },
                { href: "/blog",                  label: "Blog & Guides",           desc: "Science-backed skincare education" },
                { href: "/blog/niacinamide-complete-guide",  label: "Niacinamide Guide",  desc: "Complete ingredient deep dive" },
                { href: "/blog/retinoid-beginners-guide",    label: "Retinoid 101",        desc: "Choosing the right strength" },
                { href: "/blog/routine-for-sensitive-skin",  label: "Sensitive Skin Guide",desc: "Build a minimal routine" },
                { href: "/methodology",           label: "Our Methodology",         desc: "How we score and verify dupes" },
                { href: "/about",                 label: "About Skinevora",         desc: "Our mission and the team" },
              ].map(({ href, label, desc }) => (
                <Link
                  key={href}
                  to={href}
                  className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</span>
                  <span className="text-xs text-muted-foreground leading-snug">{desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
