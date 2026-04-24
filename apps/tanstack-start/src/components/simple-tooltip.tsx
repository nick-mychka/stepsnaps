import type * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

interface SimpleTooltipProps {
  content?: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  contentClassName?: string;
}

export function SimpleTooltip({
  content,
  children,
  side,
  contentClassName,
}: SimpleTooltipProps) {
  if (!content) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className={contentClassName}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
