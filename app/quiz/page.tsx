"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizListPage() {
  const quizzes = useQuery(api.quizzes.list);

  return (
    <div className="container py-12 max-w-6xl animate-in fade-in duration-500">
      <div className="mb-10 space-y-4 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Quizzes & Assessments</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Challenge yourself with our curated question banks. Track your performance and identify areas for improvement.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes === undefined ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[280px]">
              <CardHeader className="gap-3">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : quizzes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
            <div className="bg-primary/10 p-6 rounded-full mb-6 animate-pulse">
                <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">No quizzes available yet</h3>
            <p className="text-muted-foreground max-w-md mt-2">
                We&apos;re currently preparing high-quality assessments for your courses. Check back soon!
            </p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz._id} className="group flex flex-col h-full border-border/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 overflow-hidden">
              <CardHeader className="pb-3 relative">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="h-24 w-24 -rotate-12" />
                 </div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <Badge
                    className="shadow-sm"
                    variant={
                      quiz.difficulty === "hard" ? "destructive" :
                      quiz.difficulty === "medium" ? "default" : "secondary"
                    }
                  >
                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                  </Badge>
                  {/* Subject badge could go here */}
                </div>
                <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors relative z-10">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem] relative z-10">
                  {quiz.description || "Test your knowledge on this topic."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary/70" />
                    <span>{quiz.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary/70" />
                    <span>{quiz.totalQuestions} Qs</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                  <Link href={`/quiz/${quiz._id}`}>
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
