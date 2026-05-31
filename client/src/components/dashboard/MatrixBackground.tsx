import { useEffect, useRef } from "react";

export default function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
        const charArray = chars.split("");

        // Multi-layered columns for depth
        const layers = [
            { fontSize: 12, speed: 0.5, color: "rgba(34, 197, 94, 0.4)", headColor: "rgba(74, 222, 128, 0.6)", columns: [] as number[], yPositions: [] as number[], drops: [] as number[] },
            { fontSize: 16, speed: 1.0, color: "rgba(34, 197, 94, 0.7)", headColor: "rgba(134, 239, 172, 0.9)", columns: [] as number[], yPositions: [] as number[], drops: [] as number[] },
            { fontSize: 24, speed: 1.5, color: "rgba(34, 197, 94, 1)", headColor: "rgba(255, 255, 255, 1)", columns: [] as number[], yPositions: [] as number[], drops: [] as number[] }
        ];

        const setupLayers = () => {
            layers.forEach(layer => {
                const numCols = Math.ceil(width / layer.fontSize);
                layer.drops = Array.from({ length: numCols }, () => Math.random() * -100);
            });
        };

        setupLayers();

        // Setup background color for trail clearing
        ctx.fillStyle = "#050508";
        ctx.fillRect(0, 0, width, height);

        let lastTime = 0;
        const fps = 30; // Matrix style usually looks better around 30 FPS rather than super smooth 60
        const interval = 1000 / fps;

        const draw = (currentTime: number) => {
            animationFrameId = requestAnimationFrame(draw);

            const deltaTime = currentTime - lastTime;
            if (deltaTime < interval) return;

            lastTime = currentTime - (deltaTime % interval);

            // Semi-transparent black for the fading trails (adjust alpha for trail length)
            ctx.fillStyle = "rgba(5, 5, 8, 0.15)";
            ctx.fillRect(0, 0, width, height);

            layers.forEach((layer) => {
                ctx.font = `${layer.fontSize}px 'JetBrains Mono', monospace`;
                ctx.textAlign = "center";

                for (let i = 0; i < layer.drops.length; i++) {
                    const text = charArray[Math.floor(Math.random() * charArray.length)];
                    const x = i * layer.fontSize + layer.fontSize / 2;
                    const y = layer.drops[i] * layer.fontSize;

                    // Randomly highlight characters
                    if (Math.random() > 0.9) {
                        ctx.fillStyle = layer.headColor;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = layer.headColor;
                    } else {
                        ctx.fillStyle = layer.color;
                        ctx.shadowBlur = 0;
                    }

                    ctx.fillText(text, x, y);

                    // Reset drop to top randomly or when it goes off screen
                    if (y > height && Math.random() > 0.95) {
                        layer.drops[i] = 0;
                    }

                    // Move drop down
                    layer.drops[i] += layer.speed;
                }
            });
        };

        animationFrameId = requestAnimationFrame(draw);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx.fillStyle = "#050508";
            ctx.fillRect(0, 0, width, height);
            setupLayers();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
                opacity: 0.45,
                mixBlendMode: "screen"
            }}
        />
    );
}

