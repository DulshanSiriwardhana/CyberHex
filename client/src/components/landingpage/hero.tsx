import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  ChevronDown,
  Brain,
  Activity,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CyberHexWord, ReleaseBadge } from "@/components/brand";
import { stats } from "@/const/data";
import { useAuthModal } from "@/stores/authModal";
import DigitalCortex from "./DigitalCortex";


const floatingIcons = [
  { Icon: Cpu, x: "8%", y: "18%", delay: 0, duration: 5.8 },
  { Icon: Zap, x: "84%", y: "12%", delay: 1.2, duration: 5.2 },
  { Icon: Shield, x: "12%", y: "72%", delay: 0.6, duration: 6.2 },
  { Icon: Sparkles, x: "82%", y: "68%", delay: 1.8, duration: 4.8 },
  { Icon: Brain, x: "50%", y: "8%", delay: 0.9, duration: 5.5 },
  { Icon: Activity, x: "92%", y: "42%", delay: 0.3, duration: 6.0 },
  { Icon: Globe, x: "5%", y: "44%", delay: 1.5, duration: 5.0 },
];


const PHRASES = [
  "Machine Learning for Cyber Engineers",
  "Train Neural Nets in Your Browser",
  "Real-Time Threat Detection Models",
  "C++ Speed · Python Simplicity",
  "World-Class ML Infrastructure",
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


function AnimatedStat({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="relative rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-5 backdrop-blur-sm overflow-hidden group hover:border-green-500/30 transition-all duration-500"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={visible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      { }
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-500/5 to-violet-500/5 pointer-events-none" />

      { }
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"
        animate={{ y: ["0%", "400%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          <motion.span
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
          >
            {value}
          </motion.span>
          <span className="text-green-400">{suffix}</span>
        </div>
        <div className="mt-1 text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
    </motion.div>
  );
}


function ParallaxContainer({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const rotateX = useTransform(springY, [-300, 300], [3, -3]);
  const rotateY = useTransform(springX, [-300, 300], [-3, 3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY, perspective: 1200, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}


const STATUS_ITEMS = [
  { color: "bg-green-400", label: "ML Engine", status: "OPERATIONAL" },
  { color: "bg-violet-400", label: "WebSocket", status: "LIVE" },
  { color: "bg-cyan-400", label: "Inference", status: "0.4ms AVG" },
];


export default function Hero() {
  const { openSignUp } = useAuthModal();
  const typedText = useTypewriter(PHRASES);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      { }
      <div className="absolute inset-0 bg-cyber-radial pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-[0.3]" />

      { }
      <div className="absolute inset-0 bg-cyber-grid-dense pointer-events-none opacity-[0.08]" />

      { }
      <DigitalCortex />

      { }
      {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-green-500/8"
          style={{ left: x, top: y }}
          animate={{ y: ["-10px", "10px", "-10px"], rotate: [0, 5, -5, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="h-10 w-10 sm:h-16 sm:w-16" />
        </motion.div>
      ))}

      { }
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">

        { }
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex justify-center wordmark-v4-hero-glow pl-4"
        >
          <CyberHexWord size="hero" />
        </motion.div>

        { }
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <ReleaseBadge variant="live" />
        </motion.div>

        { }
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-10 flex items-center justify-center gap-6 flex-wrap"
        >
          {STATUS_ITEMS.map(({ color, label, status }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-neutral-500">
              <span className={`h-1.5 w-1.5 rounded-full ${color} animate-pulse`} />
              <span className="text-neutral-400 font-medium">{label}</span>
              <span className="text-neutral-600">·</span>
              <span className="font-mono text-neutral-500">{status}</span>
            </div>
          ))}
        </motion.div>

        { }
        <ParallaxContainer>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] cyber-perspective"
          >
            <span className="block cyber-3d-rotate">Build Neural Networks</span>
            <span className="block mt-2 bg-gradient-to-r from-green-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent animate-gradient-shift cyber-3d-rotate">
              Like an Engineer
            </span>
          </motion.h1>
        </ParallaxContainer>

        { }
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 text-lg text-neutral-400 sm:text-xl max-w-2xl mx-auto leading-relaxed min-h-[2rem]"
        >
          <span className="text-green-400 font-mono">{typedText}</span>
          <span className="animate-terminal-cursor text-green-400">|</span>
        </motion.p>

        { }
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-4 text-base text-neutral-500 max-w-xl mx-auto leading-relaxed"
        >
          Design, train, and deploy neural networks with a visual editor and a
          blazing-fast C++ inference engine.{" "}
          <span className="text-green-500/70">Built entirely from scratch.</span>
        </motion.p>

        { }
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button size="xl" onClick={openSignUp} className="relative overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Sparkles className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">Start Building Free</span>
              <ArrowRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <Link to="/about">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="xl">
                <Cpu className="h-5 w-5 mr-2" />
                See How It Works
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        { }
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <AnimatedStat key={i} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </motion.div>
      </div>

      { }
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-neutral-600"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
