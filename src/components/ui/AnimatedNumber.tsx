"use client";

import React, { useEffect, useState } from "react";

interface AnimatedNumberProps {
  readonly value: number;
  readonly duration?: number; // Thời gian chạy hiệu ứng (ms)
  readonly formatter?: (val: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 800,
  formatter = (val) => String(Math.round(val))
}: Readonly<AnimatedNumberProps>) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Easing function: easeOutQuad giúp chạy chậm dần về cuối nhìn mượt mà hơn
      const easedProgress = progress * (2 - progress);
      const current = startValue + (value - startValue) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration, displayValue]);

  return <span>{formatter(displayValue)}</span>;
}
