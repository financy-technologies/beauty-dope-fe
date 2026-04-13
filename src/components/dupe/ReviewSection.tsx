import { useState } from "react";
import { Star } from "lucide-react";
import { useReviews, useUserReview, useCreateReview, useDeleteReview } from "@/hooks/api/useReviews";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSignInModal } from "@/components/auth/SignInModal";
import { cn } from "@/lib/utils";

interface Props {
  dupeId: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

const ReviewSection = ({ dupeId }: Props) => {
  const { user } = useAuth();
  const { openSignIn } = useSignInModal();
  const { toast } = useToast();
  const { data: reviews, isLoading } = useReviews(dupeId);
  const { data: myReview } = useUserReview(dupeId);
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a star rating", variant: "destructive" });
      return;
    }
    try {
      await createReview.mutateAsync({ dupeId, rating, comment });
      setRating(0);
      setComment("");
      toast({ title: "Review submitted!" });
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview.mutateAsync(dupeId);
      toast({ title: "Review deleted" });
    } catch {
      toast({ title: "Failed to delete review", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-semibold">Community Reviews</h2>

      {/* Write a review */}
      {user ? (
        myReview ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-medium mb-1">Your review</p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("h-4 w-4", s <= myReview.rating ? "fill-primary text-primary" : "text-muted-foreground")} />
              ))}
            </div>
            {myReview.comment && <p className="text-sm text-muted-foreground">{myReview.comment}</p>}
            <Button variant="destructive" size="sm" className="mt-3" onClick={handleDelete} disabled={deleteReview.isPending}>
              Delete my review
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm font-medium">Write a review</p>
            <StarRating value={rating} onChange={setRating} />
            <Textarea
              placeholder="Share your experience with this dupe… (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={createReview.isPending || rating === 0}>
              {createReview.isPending ? "Submitting…" : "Submit Review"}
            </Button>
          </form>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-3">Sign in to leave a review</p>
          <Button variant="outline" onClick={() => openSignIn("Sign in to leave a review")}>
            Sign In
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : reviews?.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">
                    {review.user.profile?.displayName || review.user.displayName || "Anonymous"}
                  </p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-3.5 w-3.5", s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground")} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
