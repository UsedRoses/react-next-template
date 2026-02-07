import { create } from 'zustand';

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