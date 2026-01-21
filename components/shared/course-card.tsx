import * as React from "react"
import Link from "next/link"
import { Clock, BookOpen, ArrowRight } from "lucide-react"

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
}: CourseCardProps) {
  const isStarted = progress > 0
  const isCompleted = progress >= 100
  
  return (
    <Link href={href} className="block group/card outline-none">
      <Card className="h-[260px] transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
        <CardHeader className="space-y-3 pb-2 flex-none">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono text-[10px] h-5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors rounded-sm">
                {code}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] h-5 text-muted-foreground/80 hover:bg-muted/50 transition-colors rounded-sm">
                {term}
              </Badge>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
              {level.replace(" Level", "")}
            </span>
          </div>
          
          <CardTitle className="text-base font-bold leading-tight group-hover/card:text-primary transition-colors line-clamp-2 min-h-[2.5rem] flex items-center">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pb-3 flex-grow flex flex-col justify-end">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-medium transition-colors",
                isCompleted ? "text-primary" : "text-muted-foreground group-hover/card:text-foreground"
              )}>
                {isCompleted ? "Completed" : isStarted ? `${Math.round(progress)}% Complete` : "Not Started"}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-1.5 bg-muted/80 [&>[data-slot=progress-indicator]]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>{lectureCount} lectures</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>{totalDuration}</span>
            </div>
          </div>
        </CardContent>

        <div className="relative overflow-hidden h-9 flex items-center justify-center border-t border-border/50 bg-muted/20 group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-colors duration-300">
           <span className="font-medium text-xs flex items-center gap-2">
             {isStarted ? "Continue" : isCompleted ? "Review" : "Start Learning"} <ArrowRight className="size-3.5" />
           </span>
        </div>
      </Card>
    </Link>
  )
}
