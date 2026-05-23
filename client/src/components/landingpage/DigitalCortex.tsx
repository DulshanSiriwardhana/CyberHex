import { useEffect, useRef } from "react";

export default function DigitalCortex() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const particles: Particle[] = [];
        const particleCount = 20;
        const connectionDistance = 200;
        let mouse = { x: -1000, y: -1000 };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            pulse: number;
            pulseSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
                this.pulse = Math.random() * Math.PI;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;
            }

            update(time: number) {
                // Noise-simulated vector field influence
                const noiseX = Math.sin(this.x * 0.005 + time * 0.001) * 0.15;
                const noiseY = Math.cos(this.y * 0.005 + time * 0.001) * 0.15;

                this.vx += noiseX;
                this.vy += noiseY;

                // Velocity Damping for 'Pro' physics feel
                this.vx *= 0.99;
                this.vy *= 0.99;

                this.x += this.vx;
                this.y += this.vy;
                this.pulse += this.pulseSpeed;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 300) {
                    const force = (300 - dist) / 300;
                    this.vx += dx * force * 0.001;
                    this.vy += dy * force * 0.001;
                }
            }

            draw() {
                if (!ctx) return;
                const opacity = 0.2 + Math.sin(this.pulse) * 0.2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 2})`;
                ctx.fill();

                // Lightweight glow: only for a few 'active' nodes
                if (Math.sin(this.pulse) > 0.8) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(34, 197, 94, 0.05)`;
                    ctx.fill();
                }
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        const animate = (time: number) => {
            ctx.fillStyle = "rgba(9, 9, 11, 0.2)"; // Match neutral-950
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = "screen";

            particles.forEach((p, i) => {
                p.update(time);
                p.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < connectionDistance * connectionDistance) {
                        const dist = Math.sqrt(distSq);
                        const alpha = (1 - dist / connectionDistance) * 0.15;
                        if (alpha < 0.02) continue; // Skip very faint lines
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
                        ctx.lineWidth = 0.4;
                        ctx.stroke();
                    }
                }
            });
            ctx.globalCompositeOperation = "source-over";
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleClick = () => {
            // Professional interaction: explode on click
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 500) {
                    p.vx += (dx / dist) * 2;
                    p.vy += (dy / dist) * 2;
                }
            });
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);
        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0 opacity-60"
        />
    );
}
