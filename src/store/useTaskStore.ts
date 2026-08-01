"use client";

import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns";
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

import { DATE_FORMATS, NOTIFICATION_TYPE, TASK_STATUS } from "@/constants";
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
    isDaily: boolean;
    completedDates?: string[]; // Dành cho daily tasks: lưu danh sách ngày hoàn thành YYYY-MM-DD
    createdAt: string;
    completedAt?: string;
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

const countCompletedDates = (dailyTasks: Task[]) => {
    const allCompletedDates: { [date: string]: number } = {};
    dailyTasks.forEach((t) => {
        t.completedDates?.forEach((d) => {
            allCompletedDates[d] = (allCompletedDates[d] || 0) + 1;
        });
    });
    return allCompletedDates;
};

const countConsecutiveDays = (
    completedGoalDates: string[],
    startDate: Date,
): number => {
    let streak = 0;
    let checkDate = startDate;
    while (true) {
        const checkStr = format(checkDate, DATE_FORMATS.DATE);
        if (completedGoalDates.includes(checkStr)) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }
    return streak;
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
        const todayStr = format(new Date(), DATE_FORMATS.DATE);
        const yesterdayStr = format(subDays(new Date(), 1), DATE_FORMATS.DATE);

        const allCompletedDates = countCompletedDates(dailyTasks);

        const completedGoalDates = Object.keys(allCompletedDates).filter(
            (d) => allCompletedDates[d] === dailyTasks.length,
        );

        completedGoalDates.sort((a, b) => b.localeCompare(a));

        if (
            completedGoalDates.includes(todayStr) ||
            completedGoalDates.includes(yesterdayStr)
        ) {
            const startDate = completedGoalDates.includes(todayStr)
                ? new Date()
                : subDays(new Date(), 1);
            currentStreak = countConsecutiveDays(completedGoalDates, startDate);
            newLastCompletedDate = completedGoalDates[0];
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
                "Đã ngắt chuỗi mục tiêu!",
                "Chuỗi ngày hoàn thành mục tiêu liên tiếp đã bị reset. Không sao, mình bắt đầu lại chuỗi mới hôm nay nhé!",
                "warning",
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

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const tasksCollectionRef = collection(
                                db,
                                "users",
                                email,
                                "tasks",
                            );
                            await addDoc(tasksCollectionRef, {
                                ...taskData,
                                createdAt: new Date().toISOString(),
                                completedDates: taskData.isDaily ? [] : null,
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
                                ...taskData,
                                id: generateUniqueId(),
                                createdAt: new Date().toISOString(),
                                completedDates: taskData.isDaily
                                    ? []
                                    : undefined,
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

                    if (isFirebaseConfigured && db && email !== "guest") {
                        try {
                            const taskDocRef = doc(
                                db,
                                "users",
                                email,
                                "tasks",
                                taskId,
                            );

                            // Lấy thông tin trạng thái cũ
                            const account = get().accounts[email];
                            const oldTask = account?.tasks.find(
                                (t) => t.id === taskId,
                            );

                            let completedAt: string | null = null;
                            if (updatedFields.status === TASK_STATUS.DONE) {
                                completedAt =
                                    oldTask?.status !== TASK_STATUS.DONE
                                        ? new Date().toISOString()
                                        : oldTask?.completedAt || null;
                            }
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const fieldsToUpdate: any = { ...updatedFields };
                            if (updatedFields.status) {
                                fieldsToUpdate.completedAt = completedAt;
                            }

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
                            const account = state.accounts[email] || {
                                ...initialAccountData,
                            };
                            const updatedTasks = account.tasks.map((task) => {
                                if (task.id === taskId) {
                                    let completedAt: string | undefined =
                                        undefined;
                                    if (
                                        updatedFields.status ===
                                        TASK_STATUS.DONE
                                    ) {
                                        completedAt =
                                            task.status !== TASK_STATUS.DONE
                                                ? new Date().toISOString()
                                                : task.completedAt;
                                    }

                                    return {
                                        ...task,
                                        ...updatedFields,
                                        completedAt,
                                    };
                                }
                                return task;
                            });

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
                    if (dateStr === format(new Date(), DATE_FORMATS.DATE)) {
                        updatedStatus = !isCompletedOnDate
                            ? TASK_STATUS.DONE
                            : TASK_STATUS.TODO;
                    }

                    // Tính toán lại Streak động dựa trên lịch sử
                    const dailyTasks = account.tasks
                        .map((t) =>
                            t.id === taskId
                                ? {
                                      ...t,
                                      completedDates: newDates,
                                      status: updatedStatus,
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
