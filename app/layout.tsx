import type { Metadata } from "next";
import { Suspense } from "react";
import { Rubik, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { Nav } from "@/components/nav";
import { NavSkeleton } from "@/components/nav-skeleton";
import { BackgroundBlob } from "@/components/background-blob";
import { Fab } from "@/components/fab";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const sans = Rubik({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
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

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Suspend Nav so the shell renders instantly while Nav fetches session/profile.
                Falls back to a skeleton navbar immediately — no white flash on navigation. */}
            <Suspense fallback={<NavSkeleton />}>
              <Nav />
            </Suspense>
            <BackgroundBlob />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Toaster richColors position="top-center" />
            <Fab />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
