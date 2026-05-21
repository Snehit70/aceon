"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";
import { AlertTriangle, CheckCircle, Info, AlertOctagon } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dark } from "@clerk/themes";
import useMediaQuery from "@/hooks/use-media-query";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Providers - Application-wide context providers wrapper.
 * 
 * **Context**: Wraps the entire app with necessary providers for auth, data, theming,
 * and UI components. This is the root provider component used in layout.tsx.
 * 
 * **Integrations**:
 * - Clerk: Authentication provider with custom dark theme styling.
 * - Convex: Real-time data sync with Clerk auth integration.
 * - ThemeProvider: Dark/light mode management via next-themes.
 * - TooltipProvider: Global tooltip context for UI components.
 * - Toaster: Toast notification system via sonner.
 * 
 * **Provider Hierarchy** (outer to inner):
 * ClerkProvider → ConvexProviderWithClerk → ThemeProvider → TooltipProvider → Toaster
 * 
 * @param props - Component props.
 * @param props.children - App content to wrap with providers.
 * @returns Provider-wrapped application.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: { 
          colorPrimary: "#14b8a6", // Teal-500
          colorBackground: "#09090b", // Zinc-950
          colorText: "#fafafa", // Zinc-50
          colorInputBackground: "#18181b", // Zinc-900
          colorInputText: "#fafafa",
          borderRadius: "0px",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          card: "bg-card border border-border shadow-xl rounded-none",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "bg-muted text-foreground border border-border hover:bg-muted/80 rounded-none",
          formFieldInput: "bg-input border-border text-foreground rounded-none focus:border-primary",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-none shadow-none",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster 
              position={isMobile ? "bottom-center" : "bottom-right"}
              theme="dark"
              closeButton
              duration={5000}
              mobileOffset={{
                bottom: "calc(env(safe-area-inset-bottom) + 72px)",
                left: "12px",
                right: "12px",
              }}
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast: "group flex items-start gap-3 w-full p-4 bg-[#0a0a0a]/95 backdrop-blur-md border-2 border-destructive/50 shadow-[4px_4px_0px_0px_rgba(230,46,45,0.3)]",
                  title: "text-sm font-display font-bold tracking-wide uppercase text-foreground",
                  description: "text-xs font-mono text-muted-foreground mt-1",
                  actionButton: "bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-destructive/90 transition-colors",
                  cancelButton: "bg-muted text-muted-foreground px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors",
                  closeButton: "!relative !top-0 !right-0 !left-auto !transform-none !bg-transparent !border-0 !p-1 !text-muted-foreground !hover:text-destructive !transition-colors [&>svg]:!h-4 [&>svg]:!w-4",
                  error: "!border-destructive !shadow-[4px_4px_0px_0px_rgba(230,46,45,0.5)]",
                  success: "!border-[#2BFF00]/50 !shadow-[4px_4px_0px_0px_rgba(43,255,0,0.3)]",
                  warning: "!border-yellow-500/50 !shadow-[4px_4px_0px_0px_rgba(234,179,8,0.3)]",
                  info: "!border-blue-500/50 !shadow-[4px_4px_0px_0px_rgba(59,130,246,0.3)]",
                },
              }}
              icons={{
                error: <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />,
                success: <CheckCircle className="h-5 w-5 text-[#2BFF00] shrink-0" />,
                warning: <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />,
                info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
