import { useMemo } from "react";

export default function MatrixBackground() {
    const columns = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            left: `${i * 2.5}%`,
            duration: `${Math.random() * 10 + 5}s`,
            delay: `${Math.random() * 5}s`,
            chars: Array.from({ length: 20 })
                .map(() => String.fromCharCode(0x30a0 + Math.random() * 96))
                .join(""),
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 matrix-container">
            {columns.map((col, i) => (
                <div
                    key={i}
                    className="absolute top-0 matrix-column font-mono text-[10px]"
                    style={{
                        left: col.left,
                        animationDuration: col.duration,
                        animationDelay: col.delay,
                    }}
                >
                    {col.chars}
                </div>
            ))}
        </div>
    );
}
