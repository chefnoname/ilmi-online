import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Brand buttons. Primary CTA = Signal Yellow pill (reserved, high-impact).
 * Pill radius per brand spec; Inter SemiBold labels.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Yellow CTA — use sparingly (Get Started / Subscribe / key actions)
        cta: "bg-brand-yellow text-brand-carbon hover:bg-[#e3aa15] shadow-sm",
        // Green primary surface button
        primary: "bg-brand-green text-white hover:bg-[#46a449]",
        // Forest secondary
        secondary: "bg-brand-forest text-white hover:bg-[#2f7259]",
        outline: "border-2 border-brand-carbon/15 bg-white text-brand-carbon hover:border-brand-green hover:text-brand-green",
        // For use on dark/green surfaces
        ghostOnDark: "border-2 border-white/40 text-white hover:bg-white/10",
        ghost: "text-brand-carbon hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
