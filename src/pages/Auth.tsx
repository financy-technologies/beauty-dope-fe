import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Eye, EyeOff, Sparkles, ShieldCheck, Star } from "lucide-react";

const PERKS = [
  { icon: Star,         text: "Save your favourite dupes" },
  { icon: ShieldCheck,  text: "Ingredient-verified matches" },
  { icon: Sparkles,     text: "Personalised recommendations" },
];

const Auth = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [displayName, setDisplayName]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      navigate("/");
    } catch (err: any) {
      toast({
        title: isLogin ? "Login failed" : "Registration failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        await signInWithGoogle(tokenResponse.access_token);
        toast({
          title: "Signed in with Google",
          description: "Welcome to Skinevora!",
        });
        navigate("/");
      } catch (err: any) {
        toast({
          title: "Google sign-in failed",
          description: err.message || "Please try again",
          variant: "destructive",
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      toast({
        title: "Google sign-in failed",
        description: err.error_description || "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    },
    onNonOAuthError: (err) => {
      if (err.type === "popup_closed") return; // user closed popup — no toast needed
      toast({
        title: "Google sign-in failed",
        description: err.type === "popup_failed_to_open"
          ? "Popup was blocked by your browser. Please allow popups for this site."
          : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex bg-background">
      <SEO
        title={isLogin ? "Sign In" : "Create Account"}
        description={
          isLogin
            ? "Sign in to your Skinevora account to access your saved favourites and dupe recommendations."
            : "Create a free Skinevora account to save your favourite dupes and submit reviews."
        }
        noIndex
      />

      {/* ── Left panel (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-[#1a6175] flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <img src="/skinevora_final.png" alt="Skinevora" className="h-10 w-auto object-contain brightness-0 invert" />
          <span className="font-display text-xl font-semibold text-white tracking-tight">
            Skine<span className="text-white/60">vora</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight text-white">
              Luxury skincare.<br />
              <span className="text-white/70 italic">Half the price.</span>
            </h2>
            <p className="mt-4 text-base text-white/60 leading-relaxed max-w-xs">
              Discover ingredient-verified dupes for your favourite luxury products — curated by science, loved by thousands.
            </p>
          </div>

          {/* Perk list */}
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm text-white/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-white/40">
          Trusted by 10,000+ beauty lovers
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <img src="/skinevora_final.png" alt="Skinevora" className="h-9 w-auto object-contain" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Skine<span className="text-primary">vora</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your favourites and reviews"
                : "Join thousands finding luxury dupes for less"}
            </p>
          </div>

          {/* Google button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 border-border hover:border-primary/40 hover:bg-primary/5 font-medium"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Signing in…" : `Continue with Google`}
          </Button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Beauty Lover"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                {isLogin && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Please wait…
                </span>
              ) : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Switch mode */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={isLogin ? "/signup" : "/login"}
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </Link>
          </p>

          {/* Terms note */}
          {!isLogin && (
            <p className="mt-4 text-center text-[11px] text-muted-foreground/70 leading-relaxed">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
              <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
