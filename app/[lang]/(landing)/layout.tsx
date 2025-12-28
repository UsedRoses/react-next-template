import "../../globals.css";
import React from 'react'
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import {LandingNavbar} from "@/app/[lang]/(landing)/components/navbar";
import {LandingFooter} from "@/app/[lang]/(landing)/components/footer";
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
