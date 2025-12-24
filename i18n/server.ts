import { createInstance } from 'i18next';
// 👇 1. 引入 InitOptions 类型
import { type InitOptions } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions, languages, fallbackLng } from './settings';

const initI18next = async (lang: string, ns: string) => {
    const i18nInstance = createInstance();

    let safeLang = lang;
    if (!languages.includes(safeLang)) {
        safeLang = fallbackLng;
    }

    await i18nInstance
        .use(initReactI18next)
        .use(resourcesToBackend((language: string, namespace: string) =>
            import(`../locales/${language}/${namespace}.json`)
        ))
        // 👇 2. 在这里加 "as InitOptions"
        .init(getOptions(safeLang, ns) as InitOptions);

    return i18nInstance;
};

export async function useTranslation(ns: string, lang: string, options: any = {}) {
    const i18nextInstance = await initI18next(lang, ns || 'translation');
    return {
        t: i18nextInstance.getFixedT(lang, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
        i18n: i18nextInstance,
    };
}