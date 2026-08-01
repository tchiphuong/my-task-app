"use client";

import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody } from "@heroui/react";
import { useEffect, useState } from "react";

export default function IosInstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Kiểm tra xem có đang ở môi trường trình duyệt không
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      // Phát hiện thiết bị iOS (iPhone, iPad, iPod)
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      // Kiểm tra xem app đã được chạy từ màn hình chính chưa (standalone mode)
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

      setIsIos(isIosDevice);
      setIsStandalone(isStandaloneMode);

      // Nếu là iOS, chưa cài đặt và chưa từng tắt thông báo này trước đó
      if (isIosDevice && !isStandaloneMode) {
        const hasDismissed = localStorage.getItem("dismissed_ios_install_prompt");
        if (!hasDismissed) {
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
      <Card className="w-full max-w-sm shadow-xl border border-default-200 bg-background/95 backdrop-blur-md">
        <CardBody className="px-4 py-3 relative">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            className="absolute right-2 top-2 z-10 text-default-400"
            onPress={handleDismiss}
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>

          <div className="flex flex-col gap-2 pr-6">
            <p className="text-sm font-semibold text-foreground">
              Cài đặt ứng dụng vào máy
            </p>
            <p className="text-xs text-default-500 leading-relaxed">
              Trải nghiệm mượt mà như app gốc! Hãy bấm biểu tượng <ArrowUpTrayIcon className="inline w-4 h-4 text-primary mx-0.5 -mt-1" /> ở dưới thanh công cụ Safari, sau đó chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
