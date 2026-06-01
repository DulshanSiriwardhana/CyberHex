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
    Activity,
    Terminal
} from "lucide-react";

const localFeatures = [
    {
        icon: Terminal,
        title: "Bare-Metal Speed",
        description: "Built with a high-performance C++ ML engine using AVX-512 and custom BLAS routines for near-native training speeds.",
        color: "text-green-400"
    },
    {
        icon: Layers,
        title: "Visual Designer",
        description: "Assemble complex neural architectures visually. Drag, drop, and configure layers without writing a single line of boilerplate.",
        color: "text-violet-400"
    },
    {
        icon: Zap,
        title: "Real-Time Metrics",
        description: "Stream training logs and loss curves in real-time over high-speed WebSockets. No more waiting for plots to render.",
        color: "text-amber-400"
    },
    {
        icon: Cpu,
        title: "Native Inference",
        description: "Export models to ONNX or deploy directly to the native C++ inference engine for ultra-low latency threat detection.",
        color: "text-emerald-400"
    },
    {
        icon: Brain,
        title: "∞-IQ ML Engine",
        description: "Advanced optimizers (AdamW, RAdam, Lion), ensemble checkpointing, and synthetic cyber-traffic generators built right in.",
        color: "text-cyan-400"
    },
    {
        icon: Shield,
        title: "Cyber-Focused",
        description: "Specifically designed for cybersecurity datasets, packet inspection, and real-time anomaly detection workflows.",
        color: "text-rose-400"
    }
];

export default function LandingPage() {
    return (
        <div className="bg-neutral-950 min-h-screen">
            <Hero />

            <Container className="py-24 relative z-10">
                <SectionHeading
                    title="Engineered for Performance"
                    subtitle="A local-first machine learning platform designed for technical engineers who demand speed and precision."
                    center
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {localFeatures.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <Card className="h-full border-neutral-800/60 bg-neutral-900/40 backdrop-blur-sm group hover:border-green-500/30 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className={`h-12 w-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Container>

            {/* Modern local-only footer */}
            <footer className="border-t border-neutral-900 bg-neutral-950 py-12">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                                <Terminal className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-white">CyberHex <span className="text-neutral-500">Local</span></span>
                        </div>
                        <p className="text-xs text-neutral-600 font-mono">
                            © 2026 CyberHex 7.0Local.mini. Built for engineers.
                        </p>
                    </div>
                </Container>
            </footer>
        </div>
    );
}
