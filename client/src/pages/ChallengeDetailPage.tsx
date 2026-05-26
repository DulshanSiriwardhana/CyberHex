import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Trophy,
    Users,
    Clock,
    Swords,
    Shield,
    Zap,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Flex, SectionHeading } from "@/components/ui/layout";

export default function ChallengeDetailPage() {
    const { id } = useParams();

    return (
        <Container className="py-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <Link
                    to="/cybergames"
                    className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-green-400 transition-colors mb-4"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Arena
                </Link>
                <Flex justify="between" wrap align="start">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <Swords className="h-7 w-7 text-green-400" />
                            Challenge Alpha-{id}
                        </h1>
                        <p className="mt-1 text-neutral-400 max-w-2xl">
                            Competitive ML arena: Train a model to detect advanced persistent threats (APT) in encrypted traffic streams.
                        </p>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-1.5 px-4 text-sm font-bold">
                        2,500 HEX PRIZE
                    </Badge>
                </Flex>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-neutral-800/60 bg-neutral-900/40">
                        <CardHeader>
                            <CardTitle>Objective</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-neutral-300">
                                Submit a compiled C++ model or a Python pipeline that achieves the highest F1-score on the private <b>CyberHex-APT-024</b> test set.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Accuracy</p>
                                    <p className="text-lg font-mono text-white">&gt; 94.5%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Latency</p>
                                    <p className="text-lg font-mono text-white">&lt; 12ms</p>
                                </div>
                                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Params</p>
                                    <p className="text-lg font-mono text-white">5.2k Max</p>
                                </div>
                                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold">Epochs</p>
                                    <p className="text-lg font-mono text-white">200 Max</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed border-neutral-800 bg-transparent">
                        <CardContent className="py-12 text-center">
                            <Lock className="h-10 w-10 text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-500">Dataset Locked</h3>
                            <p className="text-sm text-neutral-600 mb-6">Enter the arena to unlock training telemetry and submission portal.</p>
                            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-neutral-950 font-bold">
                                Enter Arena Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Competition Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Flex justify="between" className="text-sm">
                                <span className="text-neutral-500 flex items-center gap-2"><Users className="h-4 w-4" /> Players</span>
                                <span className="text-white font-mono">156</span>
                            </Flex>
                            <Flex justify="between" className="text-sm">
                                <span className="text-neutral-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Ends In</span>
                                <span className="text-white font-mono">3d 14h 22m</span>
                            </Flex>
                            <Flex justify="between" className="text-sm">
                                <span className="text-neutral-500 flex items-center gap-2"><Zap className="h-4 w-4" /> Submissions</span>
                                <span className="text-white font-mono">1,402</span>
                            </Flex>
                            <Flex justify="between" className="text-sm">
                                <span className="text-neutral-500 flex items-center gap-2"><Shield className="h-4 w-4" /> Difficulty</span>
                                <Badge variant="outline" className="border-rose-500/40 text-rose-400">HARD</Badge>
                            </Flex>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Top Competitors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { name: "zero_day_hero", score: "99.2%" },
                                { name: "packet_paladin", score: "98.9%" },
                                { name: "malware_maestro", score: "98.5%" },
                            ].map((p, i) => (
                                <Flex key={p.name} justify="between" className="text-sm">
                                    <span className="text-neutral-300">#{i + 1} {p.name}</span>
                                    <span className="text-green-400 font-mono">{p.score}</span>
                                </Flex>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Container>
    );
}
