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
    const [instance] = useState(i18next);

    useEffect(() => {
        if (instance.language !== locale) {
            instance.changeLanguage(locale);
        }
    }, [locale, instance]);

    useEffect(() => {
        if (!resources || !locale) return;

        namespaces.forEach((ns) => {
            if (resources[locale] && resources[locale][ns]) {
                // 检查资源是否已经存在，避免重复添加
                if (!instance.hasResourceBundle(locale, ns)) {
                    instance.addResourceBundle(locale, ns, resources[locale][ns], true, true);
                }
            }
        });
    }, [resources, locale, namespaces, instance]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}