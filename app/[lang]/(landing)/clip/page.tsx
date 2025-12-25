import React from "react";
import {GeneralPageContent} from "@/app/[lang]/(landing)/components/general-template";
import {ClipPageContent} from "@/app/[lang]/(landing)/clip/clip-page-content";
import { useTranslation } from "@/i18n/server";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const { t } = await useTranslation("clip", lang);

    return (
        <main>
            <GeneralPageContent
                customSlot={<ClipPageContent />}
                logoData={{
                    subtitle: t('Trusted by leading companies worldwide')
                }}
                statsData={[
                    {
                        iconName: 'Package',
                        value: t('500+'),
                        label: t('Components'),
                        description: t('Ready-to-use blocks')
                    },
                    {
                        iconName: 'Download',
                        value: t('25K+'),
                        label: t('Downloads'),
                        description: t('Trusted worldwide')
                    },
                    {
                        iconName: 'Users',
                        value: t('10K+'),
                        label: t('Developers'),
                        description: t('Active community')
                    },
                    {
                        iconName: 'Star',
                        value: t('4.9'),
                        label: t('Rating'),
                        description: t('User satisfaction')
                    }
                ]
                }
            />
        </main>
    );
}