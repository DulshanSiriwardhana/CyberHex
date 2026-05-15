import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Container, SectionHeading, Grid, Flex, Stack } from "@/components/ui/layout";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <Container className="py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading
          title="Get in Touch"
          description="Questions, feedback, or just want to say hi? We read every message."
          align="center"
        />
      </motion.div>

      <Grid cols={2} gap="lg" className="max-w-5xl mx-auto">
        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-lg p-6 sm:p-8"
          >
            <Stack gap="md">
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400"
                >
                  Message sent! We'll get back to you within 24 hours.
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-cyber"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-cyber"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-400">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="input-cyber resize-none"
                  required
                />
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </Stack>
          </form>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {[
            {
              icon: Mail,
              title: "Email",
              value: "hello@cyberhex.dev",
              link: "mailto:hello@cyberhex.dev",
            },
            {
              icon: GithubIcon,
              title: "GitHub",
              value: "github.com/cyberhex",
              link: "https://github.com/dulshansiriwardhana/cyberhex",
            },
            {
              icon: TwitterIcon,
              title: "Twitter / X",
              value: "@cyberhex_dev",
              link: "#",
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.link}
              target={item.link.startsWith("http") ? "_blank" : undefined}
              rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="block rounded-2xl border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-lg p-5 hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-sm text-cyan-400">{item.value}</p>
                </div>
              </div>
            </a>
          ))}

          <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 backdrop-blur-lg p-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-sm text-neutral-400">Distributed team · Worldwide</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Grid>
    </Container>
  );
}