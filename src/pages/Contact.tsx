import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    description: "For partnerships, press, or general enquiries.",
    value: "hello@duploskin.com",
  },
  {
    icon: Twitter,
    title: "Twitter / X",
    description: "DMs open for quick questions and feedback.",
    value: "@DuploSkin",
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Share dupe discoveries and connect with other users.",
    value: "Browse & rate dupes",
  },
];

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you within 2 business days." });
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                      <p className="mt-1 text-sm font-medium text-primary">{c.value}</p>
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
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="Your name" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="What's this about?" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full font-semibold">Send Message</Button>
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
