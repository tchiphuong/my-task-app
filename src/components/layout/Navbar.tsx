"use client";

import {
    ChartBarIcon as ReportsOutline,
    ClipboardDocumentCheckIcon as TasksOutline,
    HomeIcon as DashboardOutline,
    SparklesIcon as DailyOutline,
} from "@heroicons/react/24/outline";
import {
    ChartBarIcon as ReportsSolid,
    ClipboardDocumentCheckIcon as TasksSolid,
    HomeIcon as DashboardSolid,
    SparklesIcon as DailySolid,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

// Danh sách menu điều hướng
const navItems = [
    {
        translationKey: "menu.dashboard",
        path: "/dashboard",
        iconOutline: DashboardOutline,
        iconSolid: DashboardSolid,
    },
    {
        translationKey: "menu.tasks",
        path: "/tasks",
        iconOutline: TasksOutline,
        iconSolid: TasksSolid,
    },
    {
        translationKey: "menu.daily",
        path: "/daily",
        iconOutline: DailyOutline,
        iconSolid: DailySolid,
    },
    {
        translationKey: "menu.reports",
        path: "/reports",
        iconOutline: ReportsOutline,
        iconSolid: ReportsSolid,
    },
];

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <>
            {/* 1. BOTTOM NAVIGATION BAR FOR MOBILE (màn hình < 768px) - Minimal Icon-Only Native App Style */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-2xl border-t border-default-200/50 dark:border-default-100/20 safe-bottom md:hidden shadow-lg">
                <div className="grid grid-cols-4 items-center px-4 py-2">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = active ? item.iconSolid : item.iconOutline;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                aria-label={t(item.translationKey)}
                                className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl relative transition-all duration-200 group"
                            >
                                {/* Animated indicator — slide mượt giữa các tab */}
                                {active && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        className="absolute inset-x-2 inset-y-1 bg-primary/10 dark:bg-primary/20 rounded-full z-0"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <div className="relative z-10 flex flex-col items-center justify-center p-2">
                                    <Icon
                                        className={`w-6 h-6 transition-transform duration-200 text-default-400 group-hover:text-default-600 ${
                                            active
                                                ? "text-primary scale-105"
                                                : "text-default-400"
                                        }`}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* 2. SIDEBAR FOR DESKTOP (màn hình >= 768px) */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-default-100 bg-background h-screen z-40 p-4">
                {/* Logo Brand */}
                <div className="h-16 flex items-center px-4 mb-6 border-b border-default-100/50">
                    <span className="font-black text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-accent text-xl tracking-tight">
                        {t("appName")}
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1.5 grow">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = active ? item.iconSolid : item.iconOutline;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all duration-200 text-left font-medium text-sm ${
                                    active
                                        ? "bg-primary/10 text-primary font-bold"
                                        : "text-default-500 hover:bg-default-50 dark:hover:bg-default-100/10 hover:text-default-900"
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-transform duration-200 ${
                                        active
                                            ? "text-primary scale-105"
                                            : "text-default-400"
                                    }`}
                                />
                                <span>{t(item.translationKey)}</span>
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
