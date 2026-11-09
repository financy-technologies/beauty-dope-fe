import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasDeclinedTracking } from "@/lib/consent";
import { useNewsletter } from "@/hooks/api/useNewsletter";

interface Props {
  heading?: string;
  description?: string;
  /** "section": full-width band (blog). "card": just the form, for page layouts. */
  variant?: "section" | "card";
  className?: string;
}

/**
 * Substack's official signup embed — the email goes straight to Substack,
 * which sends the confirmation and handles unsubscribes. Visitors who
 * declined cookies get a plain link instead of the third-party iframe.
 * Renders nothing until SUBSTACK_URL is configured on the API.
 */
const NewsletterSignup = ({
  heading = "Stay ingredient-literate",
  description = "New guides and dupes every week. No sponsored content. Science first.",
  variant = "section",
  className,
}: Props) => {
  const { data } = useNewsletter();
  if (!data?.enabled) return null;

  const form = hasDeclinedTracking() ? (
    <Button asChild className="rounded-full px-6 font-semibold">
      <a href={data.subscribeUrl} target="_blank" rel="noopener noreferrer">
        Subscribe on Substack <ExternalLink className="ml-1.5 h-4 w-4" />
      </a>
    </Button>
  ) : (
    <div className="space-y-2">
      <iframe
        src={data.embedUrl}
        title="Subscribe to the Skinevora newsletter"
        className="h-[320px] w-full rounded-xl border border-border bg-white"
        loading="lazy"
        frameBorder={0}
        scrolling="no"
      />
      {/* For browsers/extensions that block third-party frames. */}
      <a
        href={data.subscribeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Form not loading? Subscribe on Substack <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );

  if (variant === "card") return <div className={className}>{form}</div>;

  return (
    <section className={cn("py-12 bg-gradient-to-br from-secondary to-primary/5", className)}>
      <div className="container px-4 md:px-6 text-center">
        <div className="mx-auto max-w-md">
          <Mail className="mx-auto h-8 w-8 text-primary mb-3" />
          <h2 className="font-display text-2xl font-semibold mb-2">{heading}</h2>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          {form}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
