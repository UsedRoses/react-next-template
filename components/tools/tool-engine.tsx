"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/premium-button";
import { Loader2, Sparkles } from "lucide-react";
import { FIELD_REGISTRY } from "./registry";
import { ToolFieldConfig } from "@/types/tool-config";
import { useToolStore } from "@/hooks/use-tool-store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// 1. 动态生成 Zod Schema (逻辑保持不变)
const generateSchema = (fields: ToolFieldConfig[]) => {
    const shape: Record<string, any> = {};

    fields.forEach((field) => {
        let validator;
        switch (field.type) {
            case 'number':
            case 'slider':
                validator = z.coerce.number();
                if (field.validation?.min !== undefined) validator = validator.min(field.validation.min);
                if (field.validation?.max !== undefined) validator = validator.max(field.validation.max);
                break;

            case 'upload':
                // 单上传组件 Schema
                validator = z.union([z.string(), z.instanceof(File), z.array(z.any()), z.null()]);
                break;

            case 'frame_selector':
                // 首尾帧 Schema：是一个对象，包含 start 和 end
                validator = z.object({
                    start: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
                    end: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
                });
                break;
            default:
                validator = z.string();
        }

        if (field.validation?.required) {
            if (field.type === 'frame_selector') {
                // 如果是首尾帧，要求 start 和 end 必须至少有一个 (或者根据业务需求都必须有)
                validator = validator.refine((val: any) => val && val.start && val.end, {
                    message: "At least one frame is required"
                });
            } else {
                // @ts-ignore
                validator = validator.min(1, { message: "Required" });
            }
        } else {
            validator = validator.optional().nullable();
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

export function ToolEngine({ config }: ToolEngineProps) {
    const { t } = useTranslation("tools");

    // 拆分字段：找出需要固定在顶部的 model_selector
    const topField = config.fields.find(f => f.type === 'model_selector');
    const scrollableFields = config.fields.filter(f => f.type !== 'model_selector');

    // 2. 使用新版 Store 的方法
    const {
        isGenerating,
        setGenerating, // 替代 startGeneration/stopGeneration
        setResult,     // 替代 finishGeneration
        inputValues    // 用于回填
    } = useToolStore();

    // 动态构建 Schema
    const schema = generateSchema(config.fields);

    // 初始化 Form
    const methods = useForm<Record<string, any>>({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: config.fields.reduce((acc, field) => ({
            ...acc,
            [field.bind_key]: field.defaultValue ?? ""
        }), {})
    });

    // 3. 监听回填数据变化
    // 当在结果页点击“二次编辑”时，Store 中的 inputValues 会更新，这里负责填入表单
    useEffect(() => {
        if (inputValues) {
            methods.reset(inputValues);
        }
    }, [inputValues, methods]);

    // 4. 字段联动逻辑 (Preset Logic)
    const handleFieldChange = (bindKey: string, newValue: any) => {
        const currentField = config.fields.find(f => f.bind_key === bindKey);
        if (!currentField) return;

        if (currentField.type === 'visual_selector' && currentField.ui_props.options) {
            const selectedOption = currentField.ui_props.options.find((opt: any) => opt.value === newValue);

            if (selectedOption?.preset_values) {
                Object.entries(selectedOption.preset_values).forEach(([targetKey, targetValue]) => {
                    methods.setValue(targetKey, targetValue, {
                        shouldValidate: true,
                        shouldDirty: true
                    });
                });
            }
        }
    };

    // 5. 提交逻辑适配新 Store
    const handleSubmit = async (data: any) => {
        // A. 开始状态
        setGenerating(true);

        const payload = { ...data };

        // 遍历找出需要上传的字段 (简化版逻辑，实际可封装通用函数)
        for (const key in payload) {
            const value = payload[key];

            // 情况 A: 普通上传
            if (value instanceof File) {
                // const url = await uploadToOss(value);
                // payload[key] = url;
            }

            // 情况 B: 首尾帧对象 { start: File, end: File }
            if (value && typeof value === 'object' && ('start' in value || 'end' in value)) {
                if (value.start instanceof File) {
                    // const url = await uploadToOss(value.start);
                    // payload[key].start = url;
                }
                if (value.end instanceof File) {
                    // const url = await uploadToOss(value.end);
                    // payload[key].end = url;
                }
            }
        }

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: config.api_action,
                    payload: payload
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || t("Generation Failed");

                toast.error(errorMessage);
                // B. 错误停止：直接设为 false
                setGenerating(false);
                return;
            }

            const result = await response.json();

            // C. 成功状态：构建结果对象并存入 Store
            // Store 的 setResult 会自动将 isGenerating 设为 false，并跳转 Tab
            setResult({
                url: result.url,
                type: result.type || 'video',
                metadata: result.metadata,
                // 这里可以把原始请求参数也存进去，方便 ResultView 直接做“二次编辑”
                // 但因为我们已经在 Store 里有 inputValues 逻辑，这里只需存结果即可
                requestParams: data
            });

            toast.success(t("Success"));

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t("Error"));
            // D. 异常停止
            setGenerating(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col h-full w-full">

                {/*
                   区域 1: 顶部固定区 (Model Selector)
                   放在 ScrollArea 外部，不会随表单滚动
                */}
                {topField && (
                    <div className="p-4 pb-0 shrink-0 animate-in fade-in slide-in-from-top-2">
                        {(() => {
                            const Component = FIELD_REGISTRY[topField.type];
                            if (!Component) return null;
                            return (
                                <Component
                                    name={topField.bind_key}
                                    config={topField}
                                    onValueChange={(val) => handleFieldChange(topField.bind_key, val)}
                                    {...topField.ui_props}
                                />
                            );
                        })()}
                    </div>
                )}

                {/*
                   区域 2: 中间滚动区 (其他字段)
                */}
                <ScrollArea className="flex-1 overflow-hidden">
                    <div className="p-4 space-y-6 pb-4">
                        <div className="flex flex-col gap-6">
                            {scrollableFields.map((field) => {
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

                {/* 底部按钮 */}
                <div className="shrink-0 p-4 pt-2 w-full sticky bottom-0 z-10 bg-linear-to-t from-muted/90 via-muted/80 to-transparent backdrop-blur-sm">
                    <Button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full h-12 text-lg font-semibold rounded-md shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5 fill-current" />
                                {config.submit_text || "Generate"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}