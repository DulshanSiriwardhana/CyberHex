import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  ChevronDown,
  Brain,
  Activity,
  Globe,
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/stores/authModal";

const floatingIcons = [
  { Icon: Cpu, x: "12%", y: "18%", delay: 0, duration: 6.8 },
  { Icon: Zap, x: "82%", y: "15%", delay: 1.2, duration: 5.2 },
  { Icon: Network, x: "18%", y: "65%", delay: 0.6, duration: 7.2 },
  { Icon: Sparkles, x: "85%", y: "60%", delay: 1.8, duration: 5.8 },
  { Icon: Brain, x: "45%", y: "10%", delay: 0.9, duration: 6.5 },
  { Icon: Activity, x: "88%", y: "38%", delay: 0.3, duration: 5.0 },
  { Icon: Globe, x: "8%", y: "44%", delay: 1.5, duration: 6.0 },
];

const PHRASES = [
  "A Complete AI Engineering Workspace",
  "Visual Neural Architecture Search",
  "Mathematical Visualization Engine",
  "Jupyter-Scale Interactive Notebooks",
  "Venture-Funded Grade MLOps Platform",
];

function useTypewriter(phrases: string[], speed = 45, pause = 2000) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (charIdx < current.length) {
        timer = setTimeout(() => setCharIdx(i => i + 1), speed);
      } else {
        timer = setTimeout(() => setDeleting(true), pause);
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => setCharIdx(i => i - 1), speed / 2);
      } else {
        setDeleting(false);
        setPhraseIdx(i => (i + 1) % phrases.length);
      }
    }

    setText(current.slice(0, charIdx));
    return () => clearTimeout(timer);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return text;
}

export default function Hero() {
  const { openSignUp } = useAuthModal();
  const typedText = useTypewriter(PHRASES);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 font-spectral">
      {/* Background Orbs & Effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-500/20 z-0"
          style={{ left: x, top: y }}
          animate={{ y: ["-10px", "10px", "-10px"], rotate: [0, 5, -5, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="h-10 w-10 sm:h-14 sm:w-14 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-mono font-medium text-emerald-400 tracking-widest uppercase">Omega Engine Released</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-7xl md:text-8xl font-light text-white tracking-tight leading-[1.1] drop-shadow-lg"
        >
          Intelligence, <br />
          <span className="font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">Architected.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 text-xl sm:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light min-h-[4rem]"
        >
          <span className="text-emerald-400 font-mono tracking-tight">{typedText}</span>
          <span className="animate-pulse text-emerald-400 ml-1">_</span>
        </motion.p>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.6, delay: 0.75 }}
           className="mt-6 text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Destroying the dashboard paradigm. We've redesigned CyberHex into a highly mathematical, ultra-performance operating system for data scientists and AI startups.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Button size="xl" onClick={openSignUp} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/20 font-medium px-8 h-14 rounded-xl text-lg font-mono uppercase tracking-wide transition-all">
            <Sparkles className="h-5 w-5 mr-3" />
            Initialize Workspace
          </Button>
          <Link to="/workspace/data">
             <Button variant="outline" size="xl" className="border-white/10 hover:bg-white/5 text-white h-14 rounded-xl px-8 font-light tracking-wide text-lg">
                <Brain className="h-5 w-5 mr-3 text-neutral-400" />
                View Architecture
             </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Deploy Architecture</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-emerald-500/50"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
