"use client";

import {
  ArrowRightStartOnRectangleIcon,
  FireIcon as FireOutline,
  MoonIcon,
  Squares2X2Icon,
  SunIcon
} from "@heroicons/react/24/outline";
import { FireIcon as FireSolid } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  Label
} from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useTaskStore } from "@/store/useTaskStore";

import InstallAppModal from "../ui/InstallAppModal";
import NotificationCenter from "./NotificationCenter";

export default function Header() {
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
          <p className="font-bold text-lg">My Task App</p>
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
    if (key === "dashboard") {
      router.push("/dashboard");
    } else if (key === "install") {
      setIsInstallModalOpen(true);
    } else if (key === "logout") {
      handleLogout();
    }
  };

  return (
    <>
      <header className="h-16 border-b border-default-100 flex items-center justify-between md:justify-end px-4 md:px-6 sticky top-0 bg-background/70 backdrop-blur-md z-40">
        <div className="md:hidden">
          <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-secondary-500 text-lg md:text-xl tracking-tight">
            My Task App
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Streak Count Widget */}
          <Chip variant="soft" color="warning">
            {streakCount > 0 ? (
              <FireSolid className="w-4 h-4 text-warning" />
            ) : (
              <FireOutline className="w-4 h-4" />
            )}
            <Chip.Label>{streakCount} ngày</Chip.Label>
          </Chip>

          {/* Theme Toggle */}
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Đổi theme"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <SunIcon className="w-5 h-5 text-warning-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-default-500" />
            )}
          </Button>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User Profile / Login */}
          {user ? (
            <Dropdown>
              <Button variant="ghost" isIconOnly aria-label="User menu">
                <Avatar color="accent">
                  <Avatar.Image src={user.picture} alt={user.name} />
                  <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu onAction={handleDropdownAction}>
                  <Dropdown.Item id="profile" textValue="Thông tin tài khoản" className="h-14 gap-2">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-semibold text-sm text-default-900 truncate">{user.name}</span>
                      <span className="font-medium text-xs text-default-500 truncate">{user.email}</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="dashboard"
                    textValue="Bảng điều khiển"
                    className="gap-2"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                    <Label>Bảng điều khiển</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="install"
                    textValue="Tải ứng dụng"
                    className="gap-2"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <Label>Tải ứng dụng</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="logout"
                    variant="danger"
                    textValue="Đăng xuất"
                    className="text-danger gap-2"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    <Label>Đăng xuất</Label>
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
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      {/* Modal hướng dẫn tải app */}
      <InstallAppModal isOpen={isInstallModalOpen} onOpenChange={setIsInstallModalOpen} />
    </>
  );
}
