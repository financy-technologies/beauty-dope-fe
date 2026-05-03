import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import CategoryNav from "@/components/home/CategoryNav";
import FeaturedDupes from "@/components/home/FeaturedDupes";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrendingSection from "@/components/home/TrendingSection";
import StartHere from "@/components/home/StartHere";
import Testimonials from "@/components/home/Testimonials";
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
        <Testimonials />
        <TrendingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
