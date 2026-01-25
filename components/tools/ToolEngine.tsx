"use client";

import {useForm, FormProvider} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Button} from "@/components/ui/premium-button";
import {Loader2, Sparkles} from "lucide-react";
import {FIELD_REGISTRY} from "./registry";
import {ToolFieldConfig} from "@/types/tool-config";
import {useToolStore} from "@/hooks/use-tool-store";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";

// 动态生成 Zod Schema
const generateSchema = (fields: ToolFieldConfig[]) => {
    const shape: Record<string, any> = {};

    fields.forEach((field) => {
        let validator;

        // 基础类型验证
        switch (field.type) {
            case 'number':
            case 'slider':
                validator = z.coerce.number(); // 强制转数字
                if (field.validation?.min !== undefined) validator = validator.min(field.validation.min);
                if (field.validation?.max !== undefined) validator = validator.max(field.validation.max);
                break;
            case 'upload':
                // 上传可能是 string (url) 或 File，视业务逻辑而定
                // 这里假设上传组件处理完直接返回 URL string
                validator = z.string();
                break;
            default:
                validator = z.string();
        }

        // 必填验证
        if (field.validation?.required) {
            validator = validator.min(1, {message: "Required"});
        } else {
            validator = validator.optional();
        }

        shape[field.bind_key] = validator;
    });

    return z.object(shape);
};

interface ToolEngineProps {
    config: {
        fields: ToolFieldConfig[];
        api_action: string;
        submit_text?: string;
    };
}

export function ToolEngine({config}: ToolEngineProps) {
    const {t} = useTranslation("components");
    const {isGenerating, startGeneration, finishGeneration, stopGeneration} = useToolStore();

    // 1. 动态构建 Schema
    const schema = generateSchema(config.fields);

    // 2. 初始化 Form
    const methods = useForm<Record<string, any>>({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: config.fields.reduce((acc, field) => ({
            ...acc,
            [field.bind_key]: field.defaultValue ?? ""
        }), {})
    });

    // 3. 核心功能：监听模版变更，自动填充参数
    // 假设 VisualSelector 绑定的是 "template_id" 或 "model_id"
    // 我们需要监听所有的 VisualSelector 类型的字段
    const handleFieldChange = (bindKey: string, newValue: any) => {
        // 1. 找到当前变更的字段配置
        const currentField = config.fields.find(f => f.bind_key === bindKey);
        if (!currentField) return;

        // 2. 检查是否有预设联动 (Preset Logic)
        if (currentField.type === 'visual_selector' && currentField.ui_props.options) {
            const selectedOption = currentField.ui_props.options.find((opt: any) => opt.value === newValue);

            // 3. 如果选中项有 preset_values，则设置其他字段
            if (selectedOption?.preset_values) {
                Object.entries(selectedOption.preset_values).forEach(([targetKey, targetValue]) => {
                    // 使用 setValue 更新其他字段
                    methods.setValue(targetKey, targetValue, {
                        shouldValidate: true, // 触发目标字段的验证（如取消红色必填警告）
                        shouldDirty: true
                    });
                });

                // 可选：在这里加个 Toast 告诉用户参数已自动调整
                // toast.info("Parameters updated based on selection");
            }
        }
    };


    const handleSubmit = async (data: any) => {
        startGeneration();
        try {
            // 模拟 API 请求，实际替换为 fetch
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: config.api_action,
                    payload: data
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || t("Toast.generation_failed");

                toast.error(errorMessage); // 直接弹窗
                stopGeneration(); // 停止 Template 动画
                return; // 中断执行
            }

            const result = await response.json();

            // 成功回调
            finishGeneration(result.url, result.type || 'video', result.metadata);
            toast.success(t("Success"));

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("Error"));
            stopGeneration();
        }
    };

    return (
        <FormProvider {...methods}>
            {/* 1. Form 撑满左侧卡片的高度 */}
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col h-full w-full">

                {/* 2. 滚动区域：flex-1 占满剩余空间 */}
                <ScrollArea className="flex-1 overflow-hidden">
                    <div className="p-4 space-y-6 pb-4">
                        <div className="flex flex-col gap-6">
                            {config.fields.map((field) => {
                                const Component = FIELD_REGISTRY[field.type];
                                if (!Component) return null;
                                const isFullWidth = field.grid_col === 12 || !field.grid_col;

                                return (
                                    <div key={field.id} className={cn("w-full", !isFullWidth && "col-span-1")}>
                                        <Component
                                            name={field.bind_key}
                                            config={field}
                                            onValueChange={(val) => handleFieldChange(field.bind_key, val)}
                                            {...field.ui_props}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>

                {/*
                   3. 底部按钮区：
                   - 不用 fixed，用 sticky bottom-0 配合 flex 布局
                   - bg-background/80 改为与卡片背景融合的颜色，或者半透明
                   - 确保它在卡片内部的最下方
                */}
                <div className="shrink-0 p-4 pt-2 w-full sticky bottom-0 z-10 bg-linear-to-t from-muted/90 via-muted/80 to-transparent backdrop-blur-sm">
                    <Button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full h-12 text-lg font-semibold rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5 fill-current"/>
                                {config.submit_text || "Generate"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}