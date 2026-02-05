"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Particles - Animated background particle effect.
 * 
 * **Context**: Visual background effect for the landing page hero section.
 * Creates floating geometric shapes (triangles, squares) and "embers" (red dots)
 * that drift upward to create atmosphere.
 * 
 * **Implementation**:
 * - Uses Framer Motion for smooth animations.
 * - Generates 20 random geometric particles and 5 ember particles.
 * - Only renders on client-side to avoid hydration mismatches with random values.
 * 
 * @returns A full-screen particle animation layer.
 */
export const Particles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    yTo: number;
    scaleTo: number;
    rotateTo: number;
    duration: number;
    delay: number;
    size: number;
  }>>([]);

  const [embers, setEmbers] = useState<Array<{
    id: number;
    x: number;
    xOffset: number;
    duration: number;
    delay: number;
    size: number;
  }>>([]);
  
  // Only run on client to avoid hydration mismatch with random values
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles([...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      yTo: Math.random() * -100,
      scaleTo: Math.random() * 2 + 0.5,
      rotateTo: Math.random() * 360,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      size: Math.random() * 10 + 2,
    })));

    setEmbers([...Array(5)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      xOffset: (Math.random() - 0.5) * 20,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      size: Math.random() * 4 + 2,
    })));
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/10"
          initial={{
            x: p.x + "vw",
            y: p.y + "vh",
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [null, p.yTo + "vh"],
            opacity: [0, 0.8, 0],
            scale: [0, p.scaleTo, 0],
            rotate: [0, p.rotateTo],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
          style={{
            width: p.size + "px",
            height: p.size + "px",
            clipPath: i % 2 === 0 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Triangles and squares
          }}
        />
      ))}
      {embers.map((e) => (
        <motion.div
          key={`ember-${e.id}`}
          className="absolute bg-[#E62E2D]/40"
          initial={{
            x: e.x + "vw",
            y: 110 + "vh",
            opacity: 0,
          }}
          animate={{
            y: -10 + "vh",
            x: e.xOffset + "vw",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: e.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: e.delay,
          }}
          style={{
            width: e.size + "px",
            height: e.size + "px",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};
