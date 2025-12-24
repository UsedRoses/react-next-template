module.exports = {
    defaultNamespace: 'translation',
    // 输出路径：将扫描到的 key 写入这些文件
    output: 'locales/$LOCALE/$NAMESPACE.json',
    // 扫描源：包含 src 下的所有 tsx/ts 文件
    input: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}', // 如果你有 lib 或 utils 文件夹
        // 也可以直接写 '/**/*.{js,jsx,ts,tsx}' 但需要排除 node_modules
    ],
    locales: ['en', 'zh', 'ja'],

    // 关键配置：让英文 JSON 的值等于 Key 本身
    // 这样英文原文改了，key 也就变了，自动生效
    defaultValue: (locale, namespace, key, value) => {
        if (locale === 'en') {
            return value || key; // 英文直接用原文
        }
        return ''; // 中文留空，等待人工翻译
    },

    // 必须与 i18n settings 保持一致
    keySeparator: false,
    namespaceSeparator: false,

    // 其他优化
    createOldCatalogs: false, // 不生成 _old 文件
};