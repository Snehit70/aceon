import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error;
  reset?: () => void;
  minimal?: boolean;
}

export function ErrorDisplay({
  title = "SYSTEM FAILURE",
  message = "An unrecoverable error occurred.",
  error,
  reset,
  minimal = false,
}: ErrorDisplayProps) {
  if (minimal) {
    return (
      <div className="flex items-center gap-2 p-2 text-destructive border border-destructive/50 bg-black/90 backdrop-blur-sm rounded-none">
        <AlertTriangle className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-mono truncate max-w-[200px]" title={message}>
          {message}
        </span>
        {reset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive rounded-none ml-auto min-h-[44px] min-w-[44px]"
          >
            <RefreshCcw className="h-3 w-3" />
            <span className="sr-only">Retry</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-none border-2 border-destructive bg-[#0a0a0a]/95 backdrop-blur-md p-6 shadow-2xl shadow-destructive/10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(45deg,#E62E2D_0,#E62E2D_2px,transparent_0,transparent_12px)]" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20 bg-destructive rounded-full" />
          <AlertTriangle className="h-16 w-16 text-destructive animate-pulse" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-display font-black tracking-wider text-destructive uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            {title}
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-[90%] mx-auto">
            {message}
          </p>
          {error && process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 text-xs font-mono text-left overflow-auto max-h-32 w-full">
              <p className="text-red-400 font-bold mb-1">DEV ERROR DETAILS:</p>
              {error.message}
            </div>
          )}
        </div>

        {reset && (
          <Button
            onClick={reset}
            variant="outline"
            className="group relative overflow-hidden rounded-none border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all duration-300 min-w-[140px] min-h-[44px]"
          >
            <span className="relative z-10 flex items-center gap-2 font-display tracking-wide uppercase">
              <RefreshCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Reboot System
            </span>
          </Button>
        )}
      </div>

      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-destructive" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-destructive" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-destructive" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-destructive" />
    </div>
  );
}
