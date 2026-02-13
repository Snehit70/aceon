import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost, Home, Search } from "lucide-react";

/**
 * NotFound - Custom 404 Page
 *
 * **Context**: Shown when a user navigates to a non-existent route.
 * **Design**: Chainsaw Man themed "Contract Not Found" message.
 */
export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 p-4 text-center">
      <div className="relative">
        {/* Animated background pulse */}
        <div className="absolute inset-0 animate-ping opacity-10 bg-destructive rounded-full" />
        <Ghost className="h-24 w-24 text-destructive animate-pulse" strokeWidth={1} />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-4xl font-display font-black tracking-wider text-destructive uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
          CONTRACT VOID
        </h2>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          The requested resource could not be located in the archives.
          <br />
          It may have been deleted by the Public Safety Division.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button
          asChild
          variant="outline"
          className="flex-1 rounded-none border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive group"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            RETURN HQ
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="flex-1 rounded-none bg-secondary/80 hover:bg-secondary text-secondary-foreground group"
        >
          <Link href="/lectures">
            <Search className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            ARCHIVES
          </Link>
        </Button>
      </div>

      {/* Decorative corners */}
      <div className="fixed inset-4 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-destructive" />
        <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-destructive" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-destructive" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-destructive" />
      </div>
    </div>
  );
}
