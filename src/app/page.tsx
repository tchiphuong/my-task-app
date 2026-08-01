"use client";

import { Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useTaskStore } from "@/store/useTaskStore";

export default function RootPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const user = useTaskStore((state) => state.user);

    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        } else {
            router.replace("/auth/login");
        }
    }, [user, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-3">
            <Spinner size="lg" color="accent" />
            <span className="text-xs text-default-500 font-medium">
                {t("auth.loadingWorkspace")}
            </span>
        </div>
    );
}
