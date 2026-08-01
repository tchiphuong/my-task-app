"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { CloseButton } from "@heroui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppCard as Card } from "@/components/common/AppCard";

export default function IosInstallPrompt() {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      // Phát hiện thiết bị iOS (iPhone, iPad, iPod)
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      // Kiểm tra xem app đã được chạy từ màn hình chính chưa (standalone mode)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

      // Nếu là iOS, chưa cài đặt và chưa từng tắt thông báo này trước đó
      if (isIosDevice && !isStandaloneMode) {
        const hasDismissed = localStorage.getItem("dismissed_ios_install_prompt");
        if (!hasDismissed) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowPrompt(true);
        }
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("dismissed_ios_install_prompt", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center animate-appearance-in">
      <div className="w-full max-w-sm">
        <Card className="relative p-0">
          <div className="absolute right-2 top-3 z-10">
            <CloseButton onPress={handleDismiss} />
          </div>
          <Card.Header className="flex flex-col gap-1 p-5">
            <h3 className="font-semibold text-small">
              {t("iosPrompt.title")}
            </h3>
            <p className="text-xs text-default-500 leading-relaxed pr-6">
              {t("iosPrompt.descStart")}
              <ArrowUpTrayIcon className="inline w-4 h-4 text-primary mx-0.5" />
              {t("iosPrompt.descEnd")}
              <strong>{t("iosPrompt.descAction")}</strong>.
            </p>
          </Card.Header>
        </Card>
      </div>
    </div>

  );
}
