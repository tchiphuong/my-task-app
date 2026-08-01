"use client";

import { Select as HeroSelect, SelectProps as HeroSelectProps } from "@heroui/react";

export type AppSelectProps<T extends object = object> = HeroSelectProps<T>;

const SelectBase = <T extends object = object>({ variant = "secondary", ...props }: AppSelectProps<T>) => {
  return <HeroSelect variant={variant} {...props} />;
};

export const AppSelect = Object.assign(SelectBase, {
  Trigger: HeroSelect.Trigger,
  Value: HeroSelect.Value,
  Indicator: HeroSelect.Indicator,
  Popover: HeroSelect.Popover,
});
