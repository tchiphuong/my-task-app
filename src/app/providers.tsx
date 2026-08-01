"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import IosInstallPrompt from "@/components/ui/IosInstallPrompt";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider locale="vi-VN">
        <ToastProvider placement="top" />
        {children}
        <IosInstallPrompt />
      </I18nProvider>
    </NextThemesProvider>
  );
}
