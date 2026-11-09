import { useEffect, useState } from "react";
import { api } from "@/integrations/api/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  HEARD_ABOUT_OPTIONS,
  clearHeardAboutPending,
  isHeardAboutPending,
  type HeardAboutChannel,
} from "@/lib/heardAbout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Waits for the sign-in modal / post-signup redirect to settle before opening. */
const OPEN_DELAY_MS = 700;

/**
 * Asks brand-new accounts "How did you hear about us?" once. Closing the
 * dialog counts as a skip, so nobody is asked twice.
 */
const HeardAboutPrompt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<HeardAboutChannel | null>(null);
  const [detail, setDetail] = useState("");
  const [saving, setSaving] = useState(false);

  const userId = user?.id;
  useEffect(() => {
    if (!userId || !isHeardAboutPending(userId)) {
      setOpen(false);
      return;
    }
    const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [userId]);

  const selected = HEARD_ABOUT_OPTIONS.find((o) => o.value === channel);

  const skip = () => {
    clearHeardAboutPending();
    setOpen(false);
    api.post("/heard-about", {}).catch(() => {}); // only feeds the response rate
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    setSaving(true);
    try {
      await api.post("/heard-about", { channel, detail: detail.trim() || undefined });
      clearHeardAboutPending();
      setOpen(false);
      toast({ title: "Thank you!", description: "That really helps us." });
    } catch {
      toast({ title: "Couldn't save your answer", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && skip()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Welcome! One quick question</DialogTitle>
            <DialogDescription>How did you hear about Skinevora?</DialogDescription>
          </DialogHeader>

          <ToggleGroup
            type="single"
            value={channel ?? ""}
            onValueChange={(v) => {
              setChannel((v || null) as HeardAboutChannel | null);
              setDetail("");
            }}
            className="grid grid-cols-2 gap-2"
            aria-label="How did you hear about Skinevora?"
          >
            {HEARD_ABOUT_OPTIONS.map((o) => (
              <ToggleGroupItem
                key={o.value}
                value={o.value}
                className="h-auto justify-start rounded-xl border border-border px-3 py-2.5 text-left text-sm font-normal hover:bg-muted data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:font-medium"
              >
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {selected && (
            <div className="space-y-1.5">
              <Label htmlFor="heard-about-detail" className="text-sm">
                {selected.detailPrompt} <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="heard-about-detail"
                value={detail}
                maxLength={255}
                onChange={(e) => setDetail(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <DialogFooter className="flex-row justify-end gap-2 sm:space-x-0">
            <Button type="button" variant="ghost" onClick={skip}>
              Skip
            </Button>
            <Button type="submit" disabled={!channel || saving}>
              {saving ? "Saving…" : "Done"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HeardAboutPrompt;
