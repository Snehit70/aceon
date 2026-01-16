"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Clock, ArrowRight, GraduationCap, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const history = useQuery(api.calculator.getHistory);
  const quizStats = useQuery(api.quizzes.getUserStats);

  if (!isLoaded) return <div className="container py-10 flex justify-center"><Skeleton className="h-[600px] w-full max-w-4xl" /></div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  return (
    <div className="container py-12 max-w-5xl space-y-10 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card border border-border/60 p-8 rounded-3xl shadow-sm">
        <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110" />
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl relative z-10">
            <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{user.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
        </div>
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
          <p className="text-muted-foreground font-medium">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                Student
            </span>
             <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                IITM BS Degree
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* GPA History */}
        <Card className="rounded-3xl border-border/60 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Academic History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            {history === undefined ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                 <div className="p-3 bg-muted rounded-full">
                    <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
                 </div>
                <p className="text-sm font-medium text-muted-foreground">No calculations saved yet.</p>
                <Button variant="link" asChild className="text-primary">
                    <Link href="/calculator">Go to Calculator</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-110 transition-transform">
                            {entry.term.substring(0, 3)}
                        </div>
                        <div>
                        <p className="font-semibold text-sm">{entry.term}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        </div>
                    </div>
                    <div className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tabular-nums">
                        {entry.sgpa.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Stats */}
        <Card className="rounded-3xl border-border/60 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Quiz Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            {quizStats === undefined ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-24 w-1/2 rounded-xl" />
                    <Skeleton className="h-24 w-1/2 rounded-xl" />
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : quizStats === null || quizStats.totalAttempts === 0 ? (
              <div className="text-center py-10 space-y-5">
                <div className="flex justify-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      <Target className="h-16 w-16 text-muted-foreground/40 relative z-10" />
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">No quizzes taken</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">Start practicing to track your progress and improve your grades.</p>
                </div>
                <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
                  <Link href="/quiz">Take a Quiz</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Avg Score</p>
                    <p className="text-3xl font-black text-primary">{quizStats.averageScore.toFixed(0)}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-secondary flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Attempts</p>
                    <p className="text-3xl font-black text-foreground">{quizStats.totalAttempts}</p>
                  </div>
                </div>

                {quizStats.recentAttempts && quizStats.recentAttempts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground px-1">Recent Activity</p>
                    <div className="space-y-2">
                      {quizStats.recentAttempts.map((attempt) => (
                        <div key={attempt._id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/20 border border-border/50">
                          <div className="flex items-center gap-2">
                             <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                             <span className="font-medium text-muted-foreground">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={
                            attempt.score >= 80 ? "text-green-600 font-bold bg-green-500/10 px-2 py-0.5 rounded" :
                            attempt.score >= 50 ? "text-yellow-600 font-bold bg-yellow-500/10 px-2 py-0.5 rounded" :
                            "text-red-600 font-bold bg-red-500/10 px-2 py-0.5 rounded"
                          }>
                            {attempt.score.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" asChild className="w-full rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
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
