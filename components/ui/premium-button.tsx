"use client"

import * as React from "react"
import {Slot, Slottable} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import {gsap} from "gsap"
import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden isolate group",
    {
        variants: {
            variant: {
                // 移除了 hover:bg，改由动画球处理
                default:
                    "bg-primary text-primary-foreground shadow-xs",
                destructive:
                    "bg-destructive text-white shadow-xs focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border border-input bg-background shadow-xs text-foreground hover:text-accent-foreground", // 仅保留文字变色
                secondary:
                    "bg-secondary text-secondary-foreground shadow-xs",
                ghost:
                    "text-foreground hover:text-accent-foreground", // 仅保留文字变色
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
                layout: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

// 辅助函数：过滤掉干扰动画的 hover 背景类名
function stripHoverBg(className?: string) {
    if (!className) return ""
    return className
        .split(" ")
        .filter((cls) => !cls.startsWith("hover:bg-") && !cls.includes(":hover:bg-"))
        .join(" ")
}

const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean }>(
    ({className, variant = "default", size = "default", asChild = false, children, ...props}, ref) => {

        const Comp = asChild ? Slot : "button"

        const internalRef = React.useRef<HTMLButtonElement>(null)
        React.useImperativeHandle(ref, () => internalRef.current!)

        // const buttonRef = React.useRef<HTMLButtonElement>(null)
        const flairRef = React.useRef<HTMLSpanElement>(null)

        // 动画逻辑保持不动 (官方 1:1 还原)
        React.useLayoutEffect(() => {
            if (variant === "link" || !internalRef.current || !flairRef.current) return

            let ctx = gsap.context(() => {
                const block = internalRef.current!
                const flair = flairRef.current!
                const xSet = gsap.quickSetter(flair, "xPercent")
                const ySet = gsap.quickSetter(flair, "yPercent")

                const getXY = (e: MouseEvent) => {
                    const {left, top, width, height} = block.getBoundingClientRect()
                    const xTransformer = gsap.utils.pipe(gsap.utils.mapRange(0, width, 0, 100), gsap.utils.clamp(0, 100))
                    const yTransformer = gsap.utils.pipe(gsap.utils.mapRange(0, height, 0, 100), gsap.utils.clamp(0, 100))
                    return {x: xTransformer(e.clientX - left), y: yTransformer(e.clientY - top)}
                }

                block.addEventListener("mouseenter", (e) => {
                    const {x, y} = getXY(e);
                    xSet(x);
                    ySet(y)
                    gsap.to(flair, {scale: 1, duration: 0.4, ease: "power2.out"})
                })

                block.addEventListener("mouseleave", (e) => {
                    const {x, y} = getXY(e)
                    gsap.killTweensOf(flair)
                    gsap.to(flair, {
                        xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
                        yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
                        scale: 0, duration: 0.3, ease: "power2.out"
                    })
                })

                block.addEventListener("mousemove", (e) => {
                    const {x, y} = getXY(e)
                    gsap.to(flair, {xPercent: x, yPercent: y, duration: 0.4, ease: "power2"})
                })
            }, internalRef);
            return () => ctx.revert();
        }, [variant])

        const finalClassName = variant !== "link" ? stripHoverBg(className) : className

        // 动态选择动画球颜色，依然使用你全局的 CSS 变量
        const flairBgClass = cn(
            "absolute top-0 left-0 block aspect-square w-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none",
            (variant === "default" || variant === "destructive")
                ? "bg-white/40"  // 有背景色的按钮，球体作为“光效”
                : "bg-accent"    // 透明背景的按钮，球体使用全局 accent 颜色作为“填充”
        )

        return (
            <Comp
                ref={internalRef}
                data-slot="button"
                className={cn(buttonVariants({variant, size, className: finalClassName}))}
                {...props}
            >
                {variant !== "link" && (
                    <span
                        ref={flairRef}
                        className="button__flair pointer-events-none absolute inset-0 block origin-[0_0] scale-0 z-[-1]"
                    >
                    <span className={flairBgClass}/>
                </span>
                )}

                <Slottable>
                    {asChild ? children : <span className="relative z-10 flex items-center gap-2">{children}</span>}
                </Slottable>
            </Comp>
        )
    })
Button.displayName = "Button"

export {Button, buttonVariants}