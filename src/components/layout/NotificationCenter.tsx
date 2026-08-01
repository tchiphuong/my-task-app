"use client";

import {
  BellIcon as BellOutline,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import { Badge, Button, Popover, ScrollShadow } from "@heroui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useTaskStore } from "@/store/useTaskStore";

export default function NotificationCenter() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const account = useTaskStore((state) => state.getCurrentAccount());
  const markNotificationAsRead = useTaskStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useTaskStore((state) => state.markAllNotificationsAsRead);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const notifications = account?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-success-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-primary-500" />;
    }
  };

  const getNotifIconClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success-50 dark:bg-success-950/20";
      case "warning":
        return "bg-warning-50 dark:bg-warning-950/20";
      default:
        return "bg-primary-50 dark:bg-primary-950/20";
    }
  };

  const timeAgo = (dateStr: string) => {
    const createdDate = new Date(dateStr).getTime();
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const diffMs = now - createdDate;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return t("notifications.time.daysAgo", { count: diffDays });
    } else if (diffHours > 0) {
      return t("notifications.time.hoursAgo", { count: diffHours });
    } else if (diffMins > 0) {
      return t("notifications.time.minsAgo", { count: diffMins });
    } else {
      return t("notifications.time.justNow");
    }
  };

  const getBellIcon = () => {
    if (isOpen) {
      return <BellSolid className="w-6 h-6 text-primary-500" />;
    }
    return <BellOutline className="w-6 h-6 text-default-500 hover:text-default-700" />;
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      {unreadCount > 0 ? (
        <Badge.Anchor>
          <Button
            isIconOnly
            variant="ghost"
            aria-label={t("notifications.title")}
          >
            {getBellIcon()}
          </Button>
          <Badge color="danger" size="sm">
            {unreadCount}
          </Badge>
        </Badge.Anchor>
      ) : (
        <Button
          isIconOnly
          variant="ghost"
          aria-label={t("notifications.title")}
        >
          {getBellIcon()}
        </Button>
      )}

      <Popover.Content placement="bottom end" offset={10} className="w-90 p-0 max-h-120">
        <Popover.Dialog className="p-0">
          <Popover.Heading className="sr-only">{t("notifications.title")}</Popover.Heading>

          <div className="flex items-center justify-between px-4 py-3 border-b border-default-100 w-full bg-default-50 dark:bg-default-100/50 rounded-t-lg">
            <span className="font-semibold text-sm">{t("notifications.header")}</span>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7 px-2 min-w-0 font-bold text-primary"
                onPress={markAllNotificationsAsRead}
              >
                {t("notifications.readAll")}
              </Button>
            )}
          </div>

          <ScrollShadow className="w-full max-h-95 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <BellOutline className="w-12 h-12 text-default-300 mb-2" />
                <p className="text-default-500 text-sm">{t("notifications.empty")}</p>
              </div>
            ) : (
              <div className="flex flex-col w-full divide-y divide-default-100">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`w-full flex gap-3 p-4 cursor-pointer transition-colors duration-150 text-left hover:bg-default-50 dark:hover:bg-default-100/20 ${!notif.read ? "bg-primary-50/30 dark:bg-primary-950/10 font-medium" : ""
                      }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${getNotifIconClass(notif.type)}`}>
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                      <p className={`text-xs text-default-900 line-clamp-2 ${!notif.read ? "font-semibold" : ""}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-default-500 line-clamp-3">
                        {notif.message}
                      </p>
                      <span className="text-2xs text-default-400 mt-1">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollShadow>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
