import * as React from "react"
import Link from "next/link"
import { Clock, BookOpen, ArrowRight, PlayCircle } from "lucide-react"

import { cn } from "@/lib/utils"
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
  level: string
  lectureCount: number
  totalDuration: string
  progress?: number
  href: string
  className?: string
}

export function CourseCard({
  code,
  term,
  title,
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
        <Card className="relative h-full overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-300 group-hover/card:border-white/10">
          
          {/* Top accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

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
            
            <CardTitle className="text-lg font-bold leading-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent group-hover/card:to-white transition-all duration-300 min-h-[3.5rem] flex items-start">
              {title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 flex-grow flex flex-col justify-end">
            {/* Progress Section */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  isCompleted ? "text-emerald-400" : "text-muted-foreground group-hover/card:text-primary"
                )}>
                  {isCompleted ? "Completed" : isStarted ? `${Math.round(progress)}% Complete` : "Not Started"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full",
                    isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-purple-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
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

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 ease-out">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>
    </Link>
  )
}
