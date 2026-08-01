"use client";

import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import { useTaskStore } from "@/store/useTaskStore";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: Readonly<AppLayoutProps>) {
    const router = useRouter();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const user = useTaskStore((state) => state.user);
    const checkAndUpdateSystemState = useTaskStore(
        (state) => state.checkAndUpdateSystemState,
    );
    const syncWithFirestore = useTaskStore((state) => state.syncWithFirestore);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        // Nếu đã mount, kiểm tra quyền truy cập (Route Guard)
        if (!user) {
            router.replace("/auth/login");
            return;
        }

        // Kích hoạt đồng bộ dữ liệu Real-time với Firestore
        const unsubscribe = syncWithFirestore();

        // Quét cập nhật trạng thái hệ thống (quá hạn, streak...)
        checkAndUpdateSystemState();

        // Thiết lập chu kỳ kiểm tra tự động mỗi 5 phút
        const interval = setInterval(
            () => {
                checkAndUpdateSystemState();
            },
            5 * 60 * 1000,
        );

        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, [user, router, checkAndUpdateSystemState, syncWithFirestore]);

    // Tránh lỗi Hydration mismatch của Next.js SSR
    if (!mounted || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-3">
                <Spinner size="lg" color="accent" />
                <span className="text-xs text-default-500 font-medium">
                    {t("auth.loadingData")}
                </span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
            {/* Background Glow Tinh Vân mờ ảo */}
            <div
                className="absolute rounded-full bg-primary/10 dark:bg-primary/5 pointer-events-none z-0"
                style={{
                    top: "-10%",
                    left: "-10%",
                    width: "50%",
                    height: "50%",
                    filter: "blur(100px)",
                }}
            />
            <div
                className="absolute rounded-full bg-danger/10 dark:bg-danger/5 pointer-events-none z-0"
                style={{
                    bottom: "10%",
                    right: "-10%",
                    width: "60%",
                    height: "60%",
                    filter: "blur(120px)",
                }}
            />

            {/* Navigation (Sidebar trên desktop, BottomNav trên mobile) */}
            <Navbar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen md:pl-64 overflow-hidden relative z-10">
                {/* Top Header sticky */}
                <Header />

                {/* Content body */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 pb-[calc(80px+env(safe-area-inset-bottom,12px))] md:pb-8">
                    <div className="max-w-screen-2xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
