import { useEffect, useRef } from "react";

export default function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const fontSize = 14;
        const columns = Math.ceil(width / fontSize);
        const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * -height / fontSize);

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

        function draw() {
            ctx!.fillStyle = "rgba(5, 5, 8, 0.08)";
            ctx!.fillRect(0, 0, width, height);

            ctx!.font = `${fontSize}px JetBrains Mono, monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];

                // Variadic opacity based on drop speed (faux depth)
                const opacity = Math.min(1, Math.random() + 0.3);
                ctx!.fillStyle = `rgba(34, 197, 94, ${opacity * 0.35})`;

                // Draw head glyph in brighter green
                if (Math.random() > 0.95) {
                    ctx!.fillStyle = `rgba(74, 222, 128, 0.8)`;
                }

                ctx!.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 0.75 + Math.random() * 0.5;
            }
        }

        const interval = setInterval(draw, 50);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const newColumns = Math.ceil(width / fontSize);
            if (newColumns > drops.length) {
                const extra = new Array(newColumns - drops.length).fill(1).map(() => Math.random() * -height / fontSize);
                drops.push(...extra);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none opacity-[0.12] z-0"
        />
    );
}

