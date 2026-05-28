import { motion } from "framer-motion";

export default function WorldThreatMap() {
    // SVG points for major global cities/clusters
    const hubs = [
        { name: "Silicon Valley", x: 60, y: 35, color: "bg-green-500" },
        { name: "London", x: 145, y: 30, color: "bg-violet-500" },
        { name: "Tokyo", x: 260, y: 40, color: "bg-amber-500" },
        { name: "Sydney", x: 270, y: 130, color: "bg-green-500" },
        { name: "Sao Paulo", x: 100, y: 120, color: "bg-violet-500" },
        { name: "Cape Town", x: 160, y: 135, color: "bg-amber-500" },
    ];

    return (
        <div className="relative w-full aspect-[2/1] bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 cyber-grid-overlay opacity-10" />

            {/* Fake World Map SVG using dots */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 320 160">
                <defs>
                    <pattern id="dotPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.5" fill="currentColor" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dotPattern)" className="text-neutral-700" />
            </svg>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 160">
                <motion.path
                    d="M 60 35 Q 100 20 145 30"
                    stroke="rgba(34, 197, 94, 0.4)"
                    strokeWidth="0.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                    d="M 145 30 Q 200 10 260 40"
                    stroke="rgba(139, 92, 246, 0.4)"
                    strokeWidth="0.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                />
                <motion.path
                    d="M 260 40 Q 280 80 270 130"
                    stroke="rgba(245, 158, 11, 0.4)"
                    strokeWidth="0.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 2 }}
                />
            </svg>

            {/* Hubs */}
            {hubs.map((hub) => (
                <div
                    key={hub.name}
                    className="absolute group/hub"
                    style={{ left: `${(hub.x / 320) * 100}%`, top: `${(hub.y / 160) * 100}%` }}
                >
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            className={`absolute h-4 w-4 rounded-full ${hub.color} opacity-20`}
                            animate={{ scale: [1, 2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className={`h-1.5 w-1.5 rounded-full ${hub.color} shadow-[0_0_8px_currentColor]`} />

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/hub:opacity-100 transition-opacity bg-neutral-900 border border-white/10 rounded px-2 py-1 text-[8px] font-bold text-white whitespace-nowrap z-50">
                            {hub.name} / ACTIVE_NODE
                        </div>
                    </div>
                </div>
            ))}

            {/* Header */}
            <div className="absolute top-4 left-5">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-0.5">Global Cluster Monitor</p>
                <p className="text-[8px] font-mono text-green-500/60 font-bold uppercase"># ACTIVE_NEURAL_STREAMS: 6</p>
            </div>

            {/* Footer Stats */}
            <div className="absolute bottom-4 right-5 text-right font-mono text-[8px] text-neutral-500 space-y-1">
                <p>LATENCY_CL_1: 142ms</p>
                <p>PACKET_LOSS_AV: 0.0002%</p>
            </div>
        </div>
    );
}
