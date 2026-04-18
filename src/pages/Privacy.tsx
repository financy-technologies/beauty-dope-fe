import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly, such as when you create an account (email address, display name), submit reviews, or save favourites. We also collect usage data automatically — pages visited, search queries entered, and device/browser information — to improve the service.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your information to operate and improve Skinevora, personalise your experience (e.g. saved favourites), send service-related emails (account confirmation, password reset), and analyse usage patterns to improve our ingredient-matching algorithms. We do not sell your personal data to third parties.`,
  },
  {
    title: "Cookies",
    content: `We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how users interact with our platform. You can disable cookies in your browser settings, but some features may not function correctly.`,
  },
  {
    title: "Data Sharing",
    content: `We do not sell, rent, or trade your personal information. We may share data with service providers (hosting, analytics) who are contractually obligated to keep it confidential. We may also disclose data if required by law.`,
  },
  {
    title: "Data Retention",
    content: `We retain your account information for as long as your account is active. You can request deletion of your account and associated data at any time by contacting hello@skinevora.com.`,
  },
  {
    title: "Security",
    content: `We use industry-standard encryption and security practices to protect your data. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.`,
  },
  {
    title: "Children's Privacy",
    content: `Skinevora is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of Skinevora after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions about this Privacy Policy, please contact us at hello@skinevora.com.`,
  },
];

const Privacy = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Privacy Policy"
      description="Read Skinevora's privacy policy — how we collect, use, and protect your personal data on our skincare dupe platform."
      canonical="/privacy"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 text-muted-foreground">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-10">
            <p className="text-muted-foreground leading-relaxed">
              At Skinevora, your privacy is important to us. This Privacy Policy explains how we collect,
              use, and protect your information when you use our platform.
            </p>
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-display text-xl font-semibold tracking-tight mb-3">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Privacy;
