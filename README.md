# My Task App

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HeroUI](https://img.shields.io/badge/HeroUI-v3-000000?style=for-the-badge&logo=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

A modern, highly responsive task and habit management web application engineered for maximum personal productivity. Built with a mobile-first philosophy on cutting-edge web technologies, the platform provides instant responses, real-time synchronization, and AI-assisted task ingestion.

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Quick Task Ingestion

- **Natural Language Parsing**: Type intuitive sentences or quick voice notes (e.g., _"Meeting with client tomorrow at 9 AM high priority"_), and the system automatically extracts title, description, start date, due date, priority flag, category, and tags.
- **Dual-Engine Architecture**: Powered by Google Gemini AI backed by a smart, resilient Local NLP Heuristic Parser fallback, guaranteeing 100% ingestion reliability even during network degradation or rate limits.
- **Dynamic AI Visual Feedback**: Interactive glowing border beam animations during real-time AI parsing and analysis.

### 2. 📋 Comprehensive Task Management

- **Status Lifecycle**: Clear tracking across Todo, In Progress, Overdue, and Completed states.
- **Dynamic Filtering & Search**: Instant filtering by priority (Urgent, High, Medium, Low), custom categories, and completion state.
- **Zero-Latency Optimistic Updates**: Instant UI transitions with automatic background synchronization to Firebase Firestore.

### 3. 🎯 Daily Habits Tracker

- **Habit Consistency**: Dedicated management for daily recurring routines and habits.
- **Consecutive Streak Counter**: Encourages consistency with real-time streak badges.
- **7-Day Lookback Calendar**: Visual weekly history indicators for quick glance status checking.

### 4. 📊 Performance Analytics & Reporting

- **Real-Time Productivity Metrics**: Track completion rates, task volumes, and habit adherence over time.
- **30-Day Trend Visualizations**: Responsive, interactive trend charts powered by Recharts.
- **Multi-Format Export**: Export detailed productivity records directly to **Excel (.xlsx)** and **PDF (.pdf)** formats.

### 5. ☁️ Real-Time Cloud Sync & Security

- **Authentication**: Seamless sign-in with Google OAuth and Firebase Authentication.
- **Multi-Device Sync**: Real-time two-way synchronization powered by Firebase Cloud Firestore.
- **Offline Resilience**: Local caching via Zustand Persist ensures lightning-fast performance and offline usability.

### 6. 🎨 Mobile-First Liquid Glass Design

- Built on top of **HeroUI v3**, **Tailwind CSS v4**, and **Framer Motion**.
- Elegant Liquid Glassmorphism styling with seamless Light/Dark mode transitions.
- Native App-like navigation and bottom dock designed specifically for mobile touch ergonomics.

---

## 🛠️ System Architecture & Tech Stack

| Layer                | Technologies                                       |
| :------------------- | :------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, Turbopack, React Compiler) |
| **UI Library**       | React 19, HeroUI v3                                |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion                     |
| **Icons**            | Lucide React, Heroicons, Iconify                   |
| **State Management** | Zustand (with Persist Middleware)                  |
| **Database & Auth**  | Firebase Cloud Firestore, Firebase Authentication  |
| **AI Integration**   | Google Gemini API & Smart Local NLP Parser         |
| **Charts & Export**  | Recharts, SheetJS (xlsx), jsPDF                    |
| **Localization**     | i18next, react-i18next                             |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20.x or higher)
- **npm** package manager

### 1. Installation

Clone the repository and install project dependencies:

```bash
npm install
```

### 2. Environment Variables Configuration

Create a `.env.local` file in the project root with your Firebase and Gemini credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server

Start the development server on port 8080:

```bash
npm run dev
```

Open your browser and navigate to: **`http://localhost:8080`**

### 4. Production Build Test

Verify the static export bundle:

```bash
npm run build
```

---

## 📄 License & Copyright

© 2026 tchiphuong. All Rights Reserved.

This software and associated documentation files are the proprietary property of the author. Unauthorized copying, modification, or distribution is strictly prohibited.
