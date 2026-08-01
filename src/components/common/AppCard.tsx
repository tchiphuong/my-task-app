import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardBase = ({ children, className, ...props }: AppCardProps) => {
  return (
    <div 
      className={twMerge(
        "rounded-2xl border-2 border-b-6 border-default-200 bg-white dark:bg-zinc-900 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={twMerge("flex flex-col gap-1.5 px-5 pt-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
};
CardHeader.displayName = "AppCard.Header";

const CardContent = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={twMerge("px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
};
CardContent.displayName = "AppCard.Content";

const CardFooter = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={twMerge("flex items-center px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
};
CardFooter.displayName = "AppCard.Footer";

export const AppCard = Object.assign(CardBase, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});


