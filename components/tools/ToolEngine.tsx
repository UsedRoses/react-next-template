"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { FIELD_REGISTRY } from "./registry";
import { ToolFieldConfig } from "@/types/tool-config";
import { useToolStore } from "@/hooks/use-tool-store";

interface ToolEngineProps {
    config: {
        fields: ToolFieldConfig[];
        api_action: string;
        submit_text?: string;
    };
}

export function ToolEngine({ config }: ToolEngineProps) {
    const { t } = useTranslation("components");

    // 1. 从 Store 获取状态和动作
    const { isGenerating, startGeneration, finishGeneration, stopGeneration } = useToolStore();

    const methods = useForm({ mode: "onChange" });

    const handleSubmit = async (data: any) => {
        // A. 开始状态
        startGeneration();

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: config.api_action,
                    payload: data
                }),
            });

            // B. 优雅的错误处理 (不抛错，直接提示 + 停止)
            if (!response.ok) {
                // 尝试解析后端返回的具体错误信息
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || t("Toast.generation_failed");

                toast.error(errorMessage); // 直接弹窗
                stopGeneration(); // 停止 Template 动画
                return; // 中断执行
            }

            // C. 成功处理
            const result = await response.json();
            finishGeneration(result.url, result.type); // 更新 Store
            toast.success(t("Toast.success"));

        } catch (error) {
            // D. 网络等意外错误
            console.error(error);
            toast.error(t("Toast.error"));
            stopGeneration();
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-12 gap-4">
                    {config.fields.map((field) => {
                        const Component = FIELD_REGISTRY[field.type];
                        if (!Component) return null;

                        return (
                            <div key={field.id} className={cn(`col-span-${field.grid_col || 12}`)}>
                                <Component
                                    name={field.bind_key || field.id}
                                    config={field}
                                    defaultLabel={field.ui_props?.label}
                                    overrideLabel={field.ui_props?.override_label}
                                    {...field.ui_props}
                                />
                            </div>
                        );
                    })}
                </div>

                <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("Template.processing")}
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            {config.submit_text || t("Buttons.start_generating")}
                        </>
                    )}
                </Button>
            </form>
        </FormProvider>
    );
}