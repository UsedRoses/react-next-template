// 数据库中 tool_config.fields 的单个项结构
export interface ToolFieldConfig {
    id: string;
    type: string;        // 组件类型: MagicTextarea, VisualSelector...
    bind_key: string;    // API 参数名: prompt, aspect_ratio...
    grid_col?: number;   // 栅格宽度: 1-12

    // 逻辑配置
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
    };
    condition?: {
        field: string;
        operator: 'eq' | 'neq';
        value: any;
    };

    // UI 参数 (从数据库透传给组件的 props)
    ui_props?: Record<string, any>;
}

// 组件的标准 Props 接口 (所有原子组件都要继承这个)
export interface BaseFieldProps {
    name: string;           // 对应 bind_key，用于 RHF 绑定
    defaultLabel?: string;  // 数据库 structure_config 里的英文 Label
    overrideLabel?: string; // 数据库 seo_page_contents 里的翻译 Label
    config: ToolFieldConfig; // 完整的配置对象，备用
}