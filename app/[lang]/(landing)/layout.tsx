import type { Metadata } from "next";
import "../../globals.css";
import React from 'react'
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";
import {LandingNavbar} from "@/app/[lang]/(landing)/components/navbar";
import {LandingFooter} from "@/app/[lang]/(landing)/components/footer";

export const metadata: Metadata = {
  title: "Shadcn Dashboard",
  description: "A dashboard built with Next.js and shadcn/ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>
            {/* Navigation */}
            <LandingNavbar />

            {children}

            {/* Footer */}
            <LandingFooter />

          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
