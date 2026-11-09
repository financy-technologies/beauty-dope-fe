import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Mail } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import LatestIssues from "@/components/newsletter/LatestIssues";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsletter } from "@/hooks/api/useNewsletter";

const PERKS = [
  "New ingredient-matched dupes",
  "Ingredient deep dives and routine tips",
  "No sponsored picks. Science first.",
];

const Newsletter = () => {
  const { data, isLoading, isError, refetch } = useNewsletter();
  const enabled = data?.enabled === true;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Newsletter"
        description="Weekly skincare updates from Skinevora: new ingredient-matched dupes, ingredient deep dives and routine tips, in your inbox."
        canonical="/newsletter"
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-14 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Mail className="h-3.5 w-3.5" /> Weekly newsletter
                </span>
                <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  {enabled && data.title ? data.title : "The Skinevora newsletter"}
                </h1>
                <p className="mt-4 text-muted-foreground">
                  One email a week with what's new on Skinevora, so you never pay luxury prices for a formula you can
                  get for less.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {PERKS.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isLoading && <Skeleton className="h-[320px] w-full rounded-xl" />}
                {enabled && <NewsletterSignup variant="card" />}
                {isError && (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="font-semibold">Couldn't load the signup form.</p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-2 text-sm font-medium text-primary hover:underline underline-offset-2"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {data && !enabled && (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="font-semibold">Our newsletter is launching soon.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      In the meantime, catch up on <Link to="/blog" className="text-primary underline-offset-2 hover:underline">the blog</Link>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {(isLoading || (enabled && data.posts.length > 0)) && (
          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="font-display text-2xl font-semibold">Latest issues</h2>
                  {enabled && (
                    <a
                      href={`${data.publicationUrl}/archive`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2"
                    >
                      All issues <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <LatestIssues limit={12} showLoading />
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Newsletter;
