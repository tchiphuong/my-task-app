import { Card, CardProps } from "@heroui/react";
import { twMerge } from "tailwind-merge";

export const AppCard = (props: CardProps) => {
  return (
    <Card 
      {...props} 
      className={twMerge(
        "shadow-lg shadow-default-100/50 border border-default-200/50 bg-background/50 backdrop-blur-xl transition-all duration-300",
        props.className
      )}
    >
      {props.children}
    </Card>
  );
};

AppCard.Header = Card.Header;
AppCard.Content = Card.Content;
AppCard.Footer = Card.Footer;
