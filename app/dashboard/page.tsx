"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const history = useQuery(api.calculator.getHistory);

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

        {/* Placeholder for Quiz Stats */}
        <Card className="opacity-60">
            <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Coming Soon...</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
