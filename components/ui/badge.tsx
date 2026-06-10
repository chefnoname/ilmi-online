import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        green: "bg-brand-green/15 text-brand-forest",
        yellow: "bg-brand-yellow/20 text-[#8a6400]",
        carbon: "bg-brand-carbon text-white",
        outline: "border border-brand-carbon/20 text-brand-carbon",
        onDark: "bg-white/15 text-white",
      },
    },
    defaultVariants: { variant: "green" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
