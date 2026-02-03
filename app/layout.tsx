import type { Metadata } from "next";
import { Inter, Anton, Rubik_Glitch, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const rubikGlitch = Rubik_Glitch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-glitch",
});

export const metadata: Metadata = {
  title: "Aceon - Public Safety Bureau Edition",
  description: "The ultimate companion for lecture notes, GPA calculation, and course conquest.",
};

/**
 * RootLayout - Application root layout.
 * 
 * **Context**: Wraps all pages with global providers, fonts, and navigation.
 * 
 * **Integrations**:
 * - Google Fonts: Loads Inter (sans), JetBrains Mono (mono), Anton (display), Rubik Glitch (glitch).
 * - Providers: Wraps children with Convex, Clerk, and theme providers.
 * - Navbar: Persistent navigation header.
 * 
 * **Style**: Sets up CSS variables for fonts and applies dark theme by default.
 * 
 * @param props - Layout props.
 * @param props.children - Page content to render.
 * @returns HTML document structure with providers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased", 
        inter.variable, 
        jetbrainsMono.variable,
        anton.variable,
        rubikGlitch.variable
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
