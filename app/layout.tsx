import type { Metadata } from "next";
import { JetBrains_Mono, Oswald, Anton, Rubik_Glitch } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-sans",
});

const jetbrainsMonoMono = JetBrains_Mono({ 
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
  title: "Aceon - Ace Your IITM BS Degree",
  description: "The ultimate companion for notes, GPA calculation, and exam prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased", 
        jetbrainsMono.variable, 
        jetbrainsMonoMono.variable,
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
