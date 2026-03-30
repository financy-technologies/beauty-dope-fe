import { useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMyProfile, useUpdateProfile } from "@/hooks/api/useProfile";
import {
  useMyPoints,
  usePointsHistory,
  useAvailableRewards,
  useMyRedemptions,
  useRedeemReward,
} from "@/hooks/api/useRewards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  User,
  Sparkles,
  Gift,
  CheckCircle2,
  Clock,
  Award,
  Tag,
  Package,
  Percent,
  FileText,
  TrendingUp,
  History,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIN_TYPES = [
  { value: "dry", label: "Dry", emoji: "🌿", desc: "Tight, flaky, low sebum" },
  { value: "oily", label: "Oily", emoji: "💧", desc: "Shiny, large pores" },
  { value: "combination", label: "Combination", emoji: "⚖️", desc: "Oily T-zone, dry cheeks" },
  { value: "normal", label: "Normal", emoji: "✨", desc: "Balanced, minimal issues" },
  { value: "sensitive", label: "Sensitive", emoji: "🌸", desc: "Reactive, easily irritated" },
] as const;

const SKIN_CONCERNS = [
  "Acne / Breakouts",
  "Anti-aging / Wrinkles",
  "Hyperpigmentation",
  "Large Pores",
  "Dryness / Flakiness",
  "Excess Oil",
  "Redness / Rosacea",
  "Dullness",
  "Dark Circles",
  "Uneven Skin Tone",
];

const SKIN_SENSITIVITIES = [
  "Fragrance-free",
  "Alcohol-free",
  "Essential Oil-free",
  "Paraben-free",
  "Silicone-free",
  "Sulfate-free",
];

const AGE_RANGES = [
  { value: "under-20", label: "Under 20" },
  { value: "20s", label: "20–29" },
  { value: "30s", label: "30–39" },
  { value: "40s", label: "40–49" },
  { value: "50s+", label: "50+" },
] as const;

const TX_ICONS: Record<string, { icon: typeof Sparkles; color: string; label: string }> = {
  signup: { icon: Gift, color: "text-emerald-600", label: "Welcome bonus" },
  skin_quiz: { icon: Sparkles, color: "text-primary", label: "Skin quiz" },
  review: { icon: CheckCircle2, color: "text-blue-600", label: "Review" },
  favorite: { icon: Award, color: "text-rose-500", label: "Favorite" },
  redemption: { icon: Tag, color: "text-amber-600", label: "Redemption" },
  admin_grant: { icon: TrendingUp, color: "text-purple-600", label: "Bonus" },
};

const REWARD_ICONS: Record<string, typeof Sparkles> = {
  Package,
  Tag,
  Percent,
  Sparkles,
  Award,
  FileText,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextMilestone(points: number) {
  const milestones = [100, 200, 300, 500, 750, 1000, 1500, 2000];
  return milestones.find((m) => m > points) ?? points + 500;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    bio: "",
  });
  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    setForm({
      displayName: profile?.displayName ?? "",
      username: profile?.username ?? "",
      bio: profile?.bio ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form);
      toast({ title: "Profile updated" });
      setEditing(false);
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {(profile?.displayName ?? user?.email ?? "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl font-semibold text-foreground truncate">
                {profile?.displayName ?? user?.email}
              </p>
              {profile?.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Display Name
              </label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Username
              </label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Bio
              </label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about your skincare journey…"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={updateProfile.isPending} size="sm">
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        profile?.bio && (
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="font-display text-3xl font-bold text-primary">{profile?.points ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Available Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="font-display text-3xl font-bold text-foreground">
              {profile?.pointsEarnedTotal ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Points Earned</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SkinTab() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [skinType, setSkinType] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [sensitivities, setSensitivities] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const startEdit = () => {
    setSkinType(profile?.skinType ?? null);
    setConcerns(profile?.skinConcerns ?? []);
    setSensitivities(profile?.skinSensitivities ?? []);
    setAgeRange(profile?.ageRange ?? null);
    setEditing(true);
  };

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSave = async () => {
    if (!skinType) {
      toast({ title: "Please select your skin type", variant: "destructive" });
      return;
    }
    try {
      await updateProfile.mutateAsync({
        skinType: skinType as any,
        skinConcerns: concerns,
        skinSensitivities: sensitivities,
        ageRange: ageRange as any,
      });
      toast({ title: "Skin profile updated" });
      setEditing(false);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeSkinType = SKIN_TYPES.find((s) => s.value === profile?.skinType);

  if (!editing) {
    return (
      <div className="space-y-5">
        {/* Banner if not set */}
        {!profile?.skinType && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Set up your skin profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell us about your skin to get personalised product recommendations and earn{" "}
                <span className="font-semibold text-primary">+25 points</span>.
              </p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={startEdit}>
                <Sparkles className="h-3.5 w-3.5" />
                Set up skin profile
              </Button>
            </div>
          </div>
        )}

        {/* Skin type card */}
        {activeSkinType && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Skin Type</CardTitle>
                <Button variant="ghost" size="sm" onClick={startEdit} className="h-8 text-xs">
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeSkinType.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground">{activeSkinType.label}</p>
                  <p className="text-xs text-muted-foreground">{activeSkinType.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concerns */}
        {(profile?.skinConcerns?.length ?? 0) > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Skin Concerns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.skinConcerns?.map((c) => (
                  <Badge key={c} variant="secondary" className="rounded-full text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sensitivities */}
        {(profile?.skinSensitivities?.length ?? 0) > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ingredient Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.skinSensitivities?.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full text-xs border-primary/30 text-primary">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Age range */}
        {profile?.ageRange && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Age range</span>
                <span className="text-sm font-medium">
                  {AGE_RANGES.find((a) => a.value === profile.ageRange)?.label ?? profile.ageRange}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.skinType && (
          <Button variant="outline" size="sm" onClick={startEdit} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            Update Skin Profile
          </Button>
        )}
      </div>
    );
  }

  // ── Editing form ──
  return (
    <div className="space-y-6">
      {/* Skin type selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What's your skin type?</CardTitle>
          <CardDescription>Select the one that best describes your skin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {SKIN_TYPES.map((st) => (
              <button
                key={st.value}
                onClick={() => setSkinType(st.value)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  skinType === st.value
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span className="text-xl flex-shrink-0">{st.emoji}</span>
                <div>
                  <p className="font-medium">{st.label}</p>
                  <p className="text-xs text-muted-foreground">{st.desc}</p>
                </div>
                {skinType === st.value && (
                  <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Age Range</CardTitle>
          <CardDescription>Helps us give age-appropriate recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAgeRange(ageRange === ar.value ? null : ar.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  ageRange === ar.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skin concerns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skin Concerns</CardTitle>
          <CardDescription>Select all that apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKIN_CONCERNS.map((concern) => (
              <button
                key={concern}
                onClick={() => toggleItem(concerns, concern, setConcerns)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  concerns.includes(concern)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                }`}
              >
                {concerns.includes(concern) && "✓ "}
                {concern}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensitivities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ingredient Preferences</CardTitle>
          <CardDescription>Choose ingredients you'd prefer to avoid.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKIN_SENSITIVITIES.map((s) => (
              <button
                key={s}
                onClick={() => toggleItem(sensitivities, s, setSensitivities)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  sensitivities.includes(s)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                }`}
              >
                {sensitivities.includes(s) && "✓ "}
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateProfile.isPending} className="flex-1">
          {updateProfile.isPending ? "Saving…" : "Save skin profile"}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function RewardsTab() {
  const { data: balance } = useMyPoints();
  const { data: historyData } = usePointsHistory();
  const { data: availableRewards, isLoading: rewardsLoading } = useAvailableRewards();
  const { data: myRedemptions } = useMyRedemptions();
  const redeemReward = useRedeemReward();
  const { toast } = useToast();

  const points = balance?.points ?? 0;
  const nextMilestone = getNextMilestone(points);
  const progressPct = Math.min((points / nextMilestone) * 100, 100);

  const handleRedeem = async (rewardId: string, rewardName: string, needed: number) => {
    if (points < needed) {
      toast({
        title: `Not enough points`,
        description: `You need ${needed - points} more points.`,
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await redeemReward.mutateAsync(rewardId);
      toast({
        title: `${rewardName} redeemed!`,
        description: result.redemptionCode
          ? `Your code: ${result.redemptionCode}`
          : "Check your redemptions below.",
      });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to redeem", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Points balance hero */}
      <Card className="bg-gradient-to-br from-primary/8 to-primary/4 border-primary/20">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                Available Points
              </p>
              <p className="font-display text-5xl font-bold text-foreground">
                {points.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {balance?.pointsEarnedTotal?.toLocaleString() ?? 0} earned all time
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next milestone</p>
              <p className="text-lg font-bold text-primary">{nextMilestone}</p>
            </div>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {nextMilestone - points} points to next milestone
          </p>
        </CardContent>
      </Card>

      {/* How to earn */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            How to earn points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {[
              { icon: Gift, label: "Sign up", pts: "+50", color: "text-emerald-600" },
              { icon: Sparkles, label: "Complete skin quiz", pts: "+25", color: "text-primary" },
              { icon: CheckCircle2, label: "Write a review", pts: "+50", color: "text-blue-600" },
              { icon: Award, label: "Add to favorites", pts: "+10", color: "text-rose-500" },
            ].map(({ icon: Icon, label, pts, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-secondary`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{pts}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards shop */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Rewards Shop
        </h3>
        {rewardsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {availableRewards?.map((reward) => {
              const IconComp = REWARD_ICONS[reward.icon ?? "Sparkles"] ?? Sparkles;
              const canAfford = points >= reward.pointsRequired;
              const alreadyRedeemed = myRedemptions?.some(
                (r) => r.reward.id === reward.id && r.status === "active",
              );
              return (
                <motion.div
                  key={reward.id}
                  whileHover={{ y: -2 }}
                  className={`rounded-2xl border p-4 transition-colors ${
                    canAfford ? "border-primary/30 bg-card" : "border-border bg-card/50 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <IconComp className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {reward.name}
                        </p>
                        {reward.badgeLabel && (
                          <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-accent/15 text-accent border-0">
                            {reward.badgeLabel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${
                        canAfford ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {reward.pointsRequired.toLocaleString()} pts
                    </span>
                    {alreadyRedeemed ? (
                      <Badge variant="outline" className="text-xs rounded-full border-emerald-300 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Redeemed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={canAfford ? "default" : "outline"}
                        disabled={!canAfford || redeemReward.isPending}
                        onClick={() =>
                          handleRedeem(reward.id, reward.name, reward.pointsRequired)
                        }
                        className="h-8 text-xs gap-1"
                      >
                        {canAfford ? (
                          <>
                            Redeem <ChevronRight className="h-3 w-3" />
                          </>
                        ) : (
                          `Need ${reward.pointsRequired - points} more`
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* My redemptions */}
      {(myRedemptions?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            My Redemptions
          </h3>
          <div className="space-y-2">
            {myRedemptions?.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{r.reward.name}</p>
                  {r.redemptionCode && (
                    <p className="text-xs text-primary font-mono mt-0.5">{r.redemptionCode}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {r.expiresAt && ` · expires ${new Date(r.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs rounded-full ${
                    r.status === "active"
                      ? "border-emerald-300 text-emerald-600"
                      : r.status === "used"
                      ? "border-muted text-muted-foreground"
                      : "border-red-200 text-red-500"
                  }`}
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points history */}
      {(historyData?.transactions?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <History className="h-3.5 w-3.5" />
            Points History
          </h3>
          <div className="space-y-2">
            {historyData?.transactions?.map((tx) => {
              const meta = TX_ICONS[tx.type] ?? TX_ICONS.admin_grant;
              const TxIcon = meta.icon;
              const isPositive = tx.points > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary flex-shrink-0">
                      <TxIcon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{tx.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isPositive ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {tx.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="My Profile — Skinevora"
        description="Manage your skin profile, track your points and redeem rewards."
        canonical="/profile"
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  My Profile
                </span>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Your <span className="text-gradient-teal italic">Skinevora</span> profile
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Manage your skin profile, earn points for every action, and redeem rewards.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <Tabs defaultValue="profile">
                <TabsList className="w-full grid grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="skin" className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Skin
                  </TabsTrigger>
                  <TabsTrigger value="rewards" className="gap-1.5">
                    <Gift className="h-3.5 w-3.5" />
                    Rewards
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <ProfileTab />
                </TabsContent>
                <TabsContent value="skin">
                  <SkinTab />
                </TabsContent>
                <TabsContent value="rewards">
                  <RewardsTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
