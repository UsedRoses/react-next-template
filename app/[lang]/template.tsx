"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// 注册 GSAP 插件 (防止 Tree Shaking 问题)
if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP);
}

export default function Template({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useGSAP(() => {
        // 进场动画：从透明+下移 20px -> 正常显示
        // delay: 0.1s 是为了让出场动画彻底结束，避免两页重叠
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", force3D: true, clearProps: "all" }
        );
    }, { scope: containerRef, dependencies: [pathname] }); // 依赖 pathname 确保每次路由变动都触发

    return (
        <div ref={containerRef} className="page-content min-h-screen w-full">
            {children}
        </div>
    );
}