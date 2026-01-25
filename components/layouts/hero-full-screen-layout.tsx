import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

export function HeroFullScreenLayout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col w-full bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary"
             style={{ height: "calc(100vh - var(--navbar-height))" }}
        >
            <main className="flex-1 h-full min-h-0 flex flex-col">
                {children}
            </main>
        </div>
    );
}