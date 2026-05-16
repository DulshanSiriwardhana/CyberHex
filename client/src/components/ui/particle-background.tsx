/**
 * CyberHex v3.0 — Particle Background System
 *
 * GPU-accelerated canvas particle animation that renders floating
 * particles with theme-aware colors, dynamic connections, and
 * parallax mouse interaction. Uses requestAnimationFrame for
 * smooth 60fps rendering with adaptive quality based on device.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/lib/design-tokens';

// ──── Configuration ──────────────────────────────────────────────
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 140;
const PARTICLE_SPEED = 0.3;
const PARTICLE_RADIUS = 1.5;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 0.05;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

// ──── Component ──────────────────────────────────────────────────
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const variant = useThemeStore((s) => s.variant);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        radius: Math.random() * PARTICLE_RADIUS + 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Reduce quality on low-end devices
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? PARTICLE_COUNT / 2 : PARTICLE_COUNT;

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for perf
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        initParticles(width, height);
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    function handleMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('mousemove', handleMouse);

    // Get theme accent color
    const colors = THEME_REGISTRY[variant]?.colors || THEME_REGISTRY.cyber.colors;
    const accentColor = colors.accent.primary;
    const bgColor = colors.bg.root;

    // Parse hex to RGB
    function hexToRgb(hex: string): [number, number, number] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 240, 255];
    }

    const [r, g, b] = hexToRgb(accentColor);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * MOUSE_FORCE;
          p.vy += (dy / dist) * force * MOUSE_FORCE;
          // Dampen speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.5) {
            p.vx = (p.vx / speed) * 1.5;
            p.vy = (p.vy / speed) * 1.5;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < CONNECTION_DISTANCE) {
            const alpha = (1 - cdist / CONNECTION_DISTANCE) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [variant, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default ParticleBackground;