import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageSquare, Twitter, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { SUPPORT_EMAIL, contactMailto } from "@/config/contact";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    description: "For partnerships, press, or general enquiries.",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: Twitter,
    title: "X (Twitter)",
    description: "DMs open for quick questions and feedback.",
    value: "@skinevora",
    href: "https://x.com/skinevora",
  },
  {
    icon: Linkedin,
    title: "LinkedIn",
    description: "Follow us for brand news, partnerships and updates.",
    value: "Skinevora",
    href: "https://www.linkedin.com/company/skinevora/",
  },
  {
    icon: MessageSquare,
    title: "Instagram",
    description: "Tag us in your dupe finds and skincare wins.",
    value: "@skinevora",
    href: "https://www.instagram.com/skinevora/",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  // There's no mail-sending backend, so hand the message to the visitor's own
  // email app, addressed to support — nothing is silently dropped.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = contactMailto(form);
    toast({
      title: "Opening your email app…",
      description: `Your message is ready to send. If nothing opens, email us at ${SUPPORT_EMAIL}.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Contact Us"
        description="Get in touch with the Skinevora team. Report a bug, suggest a dupe, or ask about partnerships — we'd love to hear from you."
        canonical="/contact"
      />
      <Header />
      <main className="flex-1">

        <section className="bg-gradient-hero py-20 md:py-24">
          <div className="container px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Get in touch</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                We'd love to hear from you
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Whether you've found a great dupe, spotted a bug, or want to partner with us — reach out.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2">

              {/* Contact channels */}
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Other ways to reach us</h2>
                {CHANNELS.map((c) => (
                  <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("mailto") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className="mt-1 text-sm font-medium text-primary hover:underline"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-medium text-primary">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft">
                <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Send a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                      <Input id="contact-name" placeholder="Your name" required {...field("name")} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                      <Input id="contact-email" type="email" placeholder="you@example.com" required {...field("email")} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="text-sm font-medium">Subject</label>
                    <Input id="contact-subject" placeholder="What's this about?" required {...field("subject")} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
                    <textarea
                      id="contact-message"
                      required
                      {...field("message")}
                      rows={5}
                      placeholder="Tell us more..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full font-semibold">Send via email</Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Opens your email app with this message addressed to {SUPPORT_EMAIL}.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;
