import { cn } from "@/lib/utils";

export function SectionSeparator({ className }: { className?: string }) {
    return (
        <div className={cn("relative w-full flex items-center justify-center", className)}>
            <div className="relative h-px w-64 md:w-96">

                {/* 1. 光晕层 (Blur): 制造发光氛围，颜色稍重一点 */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/50 to-transparent blur-[2px]" />

                {/* 2. 实体层 (Line): 清晰的线条，颜色稍淡一点，增加质感 */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            </div>
        </div>
    );
}