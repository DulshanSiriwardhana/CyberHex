import { motion } from 'framer-motion';
import { FlaskConical, Target, Zap, Shield, Cpu, Layers } from 'lucide-react';
import { Container, Grid, Flex } from '@/components/ui/layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PUBLIC_EXPERIMENTS = [
    {
        id: 'exp-1',
        name: 'Zero-Day Detection v2',
        accuracy: '99.4%',
        loss: '0.021',
        status: 'completed',
        author: 'CyberHex Core',
        desc: 'Advanced heuristic-based intrusion detection trained on 500GB of malicious packet streams.'
    },
    {
        id: 'exp-2',
        name: 'DDoS Mitigation Engine',
        accuracy: '98.1%',
        loss: '0.045',
        status: 'completed',
        author: 'CyberHex Core',
        desc: 'Real-time traffic flow analyzer designed for edge firewall automated response.'
    },
    {
        id: 'exp-3',
        name: 'Neural Firewall Alpha',
        accuracy: '97.2%',
        loss: '0.068',
        status: 'training',
        author: 'Security Lead',
        desc: 'Adaptive neural architecture for analyzing encrypted payload entropy.'
    }
];

export default function GuestShowcasePage() {
    return (
        <Container className="py-20 pt-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                    Neural Showcase
                </h1>
                <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                    Explore the state-of-the-art models and experiments developed by the CyberHex community.
                </p>
            </motion.div>

            <Grid cols={3} gap="lg" className="mb-20">
                {PUBLIC_EXPERIMENTS.map((exp, i) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="h-full border-neutral-800/50 bg-neutral-900/20 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${exp.status === 'training' ? 'bg-green-500/10 text-green-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                        <FlaskConical className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{exp.author}</span>
                                </div>
                                <CardTitle className="text-xl text-white">{exp.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-neutral-500 mb-6 line-clamp-2">
                                    {exp.desc}
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800">
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Accuracy</p>
                                        <p className="text-lg font-mono text-green-400">{exp.accuracy}</p>
                                    </div>
                                    <div className="bg-neutral-950/50 rounded-lg p-3 border border-neutral-800">
                                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">Loss</p>
                                        <p className="text-lg font-mono text-indigo-400">{exp.loss}</p>
                                    </div>
                                </div>
                                <Link to="/signup">
                                    <Button variant="outline" className="w-full border-neutral-700 hover:border-green-500 hover:text-green-400">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </Grid>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8 md:p-12 text-center relative overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full" />

                <div className="relative z-10">
                    <SectionIcon icon={Zap} color="text-yellow-400" />
                    <h2 className="text-3xl font-bold text-white mb-4">Unleash Your Own AI Models</h2>
                    <p className="text-neutral-400 max-w-xl mx-auto mb-8">
                        Join thousands of security engineers building, training, and deploying high-performance neural networks
                        on the world's most advanced cyber-security ML platform.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="px-8 bg-green-500 hover:bg-green-600 text-neutral-950 font-bold h-12 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)]">
                                Start Training Now
                            </Button>
                        </Link>
                        <Link to="/docs">
                            <Button size="lg" variant="outline" className="px-8 h-12">
                                Browse Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </Container>
    );
}

function SectionIcon({ icon: Icon, color }: { icon: any, color: string }) {
    return (
        <div className={`h-14 w-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto mb-6 ${color}`}>
            <Icon className="h-7 w-7" />
        </div>
    );
}
