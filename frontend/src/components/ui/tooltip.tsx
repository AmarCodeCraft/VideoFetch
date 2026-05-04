import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 text-xs font-medium text-surface-200 bg-surface-800 border border-surface-700/50 rounded-lg shadow-glass whitespace-nowrap animate-fade-in",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-800 border-surface-700/50 rotate-45",
              side === "top"
                ? "top-full -mt-1 border-r border-b"
                : "bottom-full -mb-1 border-l border-t"
            )}
          />
        </div>
      )}
    </div>
  );
}

export { Tooltip };
