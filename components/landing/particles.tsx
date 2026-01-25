"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Particles = () => {
  const [mounted, setMounted] = useState(false);
  
  // Only run on client to avoid hydration mismatch with random values
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10"
          initial={{
            x: Math.random() * 100 + "vw",
            y: Math.random() * 100 + "vh",
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [null, Math.random() * -100 + "vh"],
            opacity: [0, 0.8, 0],
            scale: [0, Math.random() * 2 + 0.5, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{
            width: Math.random() * 10 + 2 + "px",
            height: Math.random() * 10 + 2 + "px",
            clipPath: i % 2 === 0 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Triangles and squares
          }}
        />
      ))}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute bg-[#E62E2D]/40"
          initial={{
            x: Math.random() * 100 + "vw",
            y: 110 + "vh",
            opacity: 0,
          }}
          animate={{
            y: -10 + "vh",
            x: (Math.random() - 0.5) * 20 + "vw",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 5,
          }}
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};
