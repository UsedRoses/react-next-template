import "../../globals.css";
import React from 'react'
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import {LandingNavbar} from "@/components/landing/navbar";
import {LandingFooter} from "@/components/landing/footer";
import {TransitionProvider} from "@/components/common/transition-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <SidebarConfigProvider>
          <TransitionProvider>

            {/* Navigation */}
            <LandingNavbar />

              <main className="page-content will-change-[transform,opacity]">
                {children}
              </main>

            {/* Footer */}
            <LandingFooter />

          </TransitionProvider>

      </SidebarConfigProvider>
  );
}
