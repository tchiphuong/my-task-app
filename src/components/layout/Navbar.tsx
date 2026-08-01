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
      {/* 1. BOTTOM NAVIGATION BAR FOR MOBILE (màn hình < 768px) - Floating iOS Style */}
      <nav className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 bg-background/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl md:hidden">
        <div className="grid grid-cols-4 items-center p-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = active ? item.iconSolid : item.iconOutline;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center justify-center py-2 rounded-full relative transition-all duration-300 group"
              >
                {/* Animated indicator — slide mượt giữa các tab */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110 text-primary" : "text-default-400 group-hover:text-default-500"}`} />
                  <span className={`text-xs mt-1 tracking-tight font-medium transition-colors duration-300 ${active ? "text-primary font-bold" : "text-default-400 group-hover:text-default-500"}`}>
                    {t(item.translationKey)}
                  </span>
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${active
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-default-500 hover:bg-default-50 dark:hover:bg-default-100/10 hover:text-default-900"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "text-primary scale-105" : "text-default-400"
                  }`} />
                <span>{t(item.translationKey)}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

      </aside>
    </>
  );
}
