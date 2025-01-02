import React, { forwardRef } from "react";
import { cn } from "@/app/lib/utils"; // Utility function for conditional classNames, adjust the path if necessary.

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";
