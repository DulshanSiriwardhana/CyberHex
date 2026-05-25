import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, Terminal, Laptop } from 'lucide-react';
import { Container, Grid, Flex } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PLANS = [
    {
        name: 'Researcher',
        price: '$0',
        desc: 'For individual engineers and security researchers.',
        icon: Terminal,
        color: 'text-neutral-400',
        features: [
            '5 AI Experiments / month',
            'Basic Neural Architectures',
            'Community Datasets',
            'Standard ML Engine Access',
            'CSV Export only',
        ],
        cta: 'Start Researching',
        popular: false,
    },
    {
        name: 'Professional',
        price: '$49',
        desc: 'For professional security teams and high-scale training.',
        icon: Shield,
        color: 'text-green-400',
        features: [
            'Unlimited Experiments',
            'Advanced Transformer Layers',
            'Custom Dataset Hosting',
            'Priority ML Compute Hub',
            'ONNX & C++ Header Export',
            'WebSocket Live Metrics',
        ],
        cta: 'Upgrade to Pro',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        desc: 'Bespoke infrastructure for global enterprise security.',
        icon: Crown,
        color: 'text-violet-400',
        features: [
            'Dedicated GPU Clusters',
            'On-Premise Deployment',
            'Custom SLA & Support',
            'Agentic Workflow Automation',
            'Biometric Model Security',
            'Unlimited Seat Licenses',
        ],
        cta: 'Contact Sales',
        popular: false,
    }
];

export default function PricingPage() {
    return (
        <Container className="py-20 pt-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
                    Scale Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-violet-500">Intelligence</span>
                </h1>
                <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                    Flexible infrastructure for every stage of your security engineering journey.
                </p>
            </motion.div>

            <Grid cols={3} gap="lg" className="items-stretch">
                {PLANS.map((plan, i) => {
                    const Icon = plan.icon;
                    return (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="h-full"
                        >
                            <div className={`relative h-full flex flex-col p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${plan.popular
                                    ? 'bg-neutral-900 border-green-500/50 shadow-[0_20px_50px_rgba(34,197,94,0.1)]'
                                    : 'bg-neutral-900/40 border-neutral-800'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-neutral-950 text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`h-12 w-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mb-6 ${plan.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="text-neutral-500 text-sm">/month</span>}
                                    </div>
                                    <p className="text-neutral-500 text-sm mt-3">{plan.desc}</p>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feat) => (
                                        <div key={feat} className="flex items-start gap-3">
                                            <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Check className="h-2.5 w-2.5 text-green-400" />
                                            </div>
                                            <span className="text-sm text-neutral-300">{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'}>
                                    <Button
                                        size="lg"
                                        variant={plan.popular ? 'success' : 'outline'}
                                        className={`w-full font-bold h-12 ${plan.popular
                                                ? 'bg-green-500 hover:bg-green-600 text-neutral-950 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)]'
                                                : 'border-neutral-800 hover:border-green-500/50 hover:text-green-400'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}
            </Grid>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-20 text-center"
            >
                <p className="text-neutral-500 text-sm flex items-center justify-center gap-2">
                    <Laptop className="h-4 w-4" /> Trusted by engineering teams at forward-thinking security firms.
                </p>
            </motion.div>
        </Container>
    );
}
