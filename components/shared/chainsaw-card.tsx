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
          
          <div className="p-4 border-b-2 border-border group-hover/card:border-primary/50 bg-secondary/5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-[10px] uppercase border-primary text-primary bg-primary/10 rounded-none px-1.5 py-0.5">
                {code}
              </Badge>
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>{level.replace(" Level", "")}</span>
                <span className="w-1.5 h-1.5 bg-primary/50" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display text-2xl font-bold leading-[0.85] uppercase tracking-wide text-foreground group-hover/card:text-white transition-colors">
                {cleanCourseTitle(title)}
              </h3>
              {subtitle && (
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-tight truncate">
                  // {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 flex-grow flex flex-col justify-between space-y-6 relative">
            
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />

            <div className="space-y-2 z-10">
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                <span className={cn(
                  "font-bold",
                  isCompleted ? "text-primary" : "text-muted-foreground"
                )}>
                  {isCompleted ? "Target_Eliminated" : isStarted ? "In_Progress" : "Not_Started"}
                </span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              
              <div className="h-3 w-full bg-secondary border border-border relative">
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-border group-hover/card:border-primary/30 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Lectures</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  {lectureCount}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {totalDuration}
                </div>
              </div>
            </div>
          </div>

          

        </div>
      </div>
    </Link>
  )
}
