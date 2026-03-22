import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using Skinevora, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.`,
  },
  {
    title: "Description of Service",
    content: `Skinevora is an ingredient-analysis platform that helps users discover affordable alternatives to luxury beauty and skincare products. Our recommendations are based on algorithmic ingredient matching and community ratings. We do not guarantee that any dupe will perform identically to the original product.`,
  },
  {
    title: "User Accounts",
    content: `You may use Skinevora without an account. Creating an account allows you to save favourites and submit reviews. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.`,
  },
  {
    title: "User Content",
    content: `When you submit reviews or ratings, you grant Skinevora a non-exclusive, royalty-free licence to display and use that content on the platform. You are responsible for ensuring your content is accurate, respectful, and does not violate third-party rights. We reserve the right to remove content that violates these terms.`,
  },
  {
    title: "Intellectual Property",
    content: `All content, branding, algorithms, and design elements of Skinevora are the intellectual property of Skinevora and its licensors. You may not reproduce, distribute, or create derivative works without our written permission.`,
  },
  {
    title: "Disclaimer of Warranties",
    content: `Skinevora is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or suitability of any ingredient information or dupe recommendation. Always consult a dermatologist for skin-related medical advice.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, Skinevora shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including skin reactions to recommended products.`,
  },
  {
    title: "Third-Party Links",
    content: `Skinevora may link to third-party product pages or retailers. We are not responsible for the content, availability, or pricing on third-party sites. Purchases made through third-party links are subject to those parties' terms.`,
  },
  {
    title: "Modifications",
    content: `We reserve the right to modify these Terms at any time. Continued use of Skinevora after changes constitutes acceptance. We will notify users of material changes where reasonably practicable.`,
  },
  {
    title: "Governing Law",
    content: `These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra.`,
  },
  {
    title: "Contact",
    content: `Questions about these Terms? Reach us at hello@skinevora.com.`,
  },
];

const Terms = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="Terms of Service"
      description="Skinevora's terms of service — your rights, our responsibilities, and how the platform works. Read before using Skinevora."
      canonical="/terms"
    />
    <Header />
    <main className="flex-1">
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Service</h1>
            <p className="mt-4 text-muted-foreground">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-10">
            <p className="text-muted-foreground leading-relaxed">
              Please read these Terms of Service carefully before using Skinevora. These terms govern your
              use of our ingredient-matching platform and related services.
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

export default Terms;
