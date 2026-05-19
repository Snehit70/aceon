import * as React from "react"
import Link from "next/link"
import { Clock, BookOpen } from "lucide-react"

import { cn, cleanCourseTitle } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface ChainsawCardProps {
  id: string
  code: string
  title: string
  subtitle?: string
  level: string
  lectureCount: number
  totalDuration: string
  progress?: number
  href: string
  className?: string
}

/**
 * ChainsawCard - A brutalist, themed card for the "Chainsaw Man" aesthetic.
 * 
 * **Context**: The primary card component for the main lectures dashboard.
 * Designed to look like a "mission dossier" or tactical display.
 * 
 * **Style**: 
 * - Hard edges (no rounded corners).
 * - "Clip-corner" effect (CSS clip-path).
 * - Hover effects: Translate/Slide animation with neon drop shadows.
 * - Typography: Aggressive uppercase display fonts.
 * 
 * **User Flow**:
 * - Displays "Target_Eliminated" for completed courses.
 * - Displays "In_Progress" for active ones.
 * - Hovering triggers a "pop-out" 3D effect.
 * 
 * @param props - Component props.
 * @returns A highly styled, interactive course card.
 */
export function ChainsawCard({
  code,
  title,
  subtitle,
  level,
  lectureCount,
  totalDuration,
  progress = 0,
  href,
  className,
}: ChainsawCardProps) {
  const isStarted = progress > 0
  const isCompleted = progress >= 100
  
  return (
    <Link href={href} className={cn("block group/card outline-none h-full", className)}>
      <div className="relative h-full transition-all duration-200 group-hover/card:translate-x-[-4px] group-hover/card:translate-y-[-4px]">
        <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 clip-corner opacity-0 group-hover/card:opacity-100 transition-opacity duration-200" />
        
        <div className="relative h-full bg-black border-2 border-border group-hover/card:border-primary flex flex-col clip-corner transition-colors duration-200 overflow-hidden">
          
          <div className="p-1.5 sm:p-4 border-b-2 border-border group-hover/card:border-primary/50 bg-secondary/5 space-y-1 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-[8px] sm:text-[10px] uppercase border-primary text-primary bg-primary/10 rounded-none px-1 py-0.5 sm:px-1.5">
                {code}
              </Badge>
              <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wide sm:tracking-widest">
                <span className="truncate max-w-[64px] sm:max-w-none">{level.replace(" Level", "")}</span>
                <span className="w-1.5 h-1.5 bg-primary/50" />
              </div>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1">
              <h3 className="font-display text-lg sm:text-2xl font-bold leading-[0.88] sm:leading-[0.85] uppercase tracking-wide text-foreground group-hover/card:text-white transition-colors line-clamp-2 sm:line-clamp-none">
                {cleanCourseTitle(title)}
              </h3>
              {subtitle && (
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-tight truncate">
                  {"// "}{subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="p-1.5 sm:p-4 flex-grow flex flex-col justify-between space-y-2 sm:space-y-6 relative">
            
            <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />

            <div className="space-y-1 sm:space-y-2 z-10">
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-xs uppercase tracking-wide sm:tracking-wider">
                <span className={cn(
                  "font-bold truncate pr-1",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                  {isCompleted ? "Done" : isStarted ? "In_Prog" : "New"}
                </span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              
              <div className="h-1.5 sm:h-3 w-full bg-secondary border border-border relative">
                <div 
                  className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? "bg-primary" : "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.5)_25%,rgba(0,0,0,0.5)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.5)_75%,rgba(0,0,0,0.5)_100%)] bg-[length:10px_10px] opacity-20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1.5 sm:pt-4 border-t border-dashed border-border group-hover/card:border-primary/30 z-10">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide sm:tracking-wider">Lec</span>
                <div className="flex items-center gap-1 font-mono text-[15px] sm:text-sm font-bold leading-none">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                  {lectureCount}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wide sm:tracking-wider">Dur</span>
                <div className="flex items-center gap-1 font-mono text-[13px] sm:text-sm font-bold leading-none">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                  <span className="truncate">{totalDuration}</span>
                </div>
              </div>
            </div>
          </div>

          

        </div>
      </div>
    </Link>
  )
}
