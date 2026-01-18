'use client';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './settings';
import { useMemo } from 'react';
import { createInstance } from 'i18next';

// 保持你的初始化逻辑不变
i18next
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
        import(`../locales/${language}/${namespace}.json`)
    ))
    .init({
        ...getOptions(),
        lng: undefined,
        detection: { caches: ['cookie'] },
    });

export function TranslationsProvider({
                                         children,
                                         locale,
                                         namespaces,
                                         resources,
                                     }: {
    children: React.ReactNode;
    locale: string;
    namespaces: string[];
    resources?: any;
}) {

    const i18n = useMemo(() => {
        const instance = createInstance(); // 创建新实例

        instance
            .use(initReactI18next)
            .use(resourcesToBackend((language: string, namespace: string) =>
                import(`../locales/${language}/${namespace}.json`)
            ))
            .init({
                ...getOptions(locale, namespaces[0]), // 使用你的配置
                lng: locale,
                resources, // 直接注入资源，跳过网络请求和 Suspense
                preload: resources ? [] : [locale], // 如果有资源就不预加载了
            });

        return instance;
    }, [locale, namespaces, resources]);

    if (i18n.language !== locale) {
        i18n.changeLanguage(locale);
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}