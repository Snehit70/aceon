"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider - Wrapper for next-themes theme management.
 * 
 * **Context**: Thin wrapper around next-themes that provides dark/light mode
 * switching capabilities to the application. Used within the Providers hierarchy.
 * 
 * **Integrations**:
 * - next-themes: Handles theme persistence, system preference detection, and class toggling.
 * 
 * **Usage**: Typically configured with `attribute="class"` and `defaultTheme="system"`
 * to respect user's OS preference.
 * 
 * @param props - Props passed through to NextThemesProvider.
 * @param props.children - Content to wrap with theme context.
 * @returns Theme-aware application content.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
