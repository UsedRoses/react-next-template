export type FieldType = string;

export interface BaseFieldProps {
    name: string;                // React Hook Form 的字段名
    config: ToolFieldConfig;     // 完整的配置对象
    onValueChange?: (value: any) => void;
    [key: string]: any;          // 允许透传 ui_props 里的任意属性 (label, options, etc.)
}

export interface ToolFieldConfig {
    id: string;          // 数据库里的字段ID
    type: FieldType;     // 组件类型映射 key
    bind_key: string;    // 提交给 API 的 JSON key (如 "prompt", "aspect_ratio")
    grid_col?: number;   // 布局宽度 (1-12)

    // 核心逻辑配置
    defaultValue?: any;
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: string;
    };

    // UI 配置 (传入组件 props)
    ui_props: Record<string, any>;
}