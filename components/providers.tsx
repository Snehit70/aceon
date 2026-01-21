"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
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
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
