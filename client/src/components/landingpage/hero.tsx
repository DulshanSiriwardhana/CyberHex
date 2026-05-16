import { useEffect, useRef, useState } from "react";
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
import { stats } from "@/const/data";

const floatingIcons = [
  { Icon: Cpu, x: "10%", y: "20%", delay: 0, duration: 5 },
  { Icon: Zap, x: "85%", y: "15%", delay: 1.2, duration: 5.5 },
  { Icon: Shield, x: "15%", y: "70%", delay: 0.6, duration: 6 },
  { Icon: Sparkles, x: "80%", y: "65%", delay: 1.8, duration: 4.5 },
];

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const count = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.a})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

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
      {/* Particle canvas */}
      <ParticleField />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-cyber-radial pointer-events-none" />

      {/* Grid background */}
      <div className="absolute inset-0 bg-cyber-grid animate-grid-pulse pointer-events-none" />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, x, y, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-500/15"
          style={{ left: x, top: y }}
          animate={{ y: ["-10px", "10px", "-10px"] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon className="h-12 w-12 sm:h-16 sm:w-16" />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-sm font-medium text-cyan-400 mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          v3.0 — Multi-Theme + Native C++ Inference Engine
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="block">Build Neural Networks</span>
          <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            Like a Hacker
          </span>
        </motion.h1>

        {/* Typed subtitle */}
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
          className="mt-4 text-base text-neutral-500 max-w-xl mx-auto"
        >
          Design, train, and deploy neural networks with a visual editor and a
          blazing-fast C++ inference engine. No Jupyter notebooks required.
        </motion.p>

        {/* CTA Buttons */}
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

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {stat.value}
                <span className="text-cyan-400">{stat.suffix}</span>
              </div>
              <div className="mt-1 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
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