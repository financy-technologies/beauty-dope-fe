import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { useNewsletter } from "@/hooks/api/useNewsletter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  limit?: number;
  className?: string;
  /** Show placeholders while loading (on the newsletter page, not on the blog). */
  showLoading?: boolean;
}

/** Latest Substack issues (from the RSS feed). Renders nothing if there are none. */
const LatestIssues = ({ limit = 3, className, showLoading = false }: Props) => {
  const { data, isLoading } = useNewsletter();

  if (isLoading && showLoading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: Math.min(limit, 3) }, (_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!data?.enabled || data.posts.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {data.posts.slice(0, limit).map((post) => (
        <a
          key={post.url}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
        >
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="aspect-[16/9] w-full object-cover bg-muted"
            />
          )}
          <div className="flex flex-1 flex-col gap-2 p-4">
            {post.publishedAt && (
              <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
                {format(new Date(post.publishedAt), "d MMM yyyy")}
              </time>
            )}
            <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>}
            <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-primary">
              Read on Substack <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default LatestIssues;
