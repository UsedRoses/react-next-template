'use client';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './settings';
import { useState, useEffect } from 'react';

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
    const [instance, setInstance] = useState(i18next);

    // 修复点：使用 useEffect 处理，避免渲染过程中的副作用
    // 并且加上 if (resources) 的判断
    if (!instance.isInitialized || instance.language !== locale) {
        instance.changeLanguage(locale);
    }

    // 核心修复：防止 crash
    if (resources) {
        namespaces.forEach((ns) => {
            // 检查 resources[locale] 是否真的存在
            if (resources[locale] && resources[locale][ns]) {
                instance.addResourceBundle(locale, ns, resources[locale][ns], true, true);
            }
        });
    }

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}