import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Rubik,
  Press_Start_2P,
  Handjet,
  JetBrains_Mono,
} from "next/font/google";
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

// Four faces, each doing one job.
//
// The subset list is not boilerplate. Mongolian Cyrillic needs Ө ө Ү ү, and
// those four codepoints (U+04E8/9, U+04AE/F) sit in `cyrillic-ext`, NOT in
// `cyrillic` — which only reaches U+045F plus a handful of strays. A face
// asked for `cyrillic` alone will therefore render most of a Mongolian word
// and drop out to a system font on exactly those two letters, mid-word.
//
// Listing `cyrillic-ext` also makes Next PRELOAD that file. Without it the
// subset is fetched lazily on first use, so the two letters visibly flash in
// a fallback face on first paint.
//
// Every face below was measured in the browser for real Ө/Ү glyphs, not
// trusted from its subset list — Google serves a cyrillic-ext file for some
// families that does not actually contain them. Rejected on that evidence:
// Onest and Pixelify Sans (declare the range, render a fallback), Silkscreen
// and VT323 (no Cyrillic at all), Anonymous Pro and Ruda (no Ө/Ү).
//
// The subset list is repeated rather than hoisted into a shared constant on
// purpose: next/font reads these arguments at build time and only accepts
// literals, so a spread or a variable is a compile error.

/** Running text. Never the pixel face — that is what made the last one a wall. */
const body = Rubik({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Headings, labels and buttons. Roughly twice as wide as a normal face. */
const display = Press_Start_2P({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400"],
  display: "swap",
});

/** Sub-headings — pixel flavour without pixel density. */
const softPixel = Handjet({
  variable: "--font-soft-pixel",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "700"],
  display: "swap",
});

/** Code. Shiki paints the colours; this draws the shapes. */
const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "700"],
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
      className={`${body.variable} ${display.variable} ${softPixel.variable} ${code.variable}`}
      data-code-theme={codeTheme}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
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
            {/* No slab. This used to be an opaque bordered box, which solved
                the "text over a moving network" problem by hiding the network
                on every page — including the hub pages, which are built out of
                cards and never needed protecting. The network is the backdrop
                of the site and should be seen.

                Reading pages still need calm, but they get it by turning the
                network DOWN rather than covering it up — app/(app)/learn and
                /cambridge mark themselves .reading-page and globals.css dims
                the ambient layer behind them. Everywhere else the cards supply
                their own opaque background and the network shows between. */}
            <main className="mx-auto my-6 w-full max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
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
