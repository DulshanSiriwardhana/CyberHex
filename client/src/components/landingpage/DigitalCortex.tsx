import { useEffect, useRef } from "react";












interface Vec2 { x: number; y: number; }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function DigitalCortex() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        
        const ctx = canvas.getContext("2d")!;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const mouse: Vec2 & { active: boolean } = { x: -2000, y: -2000, active: false };
        let shockwaves: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];

        
        const GREEN = { r: 34, g: 197, b: 94 };  
        const VIOLET = { r: 139, g: 92, b: 246 };  
        const CYAN = { r: 0, g: 229, b: 255 };  
        const ATOM_COLORS = [GREEN, VIOLET, CYAN];

        function rgbA(c: typeof GREEN, a: number) {
            return `rgba(${c.r},${c.g},${c.b},${a})`;
        }

        
        class Particle {
            x: number; y: number;
            vx: number; vy: number;
            size: number;
            pulse: number;
            pulseSpeed: number;
            depth: number;       
            colorIdx: number;
            isNucleus: boolean;  
            signalRings: { r: number; alpha: number }[];
            ringTimer: number;
            angleOffset: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                const speed = 0.15 + Math.random() * 0.35;
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.015 + Math.random() * 0.025;
                this.depth = 0.2 + Math.random() * 0.8;
                this.size = (0.8 + Math.random() * 1.8) * this.depth;
                this.colorIdx = Math.floor(Math.random() * ATOM_COLORS.length);
                this.isNucleus = Math.random() < 0.12;
                this.signalRings = [];
                this.ringTimer = 0;
                this.angleOffset = Math.random() * Math.PI * 2;
            }

            update(time: number) {
                
                const nx = Math.sin(this.x * 0.003 + time * 0.0005) * 0.08 * this.depth;
                const ny = Math.cos(this.y * 0.003 + time * 0.0005) * 0.08 * this.depth;
                this.vx = lerp(this.vx, nx, 0.04);
                this.vy = lerp(this.vy, ny, 0.04);

                
                this.vx *= 0.992;
                this.vy *= 0.992;

                
                if (mouse.active) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 250 * 250) {
                        const d = Math.sqrt(d2);
                        const force = (250 - d) / 250 * 0.0015 * this.depth;
                        this.vx += dx * force;
                        this.vy += dy * force;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
                this.pulse += this.pulseSpeed;

                
                if (this.x < -10) { this.x = width + 10; }
                if (this.x > width + 10) { this.x = -10; }
                if (this.y < -10) { this.y = height + 10; }
                if (this.y > height + 10) { this.y = -10; }

                
                if (this.isNucleus) {
                    this.ringTimer++;
                    if (this.ringTimer > 90 + Math.random() * 120) {
                        this.signalRings.push({ r: this.size * 1.5, alpha: 0.5 });
                        this.ringTimer = 0;
                    }
                    this.signalRings = this.signalRings
                        .map(ring => ({ r: ring.r + 1.2, alpha: ring.alpha * 0.95 }))
                        .filter(ring => ring.alpha > 0.02);
                }
            }

            draw(time: number) {
                if (!ctx) return;
                const c = ATOM_COLORS[this.colorIdx];
                const pulse = Math.sin(this.pulse);
                const alpha = (0.25 + pulse * 0.25) * this.depth;
                const r = this.size * (1 + pulse * 0.3);

                
                for (const ring of this.signalRings) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, ring.r, 0, Math.PI * 2);
                    ctx.strokeStyle = rgbA(c, ring.alpha * this.depth);
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                if (this.isNucleus) {
                    
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.angleOffset + time * 0.0003);
                    ctx.beginPath();
                    for (let k = 0; k < 6; k++) {
                        const a = (k / 6) * Math.PI * 2 - Math.PI / 6;
                        const hx = Math.cos(a) * r * 2.2;
                        const hy = Math.sin(a) * r * 2.2;
                        if (k === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = rgbA(c, alpha * 1.5);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                    ctx.fillStyle = rgbA(c, alpha * 0.15);
                    ctx.fill();
                    ctx.restore();

                    
                    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4);
                    glow.addColorStop(0, rgbA(c, alpha * 0.8));
                    glow.addColorStop(1, "transparent");
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2);
                    ctx.fillStyle = glow;
                    ctx.fill();
                } else {
                    
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = rgbA(c, alpha * 2);
                    ctx.fill();

                    if (pulse > 0.6) {
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, r * 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = rgbA(c, 0.06 * this.depth);
                        ctx.fill();
                    }
                }
            }
        }

        
        class DataPacket {
            from: Particle;
            to: Particle;
            t: number;
            speed: number;
            colorIdx: number;
            size: number;

            constructor(from: Particle, to: Particle) {
                this.from = from;
                this.to = to;
                this.t = 0;
                this.speed = 0.006 + Math.random() * 0.012;
                this.colorIdx = Math.random() < 0.6 ? from.colorIdx : to.colorIdx;
                this.size = 1.5 + Math.random() * 1.5;
            }

            update() { this.t += this.speed; }

            get done() { return this.t >= 1; }

            draw() {
                if (!ctx) return;
                const c = ATOM_COLORS[this.colorIdx];
                const x = lerp(this.from.x, this.to.x, this.t);
                const y = lerp(this.from.y, this.to.y, this.t);
                const alpha = Math.sin(this.t * Math.PI) * 0.9;

                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = rgbA(c, alpha);
                ctx.fill();

                
                const glow = ctx.createRadialGradient(x, y, 0, x, y, this.size * 3);
                glow.addColorStop(0, rgbA(c, alpha * 0.4));
                glow.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.arc(x, y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();
            }
        }

        
        const PARTICLE_COUNT = Math.min(80, Math.floor((width * height) / 14000));
        const CONNECTION_DIST = Math.min(200, width * 0.15);
        const MAX_PACKETS = 12;
        const PACKET_SPAWN_RATE = 0.018;

        const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        const packets: DataPacket[] = [];

        let lastTime = 0;
        let frameCount = 0;
        let rafId: number;

        
        function animate(time: number) {
            rafId = requestAnimationFrame(animate);
            frameCount++;

            
            ctx.fillStyle = "rgba(9,9,11,0.18)";
            ctx.fillRect(0, 0, width, height);

            
            shockwaves = shockwaves
                .map(sw => ({ ...sw, r: sw.r + 6, alpha: sw.alpha * 0.88 }))
                .filter(sw => sw.alpha > 0.02);

            for (const sw of shockwaves) {
                const grad = ctx.createRadialGradient(sw.x, sw.y, sw.r * 0.5, sw.x, sw.y, sw.r);
                grad.addColorStop(0, "transparent");
                grad.addColorStop(0.7, `rgba(34,197,94,${sw.alpha * 0.2})`);
                grad.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            
            ctx.globalCompositeOperation = "screen";

            const sorted = [...particles].sort((a, b) => a.depth - b.depth);

            for (let i = 0; i < sorted.length; i++) {
                sorted[i].update(time);
                sorted[i].draw(time);

                
                for (let j = i + 1; j < sorted.length; j++) {
                    const p2 = sorted[j];
                    const dx = sorted[i].x - p2.x;
                    const dy = sorted[i].y - p2.y;
                    const d2 = dx * dx + dy * dy;

                    if (d2 < CONNECTION_DIST * CONNECTION_DIST) {
                        const d = Math.sqrt(d2);
                        const depthAlpha = (sorted[i].depth + p2.depth) * 0.5;
                        const alpha = (1 - d / CONNECTION_DIST) * 0.13 * depthAlpha;
                        if (alpha < 0.015) continue;

                        
                        const ci = ATOM_COLORS[sorted[i].colorIdx];
                        const cj = ATOM_COLORS[p2.colorIdx];

                        if (sorted[i].colorIdx === p2.colorIdx) {
                            ctx.strokeStyle = rgbA(ci, alpha);
                        } else {
                            
                            const grad = ctx.createLinearGradient(sorted[i].x, sorted[i].y, p2.x, p2.y);
                            grad.addColorStop(0, rgbA(ci, alpha));
                            grad.addColorStop(1, rgbA(cj, alpha));
                            ctx.strokeStyle = grad;
                        }

                        ctx.lineWidth = 0.4 * depthAlpha;
                        ctx.beginPath();
                        ctx.moveTo(sorted[i].x, sorted[i].y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();

                        
                        if (
                            packets.length < MAX_PACKETS &&
                            Math.random() < PACKET_SPAWN_RATE
                        ) {
                            packets.push(new DataPacket(sorted[i], p2));
                        }
                    }
                }
            }

            
            for (let k = packets.length - 1; k >= 0; k--) {
                packets[k].update();
                packets[k].draw();
                if (packets[k].done) packets.splice(k, 1);
            }

            ctx.globalCompositeOperation = "source-over";
        }

        
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };

        const handleMouseLeave = () => { mouse.active = false; };

        const handleClick = (e: MouseEvent) => {
            shockwaves.push({ x: e.clientX, y: e.clientY, r: 10, maxR: 300, alpha: 0.8 });
            
            particles.forEach(p => {
                const dx = p.x - e.clientX;
                const dy = p.y - e.clientY;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                if (d < 400) {
                    const f = (400 - d) / 400 * 3 * p.depth;
                    p.vx += (dx / d) * f;
                    p.vy += (dy / d) * f;
                }
            });
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("click", handleClick);
        window.addEventListener("resize", handleResize);
        rafId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("click", handleClick);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0 opacity-75"
        />
    );
}
