import type { Metadata } from "next";
import { Inter, Oswald, Anton, Rubik_Glitch, JetBrains_Mono } from "next/font/google";
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
