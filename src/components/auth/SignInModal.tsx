import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, ShieldCheck, Star, Lock } from "lucide-react";

// ─── Context ───────────────────────────────────────────────────────────────────
interface SignInModalContextType {
  openSignIn: (reason?: string) => void;
  closeSignIn: () => void;
}

const SignInModalContext = createContext<SignInModalContextType | undefined>(undefined);

export function useSignInModal() {
  const ctx = useContext(SignInModalContext);
  if (!ctx) throw new Error("useSignInModal must be used within SignInModalProvider");
  return ctx;
}

// ─── Perks ────────────────────────────────────────────────────────────────────
const PERKS = [
  { icon: Star,        text: "Save & track your favourite dupes" },
  { icon: ShieldCheck, text: "Ingredient-verified comparisons" },
  { icon: Sparkles,    text: "Personalised skin recommendations" },
];

// ─── Modal inner content ──────────────────────────────────────────────────────
function ModalContent({ reason, onClose }: { reason: string; onClose: () => void }) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await signInWithGoogle(tokenResponse.access_token);
        toast({ title: "Signed in!", description: "Welcome to Skinevora." });
        onClose();
      } catch (err: any) {
        toast({
          title: "Sign-in failed",
          description: err.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      toast({
        title: "Google sign-in failed",
        description: err.error_description || "Could not connect to Google.",
        variant: "destructive",
      });
    },
    onNonOAuthError: (err) => {
      if (err.type === "popup_closed") return;
      toast({
        title: "Google sign-in failed",
        description: err.type === "popup_failed_to_open"
          ? "Popup blocked. Please allow popups for this site."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col items-center text-center px-2 py-2">
      <img src="/skinevora_final.png" alt="Skinevora" className="h-12 w-auto object-contain mb-5" />

      <h2 className="text-xl font-semibold text-foreground leading-snug">{reason}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        Join thousands of beauty lovers finding luxury dupes for less.
      </p>

      <ul className="mt-5 mb-6 w-full space-y-2.5 text-left">
        {PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </span>
            <span className="text-sm text-foreground/80">{text}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 border-border hover:border-primary/40 hover:bg-primary/5 font-medium"
        onClick={() => handleGoogleLogin()}
        disabled={loading}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {loading ? "Signing in…" : "Continue with Google"}
      </Button>

      <div className="mt-3 flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="mt-3 w-full h-10 text-sm font-medium text-muted-foreground hover:text-foreground"
        onClick={() => { onClose(); navigate("/login"); }}
      >
        Sign in with email
      </Button>

      <p className="mt-4 text-[11px] text-muted-foreground/60 leading-relaxed">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline hover:text-foreground">Terms</a> &amp;{" "}
        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
      </p>
    </div>
  );
}

// ─── Guest wall — shown when unauthenticated user dismisses the modal ─────────
export function GuestWall({ reason }: { reason?: string }) {
  const { openSignIn } = useSignInModal();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-xs">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
          <Lock className="h-6 w-6 text-primary" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">
          {reason ?? "Sign in required"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a free account to unlock this page.
        </p>
        <Button className="w-full" onClick={() => openSignIn(reason)}>
          Sign In
        </Button>
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
function OneTapHandler() {
  const { signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        await signInWithGoogle(credentialResponse.credential!);
        toast({ title: "Signed in!", description: "Welcome to Skinevora." });
        // Navigate to home — the current page may be /login or a guest-walled page
        navigate("/", { replace: true });
      } catch {
        // Silent — one tap failures shouldn't interrupt browsing
      }
    },
    onError: () => {},
    disabled: !!user, // don't show One Tap if already signed in
  });

  return null;
}

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen]     = useState(false);
  const [reason, setReason] = useState("Sign in to continue");

  const openSignIn = useCallback((r = "Sign in to continue") => {
    setReason(r);
    setOpen(true);
  }, []);

  const closeSignIn = useCallback(() => setOpen(false), []);

  return (
    <SignInModalContext.Provider value={{ openSignIn, closeSignIn }}>
      {children}
      <OneTapHandler />

      <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
        <DialogContent className="sm:max-w-sm p-6 rounded-2xl">
          {open && <ModalContent reason={reason} onClose={closeSignIn} />}
        </DialogContent>
      </Dialog>
    </SignInModalContext.Provider>
  );
}
