import { create } from 'zustand';
import {ToolFieldConfig} from "@/types/tool-config";

interface ToolState {
    // 1. 生成状态
    isGenerating: boolean;
    result: any | null;

    // 2. 表单回填数据 (用于结果页回传数据给表单)
    inputValues: Record<string, any> | null;

    // 3. 视图控制 (移入 Store，方便任何组件控制跳转)
    activeMobileView: 'config' | 'result';
    activeDesktopTab: string;

    // Actions
    setGenerating: (val: boolean) => void;
    setResult: (result: any) => void;

    // 核心动作：回填数据并跳转到表单
    reuseResultAsInput: (data: Record<string, any>) => void;

    setMobileView: (view: 'config' | 'result') => void;
    setDesktopTab: (tab: string) => void;
    reset: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
    isGenerating: false,
    result: null,
    inputValues: null,
    activeMobileView: 'config',
    activeDesktopTab: 'guide',

    setGenerating: (val) => set({ isGenerating: val }),

    setResult: (result) => set({
        result,
        isGenerating: false,
        activeMobileView: 'result', // 生成成功自动跳结果页
        activeDesktopTab: 'result'
    }),

    // 关键：点击"二次编辑"时调用
    reuseResultAsInput: (data) => set({
        inputValues: data,       // 1. 注入数据
        activeMobileView: 'config', // 2. 移动端切回表单
        result: null             // 3. (可选) 清空结果让用户专注编辑
    }),

    setMobileView: (view) => set({ activeMobileView: view }),
    setDesktopTab: (tab) => set({ activeDesktopTab: tab }),

    reset: () => set({
        isGenerating: false,
        result: null,
        inputValues: null,
        activeMobileView: 'config',
        activeDesktopTab: 'guide'
    }),
}));

/**
 * 合并工具配置
 * @param structure 骨架配置 (来自 seo_tools)
 * @param overrides 翻译补丁 (来自 seo_page_contents)
 */
export function mergeToolConfig(structure: any, overrides: any) {
    // 1. 深拷贝骨架，防止污染原始对象
    const finalConfig = JSON.parse(JSON.stringify(structure));

    // 如果没有覆盖配置，直接返回骨架
    if (!overrides || Object.keys(overrides).length === 0) {
        return finalConfig;
    }

    // 2. 覆盖全局属性 (如提交按钮文案)
    if (overrides._global) {
        if (overrides._global.submit_text) {
            finalConfig.submit_text = overrides._global.submit_text;
        }
    }


    // 3. 遍历字段进行深度合并
    finalConfig.fields = finalConfig.fields.map((field: ToolFieldConfig) => {
        const fieldId = field.id;
        const override = overrides[fieldId];

        // 如果没有针对该字段的覆盖，保持原样
        if (!override) return field;

        // --- A. 合并基础 UI 属性 (label, placeholder, text, subtext 等) ---
        // 排除 options，options 需要特殊处理
        const { options: overrideOptions, ...simpleProps } = override;

        field.ui_props = {
            ...field.ui_props,
            ...simpleProps
        };

        // --- B. 智能合并 Options (针对 Select/ModelSelector/Radio) ---
        // 场景：骨架里有图片/视频/逻辑，覆盖配置里只有翻译文本。
        // 我们需要保留骨架的媒体资源，只替换文本。
        if (field.ui_props.options && Array.isArray(field.ui_props.options) && overrideOptions) {
            field.ui_props.options = field.ui_props.options.map((opt: any) => {
                // 尝试在 overrides.options 中找到对应 value 的配置
                // 假设 overrides.options 是一个对象: { "v1": { "label": "中文V1" } }
                const optOverride = overrideOptions[opt.value];

                if (optOverride) {
                    return {
                        ...opt,          // 保留原始属性 (image, video, badge, preset_values)
                        ...optOverride   // 覆盖文案属性 (label, description)
                    };
                }
                return opt;
            });
        }

        return field;
    });

    return finalConfig;
}
