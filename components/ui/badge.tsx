import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] transition",
  {
    variants: {
      variant: {
        default: "bg-sky-500/20 text-sky-300",
        secondary: "bg-white/10 text-slate-200",
        success: "bg-emerald-500/20 text-emerald-300",
        warning: "bg-amber-500/20 text-amber-300",
        destructive: "bg-red-500/20 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
