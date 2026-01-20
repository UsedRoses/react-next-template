"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

const TransitionContext = createContext<{
    navigateWithAnimation: (href: string) => void;
    isNavigating: boolean;
} | null>(null);

export const TransitionProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

    // isNavigating: 用于防止重复点击，以及控制页面是否处于“转场中”（透明状态）
    const [isNavigating, setIsNavigating] = useState(false);

    // showSpinner: 专门控制 Loading 图标的显示，与 isNavigating 解耦
    const [showSpinner, setShowSpinner] = useState(false);

    // 用 ref 存定时器，方便清除
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 【核心】监听路径变化：说明页面加载完成了
    useEffect(() => {
        // 1. 清除还没触发的 Loading 定时器
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        // 2. 关闭 Loading 显示
        setShowSpinner(false);

        // 3. 结束导航状态 (template.tsx 会接管进场动画)
        setIsNavigating(false);
    }, [pathname]);

    const navigateWithAnimation = (href: string) => {
        if (href === pathname || isNavigating) return;

        setIsNavigating(true);

        const target = document.querySelector(".page-content");

        if (!target) {
            router.push(href);
            return;
        }

        // 1. 执行出场动画
        gsap.to(target, {
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: "power3.in",
            force3D: true,
            onComplete: () => {
                // 2. 动画播完，执行跳转
                router.push(href);

                // 如果新页面在 300ms 内加载完，这个定时器就会被上面的 useEffect 清除
                // 用户就看不到 Spinner，只会看到 A 淡出 -> B 淡入
                timerRef.current = setTimeout(() => {
                    setShowSpinner(true);
                }, 100);
            },
        });
    };

    return (
        <TransitionContext.Provider value={{ navigateWithAnimation, isNavigating }}>
            {/*
               全局 Loading 遮罩层
               只受 showSpinner 控制
            */}
            <div
                className={`fixed inset-0 z-9999 flex items-center justify-center pointer-events-none transition-opacity duration-300
                ${showSpinner ? "opacity-100" : "opacity-0"}`}
            >
                {showSpinner && (
                    <div className="flex flex-col items-center gap-4 bg-background backdrop-blur-sm p-6 rounded-2xl">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                            Loading...
                        </p>
                    </div>
                )}
            </div>

            {children}
        </TransitionContext.Provider>
    );
};

// 导出 Context 给 I18nLink 使用
export { TransitionContext };

export const useTransition = () => {
    const context = useContext(TransitionContext);
    if (!context) throw new Error("useTransition must be used within TransitionProvider");
    return context;
};