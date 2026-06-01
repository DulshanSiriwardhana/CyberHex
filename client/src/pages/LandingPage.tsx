import { motion } from "framer-motion";
import Hero from "@/components/landingpage/hero";
import { Container, SectionHeading } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import {
    Zap,
    Layers,
    Cpu,
    Brain,
    Shield,
    Terminal,
    Database,
    BookOpen
} from "lucide-react";

const localFeatures = [
    {
        icon: Terminal,
        title: "Bare-Metal Speed",
        description: "Built with a high-performance C++ ML engine using AVX-512 and custom BLAS routines for near-native training speeds.",
        color: "text-emerald-400"
    },
    {
        icon: Database,
        title: "Data Science Workbench",
        description: "Comprehensive dataset explorer. Feature engineer, profile data, repair missing values, and encode directly via visual tools.",
        color: "text-blue-400"
    },
    {
        icon: BookOpen,
        title: "Notebook System",
        description: "Jupyter-scale integrated notebook engine supporting Markdown, Code, Math, Visualizations, and embedded ML outputs.",
        color: "text-amber-400"
    },
    {
        icon: Brain,
        title: "Mathematical Engine",
        description: "Highly mathematical core exposing formulas, derivations, assumptions, and computational complexities of every model.",
        color: "text-violet-400"
    },
    {
        icon: Cpu,
        title: "Real-Time Visualizations",
        description: "Powered by WebGL/WebGPU. View animated backpropagation, gradient flows, attention maps, and dead neurons live.",
        color: "text-cyan-400"
    },
    {
        icon: Shield,
        title: "Self-Hosted Enterprise",
        description: "Compete with global cloud AI platforms without leaving your local environment. Deploy models instantly with enterprise MLOps.",
        color: "text-rose-400"
    }
];

export default function LandingPage() {
    return (
        <div className="os-canvas min-h-screen font-spectral">
            <Hero />

            <Container className="py-32 relative z-10">
                <div className="text-center mb-20">
                     <h2 className="text-5xl font-light text-white tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Architecting Intelligence</h2>
                     <p className="text-neutral-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                          A unified, venture-funded-grade AI operating system built natively for technical engineers, quantitative analysts, and AI researchers. 
                     </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {localFeatures.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="os-glass-panel h-full border-neutral-800/40 hover:border-white/10 transition-all duration-500 overflow-hidden relative group">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:scale-x-150 transition-transform duration-1000" />
                                <div className="p-8 pb-10">
                                    <div className={`h-14 w-14 rounded-2xl bg-neutral-900/80 border border-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}>
                                        <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${feature.color.replace('text-', 'text-')}`} />
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-neutral-400 text-[15px] leading-relaxed font-light">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>

            {/* Modern Omega platform footer */}
            <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md py-12 relative z-10">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <Terminal className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="text-xl font-light text-white tracking-tight">Cyber<span className="font-semibold text-emerald-400">Hex</span></span>
                                <span className="ml-3 text-[10px] font-mono tracking-widest text-emerald-500/80 uppercase px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Omega OS</span>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[11px] text-neutral-500 font-mono tracking-wider uppercase">
                               © 2035 CyberHex Architecture.
                           </p>
                           <p className="text-[10px] text-neutral-600 font-mono tracking-wider mt-1">Maximum Intelligence Platform</p>
                        </div>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
