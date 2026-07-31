# My Task App

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

A modern, highly responsive task management web application engineered for maximum productivity. Designed with a mobile-first approach and built on a robust architecture, the application seamlessly handles daily habits, priority tasks, and comprehensive performance analytics.

## System Architecture & Tech Stack

- **Core Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript (Strict mode enabled)
- **State Management**: Zustand (with Persist Middleware for Offline-first capabilities)
- **Database & Sync**: Firebase Cloud Firestore (Real-time synchronization)
- **UI Architecture**:
  - **HeroUI** (formerly NextUI) Component Library
  - **Tailwind CSS** for utility-first atomic styling
  - **Framer Motion** for fluid layout transitions and micro-interactions
  - **Lucide React** & **Heroicons** for SVG iconography
- **Charting**: Recharts for performance analytics
- **Date Utility**: date-fns for locale-aware time calculations

## Core Features

- **Task Management (Kanban Board)**: Create, edit, and organize tasks across Todo, In Progress, and Done states. Includes priority flagging and categorization.
- **Daily Habits Tracking**: Maintain consecutive daily streaks with a horizontal 7-day lookback calendar.
- **Real-time Synchronization**: Data changes are instantly pushed to Firestore, ensuring a seamless experience across multiple sessions.
- **Offline Resilience**: Local caching guarantees that the interface remains instantly responsive, gracefully handling network disconnections.
- **Comprehensive Analytics**: A dedicated reporting engine generates 30-day productivity metrics, visualizing task completion rates and habit consistencies, with CSV export capabilities.
- **Responsive Layout Design**: Adheres to a strict "Grid on Desktop, Column on Mobile" responsive paradigm, ensuring optimal screen real estate utilization across all devices.

## Getting Started

### Prerequisites

Ensure you have Node.js (v18.x or later) installed.

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Configure Environment Variables:

Create a `.env.local` file in the project root and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development Server

Run the local development server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the application.

## Copyright

© 2026 tchiphuong. All Rights Reserved.

This software and associated documentation files are the proprietary property of the author. Unauthorized copying, reproduction, modification, or distribution of this software, via any medium, is strictly prohibited.
