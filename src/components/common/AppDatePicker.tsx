"use client";

import {
    Calendar,
    DateField,
    DatePicker as HeroDatePicker,
    FieldError,
    Label,
} from "@heroui/react";
import { ReactNode } from "react";

interface AppDatePickerProps extends Omit<
    React.ComponentProps<typeof HeroDatePicker>,
    "children"
> {
    label?: ReactNode;
}

export function AppDatePicker({
    label,
    variant = "secondary",
    ...props
}: AppDatePickerProps & { variant?: "secondary" | "primary" }) {
    return (
        <HeroDatePicker {...props}>
            {label && <Label>{label}</Label>}
            <DateField.Group variant={variant} fullWidth>
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                    <HeroDatePicker.Trigger>
                        <HeroDatePicker.TriggerIndicator />
                    </HeroDatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            <FieldError />
            <HeroDatePicker.Popover>
                <Calendar
                    aria-label={
                        typeof label === "string" ? label : "Select date"
                    }
                >
                    <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                        <Calendar.GridHeader>
                            {(day) => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                            )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                            {({ year }) => (
                                <Calendar.YearPickerCell year={year} />
                            )}
                        </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                </Calendar>
            </HeroDatePicker.Popover>
        </HeroDatePicker>
    );
}
