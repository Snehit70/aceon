import * as React from "react"
import Link from "next/link"
import { Clock, BookOpen, ArrowRight, PlayCircle } from "lucide-react"

import { cn, cleanCourseTitle } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export interface CourseCardProps {
  id: string
  code: string
  term: string
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
 * CourseCard - A glassmorphic card for displaying course summary.
 * 
 * **Context**: Used in lists where a "cleaner" aesthetic is desired (e.g., standard course grids).
 * Shows metadata like code, level, duration, and progress.
 * 
 * **Style**: Uses glassmorphism (backdrop-blur) and gradients. 
 * This is the alternative to the more brutalist `ChainsawCard`.
 * 
 * @param props - Component props.
 * @returns A Link wrapping a styled Card component.
 */
export function CourseCard({
  code,
  term,
  title,
  subtitle,
  level,
  lectureCount,
  totalDuration,
  progress = 0,
  href,
  className,
}: CourseCardProps) {
  const isStarted = progress > 0
  const isCompleted = progress >= 100
  
  return (
    <Link href={href} className={cn("block group/card outline-none h-full", className)}>
      <div className="relative h-full transition-all duration-500 hover:translate-y-[-4px]">
        <Card className="relative h-full overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-300 group-hover/card:border-white/10 ring-1 ring-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
          
          {/* Top accent bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-100 transition-opacity duration-500" />

          <CardHeader className="space-y-4 pb-2 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="font-mono text-[10px] h-5 border-white/10 bg-white/5 text-muted-foreground group-hover/card:text-primary group-hover/card:border-primary/30 transition-colors">
                  {code}
                </Badge>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground/70 border border-white/5">
                {level.replace(" Level", "")}
              </span>
            </div>
            
            <CardTitle className="text-lg font-bold leading-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent group-hover/card:to-white transition-all duration-300 flex flex-col gap-1">
              <span>{cleanCourseTitle(title)}</span>
              {subtitle && (
                <span className="text-sm font-normal text-muted-foreground/70 bg-gradient-to-br from-white/70 to-white/40 bg-clip-text">
                  {subtitle}
                </span>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 flex-grow flex flex-col justify-end">
            {/* Progress Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <div className={cn(
                  "px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-200",
                  isCompleted 
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                    : isStarted 
                    ? "bg-primary/20 border border-primary/30 text-primary" 
                    : "bg-white/10 border border-white/20 text-muted-foreground"
                )}>
                  <span className="font-medium">
                    {isCompleted ? "Completed" : isStarted ? `${Math.round(progress)}% Complete` : "Not Started"}
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full relative",
                    isCompleted 
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      : "bg-gradient-to-r from-primary via-primary/90 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  )}
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground/60 pt-4 border-t border-white/5 group-hover/card:text-muted-foreground transition-colors">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lectureCount} lectures</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{totalDuration}</span>
              </div>
            </div>
          </CardContent>

          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 ease-out">
            <div className="relative overflow-hidden rounded-b-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-purple-600 opacity-90" />
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
              
              <div className="relative px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-white tracking-wide">
                  Continue Learning
                </span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Link>
  )
}
