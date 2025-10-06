import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "muted";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "inline-flex items-center gap-2 rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent",
  muted: "inline-flex items-center gap-2 rounded-full bg-muted/10 px-3 py-1 text-xs font-medium text-muted-foreground",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span ref={ref} className={cn(variants[variant], className)} {...props} />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
