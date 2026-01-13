"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Timer, ArrowRight, Loader2, Trophy } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as Id<"quizzes">;

  const quiz = useQuery(api.quizzes.get, { id: quizId });
  const questions = useQuery(api.quizzes.getQuestions, { quizId });
  const submitAttempt = useMutation(api.quizzes.submitAttempt);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; correct: number } | null>(null);

  if (quiz === undefined || questions === undefined) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quiz === null || questions.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
        <p className="text-muted-foreground mb-8">This quiz doesn't exist or has no questions.</p>
        <Button onClick={() => router.push("/quiz")}>Back to Quizzes</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleOptionSelect = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Fill in any skipped questions with -1 (invalid option)
    const finalAnswers = Array.from({ length: questions.length }, (_, i) => answers[i] ?? -1);

    setIsSubmitting(true);
    try {
      const resultData = await submitAttempt({
        quizId,
        answers: finalAnswers,
      });
      setResult({
        score: resultData.score,
        total: resultData.total,
        correct: resultData.correct,
      });
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="container py-10 max-w-2xl">
        <Card className="text-center py-10">
          <CardContent className="space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <TrophyIcon score={result.score} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Quiz Completed!</h1>
              <p className="text-muted-foreground">
                You scored <span className="font-bold text-foreground">{result.score.toFixed(0)}%</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">{result.correct}</div>
                <div className="text-xs text-muted-foreground">Correct Answers</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
            </div>

            <Button onClick={() => router.push("/quiz")} size="lg">
              Find More Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="flex items-center gap-1">
             <Timer className="h-4 w-4" />
             <span>{quiz.durationMinutes} min</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestionIndex]?.toString()}
            onValueChange={handleOptionSelect}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-accent">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === undefined || isSubmitting}
            size="lg"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : "Submit Quiz"
            ) : (
              <>
                Next Question <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function TrophyIcon({ score }: { score: number }) {
  if (score >= 80) return <CheckCircle2 className="h-12 w-12 text-green-600" />;
  if (score >= 50) return <Trophy className="h-12 w-12 text-yellow-500" />;
  return <AlertCircle className="h-12 w-12 text-red-500" />;
}
