"use client";

import { Input as HeroInput, InputProps as HeroInputProps } from "@heroui/react";

export type AppInputProps = HeroInputProps;

export function AppInput({ variant = "secondary", ...props }: Readonly<AppInputProps>) {
  return <HeroInput variant={variant} {...props} />;
}
