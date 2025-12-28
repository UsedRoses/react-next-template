"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// 导出 Context 供 Link 组件使用
export const TransitionContext = createContext<{
    navigateWithAnimation: (href: string) => void;
} | null>(null);

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

    // --- 1. 进场动画 (每当路径改变时执行) ---
    useGSAP(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.fromTo(".page-content",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", force3D: true, clearProps: "all" },
        );
    }, { dependencies: [pathname] });

    // --- 2. 出场动画逻辑 ---
    const navigateWithAnimation = useMemo(() => (href: string) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            router.push(href);
            return;
        }
        gsap.killTweensOf(".page-content");

        gsap.to(".page-content", {
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: "power3.in",
            force3D: true,
            onComplete: () => {
                // 动画完成后跳转，Next.js 会处理剩下的事
                const oldPath = window.location.pathname;
                router.push(href);

                // 如果 500ms 后路径还没变（说明 Next.js 拒绝了跳转），强制把页面恢复显示
                setTimeout(() => {
                    if (window.location.pathname === oldPath) {
                        gsap.to(".page-content", { opacity: 1, y: 0, duration: 0.3 });
                        console.warn("Navigation aborted or same-page click detected. Restoring visibility.");
                    }
                }, 500);
            },
        });
    }, [router]);

    return (
        <TransitionContext.Provider value={{ navigateWithAnimation }}>
            {children}
        </TransitionContext.Provider>
    );
};

// 导出一个 Hook 方便调用
export const useTransition = () => useContext(TransitionContext);