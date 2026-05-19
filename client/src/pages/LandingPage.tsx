import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Terminal as TerminalIcon,
  Sparkles,
  Heart,
  Code2,
} from "lucide-react";
import Hero from "@/components/landingpage/hero";
import Terminal from "@/components/terminal/Terminal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionHeading, Container, Grid, Stack, Flex } from "@/components/ui/layout";
import { features } from "@/const/data";
import { CyberHexWord, ReleaseBadge } from "@/components/brand";

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

function FeatureCard({
  title,
  description,
  icon,
  gradient,
  index,
}: (typeof features)[0] & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card className="group h-full border-neutral-800/50 bg-neutral-900/40 hover:border-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]">
        <CardContent className="p-6 pt-6">
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} border border-green-500/10 text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          <CardTitle className="text-lg mb-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-cyber-radial pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid-dense pointer-events-none opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm font-medium text-violet-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Ready to build?
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Start Training Models{" "}
          <span className="bg-gradient-to-r from-green-400 to-violet-400 bg-clip-text text-transparent">
            Today
          </span>
        </h2>
        <p className="mt-4 text-lg text-neutral-400 max-w-xl mx-auto">
          No PhD required. No cloud bills. Just your browser and a C++ engine
          that runs circles around Python.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="xl">
              <TerminalIcon className="h-5 w-5 mr-2" />
              Launch Terminal — Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="xl">
              Read the Docs
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-lg">
      <Container className="py-12">
        <Grid cols={4} gap="lg">
          <Stack gap="sm">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                <TerminalIcon className="h-4 w-4 text-white" />
              </div>
              <CyberHexWord size="sm" showSerial={false} />
            </Link>
            <ReleaseBadge variant="compact" pulse={false} className="w-fit text-xs py-1 px-3" />
            <p className="text-sm text-neutral-500 max-w-xs">
              Next-generation machine learning platform built for hackers and
              engineers.
            </p>
            <Flex gap="sm" className="mt-2">
              <a
                href="https://github.com/dulshansiriwardhana/cyberhex"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
            </Flex>
          </Stack>

          <Stack gap="sm">
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <Link to="/dashboard" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link to="/models" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Models
            </Link>
            <Link to="/experiments" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Experiments
            </Link>
            <Link to="/cybergames" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              CyberGames
            </Link>
          </Stack>

          <Stack gap="sm">
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <Link to="/about" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Contact
            </Link>
          </Stack>

          <Stack gap="sm">
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <a href="#" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-neutral-400 hover:text-green-400 transition-colors">
              Terms of Service
            </a>
          </Stack>
        </Grid>

        <div className="mt-12 pt-8 border-t border-neutral-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} CyberHex. All rights reserved.
          </p>
          <p className="text-xs text-neutral-700 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-rose-400" /> and <Code2 className="h-3 w-3 text-green-400" /> by the CyberHex team
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Hero />

      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />
        <Container>
          <SectionHeading
            title="Everything You Need to Ship ML"
            description="From architecture design to production inference — all in one platform built for speed."
          />
          <Grid cols={3} gap="md">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </Grid>
        </Container>
      </section>

      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-30" />
        <Container>
          <SectionHeading
            title="Try It in the Terminal"
            description="A real CLI experience — type commands to explore the platform."
            align="center"
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Terminal />
          </motion.div>
        </Container>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}