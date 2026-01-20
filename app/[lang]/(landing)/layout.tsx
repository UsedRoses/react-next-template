import "../../globals.css";
import React from 'react'
import {LandingNavbar} from "@/components/landing/navbar";
import {LandingFooter} from "@/components/landing/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <>
          <LandingNavbar />

          <main className="page-content will-change-[transform,opacity]">
              {children}
          </main>

          {/* Footer */}
          <LandingFooter />
      </>
  );
}
