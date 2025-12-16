// src/i18n/settings.ts
import { type InitOptions } from 'i18next'; // 引入类型

export const fallbackLng = 'en';
export const languages = [fallbackLng, 'zh'];
export const defaultNS = 'translation';
export const cookieName = 'i18next';

// 👇 加上 : InitOptions 返回类型声明
export function getOptions(lng = fallbackLng, ns = defaultNS): InitOptions {
    return {
        supportedLngs: languages,
        fallbackLng,
        lng,
        fallbackNS: defaultNS,
        defaultNS,
        ns,
        keySeparator: false, // 允许 key 包含 .
        nsSeparator: false,  // 允许 key 包含 :
    };
}