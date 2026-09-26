'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulsePhase: number;
  type: 'extinguisher' | 'hydrant' | 'panel' | 'sensor' | 'node';
  alpha: number;
}

export function CanvasHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let particles: Particle[] = [];

    const types: Particle['type'][] = ['extinguisher', 'hydrant', 'panel', 'sensor', 'node'];

    const initParticles = () => {
      particles = [];
      // Adjust density based on screen width
      const count = Math.floor((width * height) / 14000);
      const safeCount = Math.max(35, Math.min(count, 70));

      for (let i = 0; i < safeCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const baseRadius = type === 'panel' ? 4.5 : type === 'node' ? 2.5 : 3.5;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: baseRadius,
          baseRadius,
          pulsePhase: Math.random() * Math.PI * 2,
          type,
          alpha: 0.35 + Math.random() * 0.5,
        });
      }
    };

    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background gradient on canvas
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, 'rgba(240, 249, 255, 0.7)');
      bgGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      bgGrad.addColorStop(1, 'rgba(224, 242, 254, 0.6)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Connect nodes
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 119, 182, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw connection to mouse cursor
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          const mAlpha = (1 - mdist / mouse.radius) * 0.55;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(2, 62, 138, ${mAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Gentle pull toward mouse
          p.x += (mdx / mdist) * 0.4;
          p.y += (mdy / mdist) * 0.4;
        }

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundary
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Pulse phase
        p.pulsePhase += 0.035;
        const pulse = Math.sin(p.pulsePhase) * 1.2;
        p.radius = Math.max(1.5, p.baseRadius + pulse * 0.4);

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.type === 'panel') {
          ctx.fillStyle = `rgba(2, 62, 138, ${p.alpha})`; // Dark Navy
        } else if (p.type === 'extinguisher') {
          ctx.fillStyle = `rgba(0, 119, 182, ${p.alpha})`; // Ocean Blue
        } else if (p.type === 'hydrant') {
          ctx.fillStyle = `rgba(0, 150, 199, ${p.alpha})`; // Cyan Accent
        } else {
          ctx.fillStyle = `rgba(72, 202, 228, ${p.alpha})`;
        }
        ctx.fill();

        // Pulsing radio ring on select nodes (e.g. fire alarm panels)
        if (p.type === 'panel' || p.type === 'extinguisher') {
          const ringRadius = p.radius + 6 + (Math.sin(p.pulsePhase) + 1) * 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 119, 182, ${0.18 * (1 - ringRadius / 20)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}
