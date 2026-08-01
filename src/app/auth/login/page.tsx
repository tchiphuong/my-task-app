"use client";

import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppCard as Card } from "@/components/common/AppCard";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { useTaskStore } from "@/store/useTaskStore";

async function ensureUserDocExists(email: string) {
    if (!isFirebaseConfigured || !db) return;
    try {
        const userDocRef = doc(db, "users", email);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
            await setDoc(
                userDocRef,
                {
                    email,
                    streak: {
                        currentStreak: 0,
                        bestStreak: 0,
                        lastCompletedDate: null,
                    },
                    notifications: [],
                    createdAt: new Date().toISOString(),
                },
                { merge: true },
            );
        }
    } catch (e) {
        console.error("Lỗi khi khởi tạo user document:", e);
    }
}

export default function LoginPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isZaloOrFb, setIsZaloOrFb] = useState(false);
    const user = useTaskStore((state) => state.user);
    const setUser = useTaskStore((state) => state.setUser);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (user) {
            router.replace("/dashboard");
        }

        if (typeof window !== "undefined") {
            const ua = navigator.userAgent;
            const isMessenger = ua.includes("FBAN") || ua.includes("FBAV");
            const isZalo = ua.includes("Zalo");
            setIsZaloOrFb(isMessenger || isZalo);
        }
    }, [user, router]);

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Spinner size="lg" color="accent" />
            </div>
        );
    }

    const handleGoogleLogin = async () => {
        if (!isFirebaseConfigured || !auth) {
            setErrorMsg(t("auth.errors.system"));
            return;
        }

        setIsLoading(true);
        setErrorMsg("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userResult = result.user;

            if (userResult?.email) {
                const email = userResult.email;

                // Ensure user document exists in Firestore
                await ensureUserDocExists(email);

                setUser({
                    name: userResult.displayName || email.split("@")[0],
                    email: email,
                    picture: userResult.photoURL || "",
                });
                router.replace("/dashboard");
            } else {
                throw new Error("Không lấy được thông tin email từ Google");
            }
        } catch (err: unknown) {
            console.error("Lỗi đăng nhập Google Firebase:", err);
            const firebaseErr = err as { code?: string };
            if (firebaseErr.code === "auth/popup-closed-by-user") {
                setErrorMsg(t("auth.errors.popupClosed"));
            } else {
                setErrorMsg(t("auth.errors.loginFailed"));
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-tr from-primary-500/10 via-background to-secondary-500/10 px-4 relative">
            {isZaloOrFb && (
                <div className="absolute top-4 left-4 right-4 z-50 p-4 rounded-2xl border border-warning-200 bg-warning-50/90 backdrop-blur-md shadow-lg flex gap-3 animate-appearance-in">
                    <Icon
                        icon="lucide:info"
                        className="text-warning-600 text-xl shrink-0 mt-0.5"
                    />
                    <div className="flex flex-col gap-1 text-left">
                        <h4 className="font-semibold text-warning-800 text-sm">
                            {t("auth.inAppBrowserWarningTitle")}
                        </h4>
                        <p
                            className="text-warning-700 text-xs leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: t("auth.inAppBrowserWarningDesc"),
                            }}
                        />
                    </div>
                </div>
            )}

            <Card className="w-full max-w-100 shadow-2xl border border-default-100/50 p-4">
                <Card.Header className="flex flex-col gap-2 items-center justify-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-2">
                        <ClipboardDocumentCheckIcon className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {t("appName")}
                    </h1>
                    <p className="text-default-500 text-xs text-center px-4">
                        {t("auth.appDesc")}
                    </p>
                </Card.Header>

                <Card.Content className="flex flex-col gap-6 py-6">
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-danger-50 border border-danger-100 text-danger text-xs text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <Spinner size="md" color="accent" />
                            <span className="text-xs text-default-500 font-medium">
                                {t("auth.preparing")}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 items-center w-full">
                            {/* Nút Đăng nhập Google thật bằng Firebase Popup */}
                            <Button
                                variant="tertiary"
                                className="w-full"
                                onPress={handleGoogleLogin}
                            >
                                <Icon
                                    icon="devicon:google"
                                    className="text-lg"
                                />
                                {t("auth.googleLogin")}
                            </Button>
                        </div>
                    )}
                </Card.Content>

                <div className="text-center pb-4">
                    <p className="text-2xs text-default-400">
                        {t("auth.syncDesc")}
                    </p>
                </div>
            </Card>
        </div>
    );
}
