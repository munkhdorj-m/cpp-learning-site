import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { Nav } from "@/components/nav";
import { NavSkeleton } from "@/components/nav-skeleton";
import { GridBackground } from "@/components/grid-background";
import { Fab } from "@/components/fab";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import {
  CODE_THEME_COOKIE,
  DEFAULT_CODE_THEME,
  isCodeTheme,
} from "@/lib/shiki";

import "./globals.css";

// One typeface for the whole site. The design is a terminal, so prose and
// code are set in the same face — and IBM Plex Mono covers Cyrillic, which
// most monospace and every pixel face except Press Start 2P does not, and
// Mongolian is the default locale.
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return {
    title: t("name"),
    description: t("tagline"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  // The student's code theme, read server-side so <html> carries it in the
  // very first byte. Doing this on the client instead would paint one theme
  // and then swap it.
  const store = await cookies();
  const saved = store.get(CODE_THEME_COOKIE)?.value;
  const codeTheme = isCodeTheme(saved) ? saved : DEFAULT_CODE_THEME;

  return (
    <html
      lang={locale}
      className={mono.variable}
      data-code-theme={codeTheme}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background text-foreground font-mono">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* Suspend Nav so the shell renders instantly while Nav fetches session/profile.
                Falls back to a skeleton navbar immediately — no white flash on navigation. */}
            <Suspense fallback={<NavSkeleton />}>
              <Nav />
            </Suspense>
            <GridBackground />
            {/* An opaque slab. The ambient network is a backdrop, and it was
                showing straight through every panel and behind running text,
                which is exactly where it cannot be. It now frames the content
                rather than sitting under it. */}
            <main className="container mx-auto my-6 max-w-6xl border border-border bg-background px-4 py-8 sm:px-6">
              {children}
            </main>
            <Toaster richColors position="top-center" />
            <Fab />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
