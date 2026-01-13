"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, BookOpen, Trophy, GraduationCap } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40 bg-gradient-to-b from-background to-muted/30">
        <div className="container flex flex-col items-center space-y-6">
          <div className="rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
            🚀 Ace your semester with Aceon
          </div>
          <h1 className="font-bold tracking-tighter text-5xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Your Academic <br className="hidden sm:inline" />
            Companion
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Track your GPA, practice with quizzes, and access study resources.
            Everything you need to excel in your engineering journey.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/calculator">
                Try GPA Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything in One Place</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop juggling multiple spreadsheets and drive folders. Aceon brings your academic life together.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">GPA Calculator</h3>
            <p className="text-muted-foreground">
              Calculate your SGPA and CGPA accurately. Save your history to track progress over semesters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interactive Quizzes</h3>
            <p className="text-muted-foreground">
              Test your knowledge with subject-wise quizzes. Instant feedback and performance tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Study Resources</h3>
            <p className="text-muted-foreground">
              Access lecture notes, previous year questions, and reference materials for all your subjects.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold text-foreground">Aceon</span>
          </div>
          <p>© 2024 Aceon. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
