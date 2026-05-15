import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Shield,
  Terminal,
  Code2,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Container, SectionHeading, Grid, Flex, Stack } from "@/components/ui/layout";

const values = [
  {
    icon: Zap,
    title: "Speed First",
    description:
      "We built the inference engine in C++ because Python is too slow. Every millisecond counts.",
  },
  {
    icon: Terminal,
    title: "Hacker Ethos",
    description:
      "This is a platform built by engineers, for engineers. No hand-holding, no bloat — just power.",
  },
  {
    icon: Shield,
    title: "Open Core",
    description:
      "The core engine is open source. You can inspect, fork, and contribute to the heart of CyberHex.",
  },
  {
    icon: Cpu,
    title: "Edge Ready",
    description:
      "Export models to pure C++ binaries that run on embedded devices, browsers via WASM, or bare metal.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading
          title="About CyberHex"
          description="We're building the machine learning platform that hackers deserve."
          align="center"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-3xl mx-auto mb-16"
      >
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-8 backdrop-blur-lg">
          <p className="text-lg text-neutral-300 leading-relaxed">
            CyberHex started with a simple question:{" "}
            <span className="text-cyan-400 font-semibold">
              why do you need a PhD to train a neural network?
            </span>
          </p>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            We stripped away the Jupyter notebooks, the cloud dependencies, and
            the Python overhead. What remains is a visual editor backed by a
            custom C++ inference engine that runs at native speed — in your
            browser or on bare metal.
          </p>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            Whether you're a student learning the fundamentals or an engineer
            shipping production models, CyberHex gives you the tools you need
            without the cruft you don't.
          </p>
        </div>
      </motion.div>

      <SectionHeading title="Our Principles" align="center" />

      <Grid cols={4} gap="md" className="mb-16">
        {values.map((value, i) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-6 text-center backdrop-blur-lg hover:border-cyan-500/20 transition-all duration-300 h-full">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/10 mb-4">
                <value.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{value.description}</p>
            </div>
          </motion.div>
        ))}
      </Grid>

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-extrabold text-white mb-4">
          Ready to <span className="text-cyan-400">build</span>?
        </h2>
        <Flex justify="center" gap="md">
          <Link to="/signup">
            <Button size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <a
            href="https://github.com/dulshansiriwardhana/cyberhex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              <GithubIcon className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </a>
        </Flex>
      </div>
    </Container>
  );
}