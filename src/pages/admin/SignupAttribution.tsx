import { useMemo, useState } from "react";
import { Copy, Link2, Plus, ShieldAlert } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { GuestWall } from "@/components/auth/SignInModal";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { buildLinkTarget } from "@/lib/attribution";
import { heardAboutLabel } from "@/lib/heardAbout";
import {
  useAttributionReport,
  useHeardAboutReport,
  useCreateTrackingLink,
  useSetTrackingLinkActive,
  useTrackingLinks,
  type AttributionModel,
  type CreateTrackingLinkInput,
  type TrackingLink,
} from "@/hooks/api/useAttribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const EMPTY_FORM: CreateTrackingLinkInput = {
  label: "",
  slug: "",
  destinationPath: "/",
  utmSource: "",
  utmMedium: "social",
  utmCampaign: "",
  utmContent: "",
};

const Clamp = ({ text }: { text: string }) => (
  <span className="block max-w-[12rem] truncate" title={text}>{text}</span>
);

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");

function shortUrl(link: TrackingLink) {
  return `${window.location.origin}/go/${link.slug}`;
}

function utmUrl(link: TrackingLink) {
  return buildLinkTarget(
    {
      slug: link.slug,
      destinationPath: link.destinationPath,
      utm: { source: link.utmSource, medium: link.utmMedium, campaign: link.utmCampaign, content: link.utmContent },
    },
    { origin: window.location.origin },
  ).toString();
}

const SignupAttribution = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isAdmin = !!user?.isAdmin;

  const [model, setModel] = useState<AttributionModel>("first");
  const [range, setRange] = useState("30");
  const days = range === "all" ? null : Number(range);

  const links = useTrackingLinks(isAdmin);
  const report = useAttributionReport(model, days, isAdmin);
  const heardAbout = useHeardAboutReport(days, isAdmin);
  const createLink = useCreateTrackingLink();
  const setActive = useSetTrackingLinkActive();

  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const sortedLinks = useMemo(
    () => [...(links.data ?? [])].sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [links.data],
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: text });
    } catch {
      toast({ title: "Couldn't copy", description: text, variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const link = await createLink.mutateAsync(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast({ title: "Link created", description: shortUrl(link) });
    } catch (err) {
      toast({ title: "Couldn't create link", description: (err as Error).message, variant: "destructive" });
    }
  };

  const field = (key: keyof CreateTrackingLinkInput) => ({
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-10 md:px-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Signup attribution" noIndex />
        <Header />
        <main className="flex-1">
          {!user ? (
            <GuestWall reason="Sign in to continue" />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">This page is only available to admins.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const r = report.data;
  const h = heardAbout.data;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Signup attribution" noIndex />
      <Header />
      <main className="flex-1 container px-4 py-10 md:px-6 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Signup attribution</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Which channel brings which signup. First touch is how they discovered us; last touch is what they
              clicked most recently before signing up.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={model}
              onValueChange={(v) => v && setModel(v as AttributionModel)}
              className="rounded-lg border border-border p-0.5"
            >
              <ToggleGroupItem value="first" className="h-8 px-3 text-xs">First touch</ToggleGroupItem>
              <ToggleGroupItem value="last" className="h-8 px-3 text-xs">Last touch</ToggleGroupItem>
            </ToggleGroup>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Signups", value: r?.totalSignups },
            { label: "Attributed", value: r?.attributedSignups, hint: r && pct(r.attributedSignups, r.totalSignups) },
            {
              label: "Unknown source",
              value: r?.unattributedSignups,
              hint: "Older accounts, or visitors who declined cookies",
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                {report.isLoading ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{s.value ?? 0}</p>
                )}
                {s.hint && <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {report.isError && (
          <p className="text-sm text-destructive">Couldn't load the report: {(report.error as Error).message}</p>
        )}

        {/* Self-reported */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How did you hear about us?</CardTitle>
              <CardDescription>
                Asked once after signup.{" "}
                {h && (
                  <>
                    {h.answered} answered, {h.skipped} skipped
                    {h.responseRate !== null && <> ({Math.round(h.responseRate * 100)}% response rate)</>}.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {heardAbout.isLoading && <Skeleton className="h-24 w-full" />}
              {heardAbout.isError && (
                <p className="text-sm text-destructive">{(heardAbout.error as Error).message}</p>
              )}
              {h?.byChannel.map((c) => (
                <div key={c.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{heardAboutLabel(c.channel)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.responses} · {pct(c.responses, h.answered)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: pct(c.responses, h.answered) }} />
                  </div>
                </div>
              ))}
              {h && h.byChannel.length === 0 && (
                <p className="text-sm text-muted-foreground">No answers in this period yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Latest answers</CardTitle>
              <CardDescription>
                Next to what link tracking recorded. A mismatch (e.g. said Reddit, tracked as direct) usually means a
                shared or copied link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Said</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Tracked as</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {h?.recent.map((a) => (
                    <TableRow key={`${a.email}-${a.createdAt}`}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{heardAboutLabel(a.channel)}</TableCell>
                      <TableCell className="text-muted-foreground"><Clamp text={a.detail ?? "—"} /></TableCell>
                      <TableCell className="text-muted-foreground">
                        <Clamp text={a.trackedSource ? `${a.trackedSource} / ${a.trackedMedium}` : "—"} />
                      </TableCell>
                      <TableCell className="text-muted-foreground"><Clamp text={a.email} /></TableCell>
                    </TableRow>
                  ))}
                  {h && h.recent.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        Answers will show up here as people sign up.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">By channel (link tracking)</CardTitle>
              <CardDescription>Source / medium / campaign of each signup's {model} touch.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="w-[30%]">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {r?.byChannel.map((c) => (
                    <TableRow key={`${c.source}|${c.medium}|${c.campaign}`}>
                      {/* UTM values come from the URL — clamp them so one long value can't hide the other columns. */}
                      <TableCell className="font-medium"><Clamp text={c.source} /></TableCell>
                      <TableCell className="text-muted-foreground"><Clamp text={c.medium} /></TableCell>
                      <TableCell className="text-muted-foreground"><Clamp text={c.campaign ?? "—"} /></TableCell>
                      <TableCell className="text-right tabular-nums">{c.signups}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: pct(c.signups, r.attributedSignups) }}
                            />
                          </div>
                          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                            {pct(c.signups, r.attributedSignups)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {r && r.byChannel.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No attributed signups in this period yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top landing pages</CardTitle>
              <CardDescription>First page seen on the {model} touch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {r?.byLandingPath.map((l) => (
                <div key={l.landingPath} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-mono text-xs" title={l.landingPath}>{l.landingPath}</span>
                  <span className="tabular-nums text-muted-foreground">{l.signups}</span>
                </div>
              ))}
              {r && r.byLandingPath.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Links */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base">Tracked links</CardTitle>
              <CardDescription>
                All-time totals. Paste the short link in a bio, signature or CTA; add
                <code className="mx-1 rounded bg-muted px-1">?utm_campaign=…</code>
                or <code className="mx-1 rounded bg-muted px-1">?utm_content=…</code> to it to tag a single post.
              </CardDescription>
            </div>
            <Button size="sm" variant={showForm ? "outline" : "default"} onClick={() => setShowForm((v) => !v)}>
              <Plus className="mr-1 h-4 w-4" />
              {showForm ? "Cancel" : "New link"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {showForm && (
              <form onSubmit={submit} className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tl-label">Label</Label>
                  <Input id="tl-label" required placeholder="Pinterest profile" {...field("label")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-slug">Slug <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="tl-slug" placeholder="random if empty" pattern="[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?" {...field("slug")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-dest">Destination</Label>
                  <Input id="tl-dest" placeholder="/" {...field("destinationPath")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-source">utm_source</Label>
                  <Input id="tl-source" required placeholder="pinterest" {...field("utmSource")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-medium">utm_medium</Label>
                  <Input id="tl-medium" required list="tl-mediums" placeholder="social" {...field("utmMedium")} />
                  <datalist id="tl-mediums">
                    {["social", "cta", "email", "referral", "partner", "paid"].map((m) => <option key={m} value={m} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-campaign">utm_campaign <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="tl-campaign" placeholder="profile" {...field("utmCampaign")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tl-content">utm_content <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="tl-content" {...field("utmContent")} />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <Button type="submit" size="sm" disabled={createLink.isPending}>
                    {createLink.isPending ? "Creating…" : "Create link"}
                  </Button>
                </div>
              </form>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>UTM</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Signups ({model})</TableHead>
                  <TableHead className="text-right">Click → signup</TableHead>
                  <TableHead>Copy</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell>
                  </TableRow>
                )}
                {sortedLinks.map((l) => {
                  const signups = l.signups[model];
                  return (
                    <TableRow key={l.id} className={l.isActive ? "" : "opacity-50"}>
                      <TableCell>
                        <div className="font-medium">{l.label}</div>
                        <div className="mt-0.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Link2 className="h-3 w-3" />/go/{l.slug}
                          <span className="mx-1">→</span>{l.destinationPath}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="font-normal">{l.utmSource}</Badge>
                          <Badge variant="outline" className="font-normal">{l.utmMedium}</Badge>
                          {l.utmCampaign && <Badge variant="outline" className="font-normal">{l.utmCampaign}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{l.clickCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{signups}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{pct(signups, l.clickCount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => copy(shortUrl(l))}>
                            <Copy className="mr-1 h-3 w-3" />Short
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            title="Full UTM URL — works anywhere, but clicks aren't counted"
                            onClick={() => copy(utmUrl(l))}
                          >
                            UTM
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={l.isActive}
                          disabled={setActive.isPending}
                          onCheckedChange={(isActive) => setActive.mutate({ id: l.id, isActive })}
                          aria-label={`${l.isActive ? "Deactivate" : "Activate"} ${l.label}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {links.data && links.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No links yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SignupAttribution;
