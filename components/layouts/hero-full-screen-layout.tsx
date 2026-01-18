
interface LayoutProps {
    children: React.ReactNode; // ToolWorkspace
}

export function HeroFullScreenLayout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col bg-background">
            {/*
               区域 1: 沉浸式功能区
            */}
            <section className=" relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center py-10 border-b border-border/40 bg-muted/5">

                {/* 背景装饰：网格 + 顶部光晕 */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
                    {/*
                       工具容器
                    */}
                    <div className="w-full grow flex items-center justify-center">
                        <div className="w-full grid lg:grid-cols-12 gap-8 items-stretch">
                            {children}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}