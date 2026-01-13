"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  // In a real app, this would use the search query. For now, we fetch all and filter client side
  // or use the simple searchNotes query we defined.
  const notes = useQuery(api.notes.searchNotes, { query: search });

  return (
    <div className="container py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Study Resources</h1>
        <p className="text-muted-foreground">
          Find notes, PYQs, and textbooks for your subjects.
        </p>
        <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subjects or topics..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes === undefined ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : notes.length === 0 ? (
           <div className="col-span-full text-center py-10 text-muted-foreground">
             No notes found. Try searching for something else.
           </div>
        ) : (
          notes.map((note) => (
            <Card key={note._id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="truncate">{note.title}</span>
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                 <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                 >
                    View Document &rarr;
                 </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
