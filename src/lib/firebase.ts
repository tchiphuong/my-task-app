import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth, GoogleAuthProvider } from "firebase/auth";
import {
    type Firestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Kiểm tra xem cấu hình có hợp lệ và không chứa các giá trị placeholder mẫu không
export const isFirebaseConfigured =
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId !== "your_project_id_here";

let tempApp: FirebaseApp | null = null;
let tempAuth: Auth | null = null;
let tempDb: Firestore | null = null;
const googleProvider = new GoogleAuthProvider();

// Chỉ khởi tạo Firebase trên client-side và khi cấu hình hợp lệ
if (typeof window !== "undefined" && isFirebaseConfigured) {
    try {
        tempApp =
            getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

        // Khởi tạo Firestore với tính năng Offline Persistence thế hệ mới của Firebase SDK v10+
        tempDb = initializeFirestore(tempApp, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            }),
        });

        tempAuth = getAuth(tempApp);

        console.log(
            "Firebase đã được kết nối và kích hoạt bộ nhớ đệm offline (IndexedDB) thành công!",
        );
    } catch (error) {
        console.error("Lỗi khi khởi tạo Firebase:", error);
    }
} else if (typeof window !== "undefined") {
    console.warn(
        "Firebase chưa được cấu hình biến môi trường thật trong file .env.local. Ứng dụng sẽ tự động chuyển sang chế độ giả lập lưu trữ Offline (LocalStorage fallback).",
    );
}

export const app = tempApp;
export const auth = tempAuth;
export const db = tempDb;
export { googleProvider };
