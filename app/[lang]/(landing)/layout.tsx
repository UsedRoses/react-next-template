import type { Metadata } from "next";
import "../../globals.css";
import React from 'react'
import { ThemeProvider } from "@/components/common/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import {LandingNavbar} from "@/app/[lang]/(landing)/components/navbar";
import {LandingFooter} from "@/app/[lang]/(landing)/components/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <SidebarConfigProvider>
        {/* Navigation */}
        <LandingNavbar />

        {children}

        {/* Footer */}
        <LandingFooter />

      </SidebarConfigProvider>
  );
}
