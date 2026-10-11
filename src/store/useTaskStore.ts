"use client";

import {
    differenceInCalendarDays,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isWithinInterval,
    parseISO,
    startOfDay,
    subDays,
} from "date-fns";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
    DATE_FORMATS,
    NOTIFICATION_TYPE,
    REPEAT_TYPE,
    RepeatType,
    TASK_STATUS,
} from "@/constants";
import i18n from "@/i18n";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    category: string;
    dueDate: string; // YYYY-MM-DD
    startDate?: string; // YYYY-MM-DD (Từ ngày - optional cho sự kiện/công việc)
    isDaily: boolean;
    repeat?: RepeatType; // none | daily | weekdays | weekly | monthly
    completedDates?: string[]; // Dành cho daily tasks: lưu danh sách ngày hoàn thành YYYY-MM-DD
    createdAt: string;
    completedAt?: string; // Thời gian hoàn thành công việc
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "overdue";
    read: boolean;
    createdAt: string;
}

export interface StreakState {
    currentStreak: number;
    bestStreak: number;
    lastCompletedDate: string; // YYYY-MM-DD
}

export interface AccountData {
    tasks: Task[];
    notifications: Notification[];
    streak: StreakState;
}

interface TaskStore {
    user: { name: string; email: string; picture: string } | null;
    accounts: { [email: string]: AccountData };
    isLoading: boolean;

    // Auth Actions
    setUser: (user: TaskStore["user"]) => void;
    logout: () => void;

    // Utility
    getCurrentAccount: () => AccountData;
    syncWithFirestore: () => () => void; // trả về hàm unsubscribe listener

    // Task Actions
    addTask: (
        taskData: Omit<Task, "id" | "createdAt" | "completedDates">,
    ) => Promise<void>;
    updateTask: (
        taskId: string,
        updatedFields: Partial<Omit<Task, "id">>,
    ) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleDailyTaskDate: (taskId: string, dateStr: string) => Promise<void>;

    // Notification Actions
    addNotification: (
        title: string,
        message: string,
        type: Notification["type"],
    ) => Promise<void>;
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;

    // System State Actions
    checkAndUpdateSystemState: () => Promise<void>;
}

const initialAccountData: AccountData = {
    tasks: [],
    notifications: [],
    streak: {
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: "",
    },
};

const generateUniqueId = (): string => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    const array = new Uint32Array(1);
    if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(array);
        return array[0].toString(36);
    }
    return Date.now().toString(36);
};

/**
 * Kiểm tra xem công việc/thói quen có được lên lịch vào ngày cụ thể hay không.
 * @param task Công việc cần kiểm tra
 * @param targetDate Đối tượng Date của ngày cần kiểm tra
 */
export const isTaskScheduledForDate = (
    task: Task,
    targetDate: Date,
): boolean => {
    const checkDate = startOfDay(targetDate);

    // Xác định ngày bắt đầu dạng Date
    const startDateRaw = task.startDate || task.dueDate || task.createdAt;
    const startDate = startOfDay(
        typeof startDateRaw === "string"
            ? parseISO(startDateRaw)
            : startDateRaw,
    );

    // Không lên lịch trước ngày bắt đầu
    if (isBefore(checkDate, startDate)) {
        return false;
    }

    // Nếu có ngày kết thúc (dueDate)
    const endDate = task.dueDate
        ? startOfDay(
              typeof task.dueDate === "string"
                  ? parseISO(task.dueDate)
                  : task.dueDate,
          )
        : null;

    // Nếu không phải là task lặp lại (sự kiện hoặc task thông thường trong khoảng ngày)
    if (!task.isDaily && (!task.repeat || task.repeat === REPEAT_TYPE.NONE)) {
        if (endDate) {
            // Sự kiện có từ ngày (startDate) đến ngày (dueDate)
            if (isAfter(startDate, endDate)) {
                return isSameDay(checkDate, startDate);
            }
            return isWithinInterval(checkDate, {
                start: startDate,
                end: endDate,
            });
        }
        return isSameDay(checkDate, startDate);
    }

    // Nếu là task lặp lại nhưng có giới hạn ngày kết thúc
    if (endDate && task.startDate && isAfter(checkDate, endDate)) {
        return false;
    }

    const repeatType = task.repeat || REPEAT_TYPE.DAILY;

    switch (repeatType) {
        case REPEAT_TYPE.DAILY:
            return true;
        case REPEAT_TYPE.WEEKDAYS: {
            const dayOfWeek = checkDate.getDay(); // 0 là Chủ Nhật, 6 là Thứ 7
            return dayOfWeek !== 0 && dayOfWeek !== 6;
        }
        case REPEAT_TYPE.WEEKLY:
            return checkDate.getDay() === startDate.getDay();
        case REPEAT_TYPE.MONTHLY: {
            const targetDay = checkDate.getDate();
            const startDay = startDate.getDate();
            if (targetDay === startDay) return true;
            // Xử lý ngày cuối tháng (ví dụ ngày bắt đầu là 31 nhưng tháng kiểm tra chỉ có 28/30 ngày)
            const daysInMonth = new Date(
                checkDate.getFullYear(),
                checkDate.getMonth() + 1,
                0,
            ).getDate();
            if (startDay > daysInMonth && targetDay === daysInMonth)
                return true;
            return false;
        }
        default:
            return true;
    }
};

const calculateStreak = (
    dailyTasks: Task[],
    bestStreak: number,
    lastCompletedDate: string,
) => {
    let currentStreak = 0;
    let newBestStreak = bestStreak;
    let newLastCompletedDate = lastCompletedDate;

    if (dailyTasks.length > 0) {
        const today = new Date();
        const todayStr = format(today, DATE_FORMATS.DATE);
        const yesterday = subDays(today, 1);
        const yesterdayStr = format(yesterday, DATE_FORMATS.DATE);

        // Kiểm tra xem hôm nay hoặc hôm qua có hoàn thành không để bắt đầu đếm chuỗi
        const scheduledToday = dailyTasks.filter((t) =>
            isTaskScheduledForDate(t, today),
        );
        const completedToday =
            scheduledToday.length > 0 &&
            scheduledToday.every((t) => t.completedDates?.includes(todayStr));

        const scheduledYesterday = dailyTasks.filter((t) =>
            isTaskScheduledForDate(t, yesterday),
        );
        const completedYesterday =
            scheduledYesterday.length > 0 &&
            scheduledYesterday.every((t) =>
                t.completedDates?.includes(yesterdayStr),
            );

        if (completedToday || completedYesterday) {
            let checkDate = completedToday ? today : yesterday;
            newLastCompletedDate = completedToday ? todayStr : yesterdayStr;

            while (true) {
                const dayStr = format(checkDate, DATE_FORMATS.DATE);
                const scheduled = dailyTasks.filter((t) =>
                    isTaskScheduledForDate(t, checkDate),
                );

                if (scheduled.length > 0) {
                    const allDone = scheduled.every((t) =>
                        t.completedDates?.includes(dayStr),
                    );
                    if (allDone) {
                        currentStreak++;
                        checkDate = subDays(checkDate, 1);
                    } else {
                        break;
                    }
                } else {
                    // Ngày không có lịch (ví dụ cuối tuần với task weekdays) -> tiếp tục lùi mà không ngắt chuỗi
                    checkDate = subDays(checkDate, 1);
                    if (differenceInCalendarDays(today, checkDate) > 365) break;
                }
            }
        }

        if (currentStreak > newBestStreak) {
            newBestStreak = currentStreak;
        }
    }

    return {
        currentStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: newLastCompletedDate,
    };
};

const handleStreakBreak = async (
    email: string,
    account: AccountData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addNotification: any,
) => {
    if (account.streak.currentStreak > 0 && account.streak.lastCompletedDate) {
        const lastDate = parseISO(account.streak.lastCompletedDate);
        const daysDiff = differenceInCalendarDays(new Date(), lastDate);

        if (daysDiff > 1) {
            const newStreak = {
                ...account.streak,
                currentStreak: 0,
            };

            if (isFirebaseConfigured && db && email !== "guest") {
                try {
                    const userDocRef = doc(db, "users", email);
                    await updateDoc(userDocRef, {
                        streak: newStreak,
                        updatedAt: new Date().toISOString(),
                    });
                } catch (err) {
                    console.error(
                        "Lỗi cập nhật streak đứt trên Firestore:",
                        err,
                    );
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                set((state: any) => {
                    const acc = state.accounts[email];
                    return {
                        accounts: {
                            ...state.accounts,
                            [email]: {
                                ...acc,
                                streak: newStreak,
                            },
                        },
                    };
                });
            }

            addNotification(
                i18n.t("notifications.streakBrokenTitle"),
                i18n.t("notifications.streakBrokenMessage"),
                NOTIFICATION_TYPE.WARNING,
            );
        }
    }
};

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => {
            const getActiveEmail = () => {
                const u = get().user;
                return u?.email || "guest";
            };

            return {
                user: null,
                accounts: {},
                isLoading: false,

                setUser: (user) => {
                    set({ user });
                    if (user) {
                        // Reset account data về trống mỗi lần login
                        // Firestore listener (syncWithFirestore) sẽ pull fresh data từ cloud xuống
                        set((state) => ({
                            accounts: {
                                ...state.accounts,
                                [user.email]: { ...initialAccountData },
                            },
                        }));
                    }
                },

                logout: () => {
                    // Xoá toàn bộ user + accounts data khỏi state (và localStorage do persist)
                    set({ user: null, accounts: {} });
                },

                getCurrentAccount: () => {
                    const email = getActiveEmail();
                    return get().accounts[email] || { ...initialAccountData };
                },

                syncWithFirestore: () => {
                    const email = getActiveEmail();
                    if (!isFirebaseConfigured || !db || email === "guest") {
                        return () => {};
                    }

                    set({ isLoading: true });

                    // 1. Listen Firestore Tasks
                    const tasksQuery = query(
                        collection(db, "users", email, "tasks"),
                        orderBy("createdAt", "desc"),
                    );
                    const unsubscribeTasks = onSnapshot(
                        tasksQuery,
                        (snapshot) => {
                            const tasksList: Task[] = [];
                            snapshot.forEach((docSnap) => {
                                const data = docSnap.data();
                                tasksList.push({
                                    id: docSnap.id,
                                    title: data.title,
                                    description: data.description,
                                    status: data.status,
                                    priority: data.priority,
                                    category: data.category,
                                    dueDate: data.dueDate,
                                    isDaily: data.isDaily,
                                    completedDates: data.completedDates,
                                    createdAt: data.createdAt,
                                    completedAt: data.completedAt,
                                });
                            });

                            set((state) => {
                                const account = state.accounts[email] || {
                                    ...initialAccountData,
                                };
                                return {
                                    accounts: {
                                        ...state.accounts,
                                        [email]: {
                                            ...account,
                                            tasks: tasksList,
                                        },
                                    },
                                };
                            });
                            set({ isLoading: false });
                        },
                        (err) => {
                            console.error("Lỗi Firestore Tasks Listener:", err);
                            set({ isLoading: false });
                        },
                    );

                    // 2. Listen Firestore User Doc (Streak và Notifications)
                    const userDocRef = doc(db, "users", email);
                    const unsubscribeUser = onSnapshot(
                        userDocRef,
                        (docSnap) => {
                            if (docSnap.exists()) {
                                const userData = docSnap.data();
                                set((state) => {
                                    const account = state.accounts[email] || {
                                        ...initialAccountData,
                                    };
                                    return {
                                        accounts: {
                                            ...state.accounts,
                                            [email]: {
                                                ...account,
                                                streak: userData.streak || {
                                                    ...initialAccountData.streak,
                                                },
                                                notifications:
                                                    userData.notifications ||
                                                    [],
                                            },
                                        },
                                    };
                                });
                            } else {
                                // Tạo User document mặc định trên Firestore
                                setDoc(userDocRef, {
                                    email,
                                    streak: { ...initialAccountData.streak },
                                    notifications: [],
                                    createdAt: new Date().toISOString(),
                                }).catch((e) =>
                                    console.error(
                                        "Lỗi tạo user doc mặc định:",
                                        e,
                                    ),
                                );
                            }
                        },
                        (err) => {
                            console.error("Lỗi User Document Listener:", err);
                        },
                    );

                    return () => {
                        unsubscribeTasks();
                        unsubscribeUser();
                    };
                },

                addTask: async (taskData) => {
                    const email = getActiveEmail();
                    const isDaily =
                        (taskData.repeat &&
                            taskData.repeat !== REPEAT_TYPE.NONE) ||
                        Boolean(taskData.isDaily);
                    const completedAt =
                        taskData.status === TASK_STATUS.DONE
                            ? new Date().toISOString()
                            : undefined;

                    const finalData = {
                        ...taskData,
                        isDaily,
                        completedAt: completedAt || null,
                    };

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const tasksCollectionRef = collection(
                                db,
                                "users",
                                email,
                                "tasks",
                            );
                            await addDoc(tasksCollectionRef, {
                                ...finalData,
                                createdAt: new Date().toISOString(),
                                completedDates: isDaily ? [] : null,
                            });
                        } catch (err) {
                            console.error("Lỗi thêm task lên Firestore:", err);
                        }
                    } else {
                        // LocalStorage fallback mode
                        set((state) => {
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const newTask: Task = {
                                ...finalData,
                                id: generateUniqueId(),
                                createdAt: new Date().toISOString(),
                                completedDates: isDaily ? [] : undefined,
                                completedAt,
                            };

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...account,
                                        tasks: [newTask, ...account.tasks],
                                    },
                                },
                            };
                        });
                    }
                },

                updateTask: async (taskId, updatedFields) => {
                    const email = getActiveEmail();
                    const account = get().accounts[email];
                    const oldTask = account?.tasks.find((t) => t.id === taskId);

                    let isDaily = updatedFields.isDaily;
                    if (updatedFields.repeat !== undefined) {
                        isDaily = updatedFields.repeat !== REPEAT_TYPE.NONE;
                    }

                    let completedAt = oldTask?.completedAt;
                    if (updatedFields.status !== undefined) {
                        if (updatedFields.status === TASK_STATUS.DONE) {
                            completedAt =
                                oldTask?.status !== TASK_STATUS.DONE
                                    ? new Date().toISOString()
                                    : oldTask?.completedAt ||
                                      new Date().toISOString();
                        } else {
                            completedAt = undefined;
                        }
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fieldsToUpdate: any = {
                        ...updatedFields,
                        ...(isDaily !== undefined ? { isDaily } : {}),
                        completedAt: completedAt || null,
                    };

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const taskDocRef = doc(
                                db,
                                "users",
                                email,
                                "tasks",
                                taskId,
                            );
                            await updateDoc(taskDocRef, fieldsToUpdate);
                        } catch (err) {
                            console.error(
                                "Lỗi cập nhật task trên Firestore:",
                                err,
                            );
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const acc = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedTasks = acc.tasks.map((task) => {
                                if (task.id === taskId) {
                                    return {
                                        ...task,
                                        ...updatedFields,
                                        ...(isDaily !== undefined
                                            ? { isDaily }
                                            : {}),
                                        completedAt,
                                    };
                                }
                                return task;
                            });

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...acc,
                                        tasks: updatedTasks,
                                    },
                                },
                            };
                        });
                    }
                },

                deleteTask: async (taskId) => {
                    const email = getActiveEmail();

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const taskDocRef = doc(
                                db,
                                "users",
                                email,
                                "tasks",
                                taskId,
                            );
                            await deleteDoc(taskDocRef);
                        } catch (err) {
                            console.error("Lỗi xóa task trên Firestore:", err);
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedTasks = account.tasks.filter(
                                (t) => t.id !== taskId,
                            );

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...account,
                                        tasks: updatedTasks,
                                    },
                                },
                            };
                        });
                    }
                },

                toggleDailyTaskDate: async (taskId, dateStr) => {
                    const email = getActiveEmail();
                    const account = get().accounts[email] || {
                        ...initialAccountData,
                    };
                    const targetTask = account.tasks.find(
                        (t) => t.id === taskId,
                    );
                    if (!targetTask?.isDaily) return;

                    const dates = targetTask.completedDates || [];
                    const isCompletedOnDate = dates.includes(dateStr);

                    const newDates = isCompletedOnDate
                        ? dates.filter((d) => d !== dateStr) // Bỏ tích
                        : [...dates, dateStr]; // Tích chọn

                    let updatedStatus = targetTask.status;
                    let updatedCompletedAt = targetTask.completedAt;
                    if (dateStr === format(new Date(), DATE_FORMATS.DATE)) {
                        const isNowDone = !isCompletedOnDate;
                        updatedStatus = isNowDone
                            ? TASK_STATUS.DONE
                            : TASK_STATUS.TODO;
                        updatedCompletedAt = isNowDone
                            ? new Date().toISOString()
                            : undefined;
                    }

                    // Tính toán lại Streak động dựa trên lịch sử
                    const dailyTasks = account.tasks
                        .map((t) =>
                            t.id === taskId
                                ? {
                                      ...t,
                                      completedDates: newDates,
                                      status: updatedStatus,
                                      completedAt: updatedCompletedAt,
                                  }
                                : t,
                        )
                        .filter((t) => t.isDaily);

                    const newStreak = calculateStreak(
                        dailyTasks,
                        account.streak.bestStreak,
                        account.streak.lastCompletedDate,
                    );

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const taskDocRef = doc(
                                db,
                                "users",
                                email,
                                "tasks",
                                taskId,
                            );
                            const userDocRef = doc(db, "users", email);

                            const batch = writeBatch(db);
                            batch.update(taskDocRef, {
                                completedDates: newDates,
                                status: updatedStatus,
                            });
                            batch.update(userDocRef, {
                                streak: newStreak,
                                updatedAt: new Date().toISOString(),
                            });

                            await batch.commit();
                        } catch (err) {
                            console.error(
                                "Lỗi toggle daily task trên Firestore:",
                                err,
                            );
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const acc = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedTasks = acc.tasks.map((task) => {
                                if (task.id === taskId) {
                                    return {
                                        ...task,
                                        completedDates: newDates,
                                        status: updatedStatus,
                                    };
                                }
                                return task;
                            });

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...acc,
                                        tasks: updatedTasks,
                                        streak: newStreak,
                                    },
                                },
                            };
                        });
                    }

                    // Kiểm tra gửi thông báo hoàn thành mục tiêu ngày
                    const updatedAccount = get().getCurrentAccount();
                    const activeDailyTasks = updatedAccount.tasks.filter(
                        (t) => t.isDaily,
                    );
                    const completedDailyCount = activeDailyTasks.filter((t) =>
                        t.completedDates?.includes(dateStr),
                    ).length;

                    if (
                        activeDailyTasks.length > 0 &&
                        completedDailyCount === activeDailyTasks.length
                    ) {
                        get().addNotification(
                            i18n.t("notifications.dailyGoalCompletedTitle"),
                            i18n.t("notifications.dailyGoalCompletedMessage", {
                                count: activeDailyTasks.length,
                                streak: newStreak.currentStreak,
                            }),
                            NOTIFICATION_TYPE.SUCCESS,
                        );
                    }
                },

                addNotification: async (title, message, type) => {
                    const email = getActiveEmail();

                    // Gửi Desktop Notification của trình duyệt nếu đã được cấp quyền
                    if (
                        typeof window !== "undefined" &&
                        "Notification" in window
                    ) {
                        if (Notification.permission === "granted") {
                            new Notification(title, { body: message });
                        }
                    }

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const userDocRef = doc(db, "users", email);
                            const account = get().accounts[email];
                            const newNotification = {
                                id: generateUniqueId(),
                                title,
                                message,
                                type,
                                read: false,
                                createdAt: new Date().toISOString(),
                            };

                            const updatedNotifications = [
                                newNotification,
                                ...(account?.notifications || []),
                            ].slice(0, 50); // Lưu tối đa 50 thông báo gần nhất

                            await updateDoc(userDocRef, {
                                notifications: updatedNotifications,
                            });
                        } catch (err) {
                            console.error(
                                "Lỗi gửi notification lên Firestore:",
                                err,
                            );
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const newNotification: Notification = {
                                id: generateUniqueId(),
                                title,
                                message,
                                type,
                                read: false,
                                createdAt: new Date().toISOString(),
                            };

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...account,
                                        notifications: [
                                            newNotification,
                                            ...account.notifications,
                                        ].slice(0, 50),
                                    },
                                },
                            };
                        });
                    }
                },

                markNotificationAsRead: async (notificationId) => {
                    const email = getActiveEmail();

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const userDocRef = doc(db, "users", email);
                            const account = get().accounts[email];
                            const updatedNotifications = (
                                account?.notifications || []
                            ).map((n) =>
                                n.id === notificationId
                                    ? { ...n, read: true }
                                    : n,
                            );

                            await updateDoc(userDocRef, {
                                notifications: updatedNotifications,
                            });
                        } catch (err) {
                            console.error(
                                "Lỗi đánh dấu notification đã đọc trên Firestore:",
                                err,
                            );
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedNotifications =
                                account.notifications.map((n) =>
                                    n.id === notificationId
                                        ? { ...n, read: true }
                                        : n,
                                );

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...account,
                                        notifications: updatedNotifications,
                                    },
                                },
                            };
                        });
                    }
                },

                markAllNotificationsAsRead: async () => {
                    const email = getActiveEmail();

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const userDocRef = doc(db, "users", email);
                            const account = get().accounts[email];
                            const updatedNotifications = (
                                account?.notifications || []
                            ).map((n) => ({ ...n, read: true }));

                            await updateDoc(userDocRef, {
                                notifications: updatedNotifications,
                            });
                        } catch (err) {
                            console.error(
                                "Lỗi đánh dấu tất cả notifications đã đọc trên Firestore:",
                                err,
                            );
                        }
                    } else {
                        // Local fallback
                        set((state) => {
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedNotifications =
                                account.notifications.map((n) => ({
                                    ...n,
                                    read: true,
                                }));

                            return {
                                accounts: {
                                    ...state.accounts,
                                    [email]: {
                                        ...account,
                                        notifications: updatedNotifications,
                                    },
                                },
                            };
                        });
                    }
                },

                checkAndUpdateSystemState: async () => {
                    const email = getActiveEmail();
                    const account = get().accounts[email];
                    if (!account) return;

                    // 1. Kiểm tra các task thường trễ hạn chót (Overdue)
                    const todayStr = format(new Date(), DATE_FORMATS.DATE);
                    const overdueTasks = account.tasks.filter(
                        (t) =>
                            !t.isDaily &&
                            t.status !== TASK_STATUS.DONE &&
                            t.dueDate < todayStr,
                    );

                    if (overdueTasks.length > 0) {
                        const hasOverdueNotifToday = account.notifications.some(
                            (n) =>
                                n.type === NOTIFICATION_TYPE.OVERDUE &&
                                n.createdAt.startsWith(todayStr),
                        );
                        if (!hasOverdueNotifToday) {
                            get().addNotification(
                                i18n.t("notifications.overdueTitle"),
                                i18n.t("notifications.overdueMessage", {
                                    count: overdueTasks.length,
                                }),
                                NOTIFICATION_TYPE.OVERDUE,
                            );
                        }
                    }

                    // 2. Kiểm tra đứt streak daily goals
                    await handleStreakBreak(
                        email,
                        account,
                        set,
                        get().addNotification,
                    );
                },
            };
        },
        {
            name: "my-task-app-storage",
            partialize: (state) => ({
                // Chỉ lưu thông tin user và accounts giả lập trong LocalStorage
                // Khi dùng Firebase, dữ liệu thật của tài khoản Firestore sẽ do listeners Firestore lo
                user: state.user,
                accounts: state.accounts,
            }),
        },
    ),
);
