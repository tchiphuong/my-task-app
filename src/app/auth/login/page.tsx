"use client";

import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";
import { Button, Card, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { useTaskStore } from "@/store/useTaskStore";

async function ensureUserDocExists(email: string) {
  if (!isFirebaseConfigured || !db) return;
  try {
    const userDocRef = doc(db, "users", email);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        email,
        streak: { currentStreak: 0, bestStreak: 0, lastCompletedDate: null },
        notifications: [],
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (e) {
    console.error("Lỗi khi khởi tạo user document:", e);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const user = useTaskStore((state) => state.user);
  const setUser = useTaskStore((state) => state.setUser);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (user) {
      router.replace("/dashboard");
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
      setErrorMsg(
        "Hệ thống đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé!"
      );
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
        setErrorMsg("Popup đăng nhập đã bị đóng. Bạn vui lòng thử lại nhé!");
      } else {
        setErrorMsg("Đăng nhập bằng Google thất bại. Bạn vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau nhé!");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-primary-500/10 via-background to-secondary-500/10 px-4">
      <Card className="w-full max-w-100 shadow-2xl border border-default-100/50 p-4">
        <Card.Header className="flex flex-col gap-2 items-center justify-center pt-8 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-2">
            <ClipboardDocumentCheckIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            My Task App
          </h1>
          <p className="text-default-500 text-xs text-center px-4">
            Quản lý công việc thông minh, rèn luyện thói quen mỗi ngày và đo lường tiến độ hiệu quả.
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
              <span className="text-xs text-default-500 font-medium">Đang chuẩn bị không gian làm việc...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center w-full">
              {/* Nút Đăng nhập Google thật bằng Firebase Popup */}
              <Button
                variant="tertiary"
                className="w-full"
                onPress={handleGoogleLogin}
              >
                <Icon icon="devicon:google" className="text-lg" />
                Đăng nhập bằng Google
              </Button>
            </div>
          )}
        </Card.Content>
        
        <div className="text-center pb-4">
          <p className="text-2xs text-default-400">
            Dữ liệu của bạn được đồng bộ an toàn trên nền tảng điện toán đám mây.
          </p>
        </div>
      </Card>
    </div>
  );
}
