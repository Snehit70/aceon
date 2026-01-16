"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, BookOpen, Trophy, GraduationCap, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center space-y-10 py-32 md:py-40 lg:py-48 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/30 rounded-full blur-[120px] opacity-30 dark:opacity-10" />
        </div>

        <div className="container px-4 md:px-6 flex flex-col items-center space-y-8 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm transition-colors hover:bg-primary/10 hover:border-primary/30">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Ace your IITM BS Degree
          </div>
          
          <h1 className="font-bold tracking-tighter text-6xl md:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm">
            Your Academic <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">Superpower</span>
          </h1>
          
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 font-medium">
            The all-in-one companion for IIT Madras BS students. 
            Track GPA, practice quizzes, and access resources in a unified, premium interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/50 transition-all hover:-translate-y-0.5">
              <Link href="/calculator">
                Try GPA Calculator
              </Link>
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-muted-foreground grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             {/* Social Proof / Trust Indicators can go here */}
             <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">100% Free</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Open Source</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Student Built</span>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 md:px-6 py-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">Everything you need to excel</h2>
          <p className="text-xl text-muted-foreground">
            Stop juggling multiple spreadsheets and drive folders. Aceon brings your entire academic life into one cohesive dashboard.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full">
              <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">GPA Calculator</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                Calculate your SGPA and CGPA with precision using the official grading system. Save your history to visualize your progress over terms.
              </p>
              <div className="mt-6 flex items-center text-primary font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Calculate Now <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full">
              <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Interactive Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                Test your mastery with subject-wise quizzes. Get instant feedback, explanations, and performance tracking to identify weak areas.
              </p>
               <div className="mt-6 flex items-center text-primary font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full">
              <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Study Resources</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                Access a curated library of lecture notes, previous year questions, and reference materials. Everything organized by course and week.
              </p>
               <div className="mt-6 flex items-center text-primary font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Browse Resources <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">Aceon</span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
          <p>© {new Date().getFullYear()} Aceon. Open Source.</p>
        </div>
      </footer>
    </div>
  );
}
