import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(`404: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-hero">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-lg text-center">

            <p className="font-display text-[8rem] font-semibold leading-none tracking-tight text-primary/15 md:text-[12rem]">
              404
            </p>

            <div className="-mt-4">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Page not found
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
                The page you're looking for doesn't exist, or may have moved.
                Try searching for a dupe instead.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-soft transition-all hover:border-primary/30 hover:shadow-card"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-all hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                Browse Dupes
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
