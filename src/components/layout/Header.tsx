"use client";

import {
    ArrowRightStartOnRectangleIcon,
    ArrowUpTrayIcon,
    FireIcon as FireOutline,
    MoonIcon,
    SunIcon,
} from "@heroicons/react/24/outline";
import { FireIcon as FireSolid } from "@heroicons/react/24/solid";
import { Avatar, Button, Chip, Dropdown, Label } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useTaskStore } from "@/store/useTaskStore";

import InstallAppModal from "../ui/InstallAppModal";
import NotificationCenter from "./NotificationCenter";

export default function Header() {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const user = useTaskStore((state) => state.user);
    const logout = useTaskStore((state) => state.logout);
    const account = useTaskStore((state) => state.getCurrentAccount());
    const router = useRouter();
    const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <header className="h-16 border-b border-default-100 flex items-center justify-between md:justify-end px-4 md:px-6 sticky top-0 bg-background/70 backdrop-blur-md z-40">
                <div className="md:hidden">
                    <p className="font-bold text-lg">{t("appName")}</p>
                </div>
            </header>
        );
    }

    const streakCount = account?.streak?.currentStreak || 0;

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    const handleDropdownAction = (key: React.Key) => {
        if (key === "install") {
            setIsInstallModalOpen(true);
        } else if (key === "logout") {
            handleLogout();
        }
    };

    return (
        <>
            <header className="border-b border-default-100 flex items-center justify-between md:justify-end px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-40 safe-top min-h-16">
                <div className="md:hidden">
                    <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-secondary-500 text-lg md:text-xl tracking-tight">
                        {t("appName")}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Streak Count Widget */}
                    <Chip variant="soft" color="warning" size="sm">
                        {streakCount > 0 ? (
                            <FireSolid className="w-4 h-4 text-warning" />
                        ) : (
                            <FireOutline className="w-4 h-4" />
                        )}
                        <Chip.Label>
                            {t("streak", { count: streakCount })}
                        </Chip.Label>
                    </Chip>

                    {/* Theme Toggle */}
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label={t("themeToggle")}
                        onPress={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                        }
                    >
                        {theme === "dark" ? (
                            <SunIcon className="w-4 h-4 text-warning-400" />
                        ) : (
                            <MoonIcon className="w-4 h-4 text-default-500" />
                        )}
                    </Button>

                    {/* Notification Center */}
                    <NotificationCenter />

                    {/* User Profile / Login */}
                    {user ? (
                        <Dropdown>
                            <Button
                                variant="ghost"
                                isIconOnly
                                size="sm"
                                aria-label="User menu"
                            >
                                <Avatar color="accent" size="sm">
                                    <Avatar.Image
                                        src={user.picture}
                                        alt={user.name}
                                    />
                                    <Avatar.Fallback>
                                        {user.name.charAt(0)}
                                    </Avatar.Fallback>
                                </Avatar>
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu onAction={handleDropdownAction}>
                                    <Dropdown.Item
                                        id="profile"
                                        textValue={t("menu.profile")}
                                    >
                                        <div className="flex flex-col gap-0.5 text-left h-12 justify-center">
                                            <span className="font-semibold text-sm text-default-900 truncate">
                                                {user.name}
                                            </span>
                                            <span className="font-medium text-xs text-default-500 truncate">
                                                {user.email}
                                            </span>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        id="install"
                                        textValue={t("menu.install")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ArrowUpTrayIcon className="w-4 h-4" />
                                            <Label>{t("menu.install")}</Label>
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        id="logout"
                                        variant="danger"
                                        textValue={t("menu.logout")}
                                    >
                                        <div className="flex items-center gap-2 text-danger">
                                            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                                            <Label className="text-danger">
                                                {t("menu.logout")}
                                            </Label>
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => router.push("/auth/login")}
                        >
                            {t("menu.login")}
                        </Button>
                    )}
                </div>
            </header>

            {/* Modal hướng dẫn tải app */}
            <InstallAppModal
                isOpen={isInstallModalOpen}
                onOpenChange={setIsInstallModalOpen}
            />
        </>
    );
}
