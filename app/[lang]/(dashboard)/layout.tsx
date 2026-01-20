import React from "react";
import {AppSidebar} from "@/components/common/app-sidebar";
import {SiteHeader} from "@/components/common/site-header";
import {SiteFooter} from "@/components/common/site-footer";
import {SidebarProvider, SidebarInset} from "@/components/ui/sidebar";
// import { UpgradeToProButton } from "@/components/upgrade-to-pro-button";
import {inter} from "@/lib/fonts";
import {dir} from "i18next";
import {BaseLayout} from "@/components/layouts/base-layout";
import {Toaster} from "sonner";

export default async function DashboardLayout({
                                            children,
                                            params,
                                        }: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const {lang} = await params;

    return (
            <BaseLayout>
                {children}
                <Toaster position="top-center" richColors />
            </BaseLayout>
    );
}
