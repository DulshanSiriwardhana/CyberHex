import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CyberHexWord, ReleaseBadge } from "@/components/brand";
import { stats } from "@/const/data";

const floatingIcons = [
  { Icon: Cpu, x: "10%", y: "20%", delay: 0, duration: 5 },
  { Icon: Zap, x: "85%", y: "15%", delay: 1.2, duration: 5.5 },
  { Icon: Shield, x: "15%", y: "70%", delay: 0.6, duration: 6 },
  { Icon: Sparkles, x: "80%", y: "65%", delay: 1.8, duration: 4.5 },
];

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Machine Learning for Hackers";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-cyber-radial pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-[0.35]" />

      {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-500/10"
          style={{ left: x, top: y }}
          animate={{ y: ["-8px", "8px", "-8px"] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="h-10 w-10 sm:h-14 sm:w-14" />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-6 flex justify-center wordmark-v4-hero-glow pl-4"
        >
          <CyberHexWord size="hero" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10"
        >
          <ReleaseBadge variant="live" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="block">Build Neural Networks</span>
          <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            Like a Hacker
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-lg text-neutral-400 sm:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          <span className="text-cyan-400 font-mono">{typedText}</span>
          <span className="animate-terminal-cursor text-cyan-400">|</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed"
        >
          Design, train, and deploy neural networks with a visual editor and a
          blazing-fast C++ inference engine. No Jupyter notebooks required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup">
            <Button size="xl">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Building Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="xl">
              <Cpu className="h-5 w-5 mr-2" />
              See How It Works
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-5 backdrop-blur-sm"
            >
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                {stat.value}
                <span className="text-cyan-400">{stat.suffix}</span>
              </div>
              <div className="mt-1 text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-neutral-600"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
