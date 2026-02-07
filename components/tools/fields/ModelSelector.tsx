"use client";

import React, { useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Settings2, Check, ChevronsUpDown } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useTranslation } from "react-i18next";

// 选项接口
interface ModelOption {
    value: string;
    label: string;
    description?: string; // "Standard video generation"
    badge?: string;       // "Popular"
    image?: string;       // 背景图
    video?: string;       // 背景视频 (优先级高于图片)
    disabled?: boolean;
}

interface ModelSelectorProps {
    name: string;
    options?: ModelOption[];
    onValueChange?: (val: any) => void;
}

export default function ModelSelector({ name, options = [], onValueChange }: ModelSelectorProps) {
    const { t } = useTranslation('tools');

    const [open, setOpen] = useState(false);
    const { control } = useFormContext();
    const { field } = useController({ name, control });

    // 获取当前选中的模型对象
    const selectedModel = options.find((opt) => opt.value === field.value) || options[0];

    const handleSelect = (val: string) => {
        field.onChange(val);
        onValueChange?.(val);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {/*
                   主卡片区域
                   1. h-32: 固定高度，防止过大
                   2. cursor-pointer: 暗示可点击切换
                */}
                <div className="group relative w-full h-32 rounded-xl border border-border/50 bg-muted/40 overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">

                    {/* --- 背景媒体层 --- */}
                    <div className="absolute inset-0 z-0">
                        {selectedModel?.video ? (
                            <video
                                src={selectedModel.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                            />
                        ) : selectedModel?.image ? (
                            <img
                                src={selectedModel.image}
                                alt={selectedModel.label}
                                className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                            />
                        ) : (
                            <div className="w-full h-full bg-linear-to-br from-muted to-muted/50" />
                        )}
                        {/* 渐变遮罩，保证文字清晰 */}
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                    </div>

                    {/* --- 内容层 --- */}
                    <div className="absolute inset-0 z-10 p-4 flex flex-col justify-end">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                        {selectedModel?.label}
                                        <ChevronsUpDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                    </h3>
                                    {selectedModel?.badge && (
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary border-0 backdrop-blur-md">
                                            {selectedModel.badge}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {selectedModel?.description || "Select a model to start"}
                                </p>
                            </div>

                            {/* 设置图标 */}
                            <div className="w-8 h-8 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center border border-white/10 text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Settings2 className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverTrigger>

            {/* --- 弹出选择列表 --- */}
            <PopoverContent className="w-90 p-0" align="start">
                <Command>
                    <CommandInput placeholder={t("Search models...")} />
                    <CommandList>
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup heading={t("Available Models")}>
                            {options.map((model) => (
                                <CommandItem
                                    key={model.value}
                                    value={model.label} // 搜索关键词
                                    onSelect={() => handleSelect(model.value)}
                                    disabled={model.disabled}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        {/* 缩略图 */}
                                        <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                                            {model.image && <img src={model.image} className="w-full h-full object-cover"  alt={''}/>}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{model.label}</span>
                                                {model.badge && <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground">{model.badge}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{model.description}</p>
                                        </div>

                                        {field.value === model.value && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}