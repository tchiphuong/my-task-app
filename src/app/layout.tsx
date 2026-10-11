import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Providers } from "./providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
    title: "My Task App - Quản lý công việc cá nhân",
    description:
        "Ứng dụng quản lý công việc thông minh, theo dõi mục tiêu hàng ngày, chuỗi streak và báo cáo tiến độ chi tiết.",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
            {
                url: "/apple-touch-icon-precomposed.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "My Task App",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="vi"
            className={`${inter.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link
                    rel="apple-touch-icon-precomposed"
                    href="/apple-touch-icon-precomposed.png"
                />
            </head>
            <body className="min-h-full flex flex-col bg-background text-foreground">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
