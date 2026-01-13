"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const history = useQuery(api.calculator.getHistory);
  const quizStats = useQuery(api.quizzes.getUserStats);

  if (!isLoaded) return <div className="container py-10">Loading...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  return (
    <div className="container py-10 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
          <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GPA History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            {history === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calculations saved yet.</p>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{entry.term}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{entry.sgpa.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Quiz Performance</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {quizStats === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : quizStats === null || quizStats.totalAttempts === 0 ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <Target className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">No quizzes taken yet</p>
                  <p className="text-sm text-muted-foreground">Start practicing to track your progress.</p>
                </div>
                <Button variant="outline" asChild size="sm">
                  <Link href="/quiz">Take a Quiz</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{quizStats.averageScore.toFixed(0)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>
                    <p className="text-2xl font-bold">{quizStats.totalAttempts}</p>
                  </div>
                </div>

                {quizStats.recentAttempts && quizStats.recentAttempts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Recent Activity</p>
                    <div className="space-y-2">
                      {quizStats.recentAttempts.map((attempt) => (
                        <div key={attempt._id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                             <Clock className="h-3 w-3 text-muted-foreground" />
                             <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={
                            attempt.score >= 80 ? "text-green-600 font-medium" :
                            attempt.score >= 50 ? "text-yellow-600 font-medium" :
                            "text-red-600 font-medium"
                          }>
                            {attempt.score.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" asChild className="w-full">
                  <Link href="/quiz">
                    Continue Practicing <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
