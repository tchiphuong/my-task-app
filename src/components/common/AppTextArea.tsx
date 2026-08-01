"use client";

import {
    TextArea as HeroTextArea,
    TextAreaProps as HeroTextAreaProps,
} from "@heroui/react";

export type AppTextAreaProps = HeroTextAreaProps;

export function AppTextArea({
    variant = "secondary",
    ...props
}: Readonly<AppTextAreaProps>) {
    return <HeroTextArea variant={variant} {...props} />;
}
