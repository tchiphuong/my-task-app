"use client";

import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface AppProgressBarProps {
  readonly value: number;
  readonly duration?: number; // Thời gian chạy (ms)
  readonly className?: string;
}

export function AppProgressBar({
  value,
  duration = 800,
  className = ""
}: Readonly<AppProgressBarProps>) {
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayPercent;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function: easeOutQuad khớp hoàn toàn với AnimatedNumber
      const easedProgress = progress * (2 - progress);
      const current = startValue + (value - startValue) * easedProgress;

      setDisplayPercent(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayPercent(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration, displayPercent]);

  return (
    <div
      className={twMerge(
        "h-4 w-full bg-default-200/50 rounded-full border-2 border-default-300 relative overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-success border-t-2 border-success-200 rounded-full"
        style={{
          width: `${displayPercent}%`
        }}
      />
    </div>
  );
}
