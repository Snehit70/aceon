"use client";

import { cn } from "@/lib/utils";

export default function MakimaCalibrationPage() {
  // Generate percentages from 0% to 100% in 5% increments
  const percentages = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8 text-[#E62E2D] uppercase tracking-widest border-b border-[#E62E2D] pb-4">
        Makima // Eyes // Calibration
      </h1>
      
      <div className="space-y-8">
        {percentages.map((pct) => (
          <div key={pct} className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400 uppercase tracking-widest">
              <span>Position: {pct}%</span>
              <span>Height: 64px (Navbar)</span>
            </div>
            
            {/* Simulation of the Navbar container */}
            <div className="relative w-full h-16 border-2 border-[#E62E2D] bg-black overflow-hidden">
              {/* The Background Image Layer */}
              <div 
                className="absolute inset-0 bg-cover opacity-100"
                style={{ 
                  backgroundImage: "url('/images/texture-navbar.jpg')",
                  backgroundPosition: `center ${pct}%` 
                }} 
              />
              
              {/* Overlay (same as Navbar) */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Reference Marker (Center) */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
