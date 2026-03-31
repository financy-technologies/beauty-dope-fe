import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const Disclaimer = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Disclaimer"
      description="Important medical and product-use disclaimer for Skinevora recommendations and ingredient information."
      canonical="/disclaimer"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Disclaimer</h1>
            <p className="mt-4 text-muted-foreground">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Skinevora provides educational information about skincare ingredients and product similarity. It is not
              medical advice.
            </p>
            <p>
              Individual skin responses vary. Always patch-test new products and consult a qualified dermatologist for
              persistent concerns, allergic reactions, pregnancy-safe guidance, or treatment planning.
            </p>
            <p>
              Similarity scores indicate formulation overlap and are not guarantees of identical clinical performance.
              Brand names and trademarks belong to their respective owners.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Disclaimer;
