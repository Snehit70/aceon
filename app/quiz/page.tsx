"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizListPage() {
  const quizzes = useQuery(api.quizzes.list);

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes & Assessments</h1>
        <p className="text-muted-foreground">
          Test your knowledge with our curated quizzes.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes === undefined ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : quizzes.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No quizzes available yet.</p>
            <p>Check back later for new assessments.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={
                      quiz.difficulty === "hard" ? "destructive" :
                      quiz.difficulty === "medium" ? "default" : "secondary"
                    }
                  >
                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                  </Badge>
                  {/* We would fetch subject name here in a real app */}
                </div>
                <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.totalQuestions} Questions</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/quiz/${quiz._id}`}>Start Quiz</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
