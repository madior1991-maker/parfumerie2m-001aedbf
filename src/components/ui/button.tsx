import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full font-body text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-btn hover:scale-[1.02] hover:bg-accent-hover hover:shadow-btn",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-accent bg-transparent text-accent hover:bg-accent-muted hover:text-accent",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:border-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        whatsapp:
          "bg-whatsapp text-primary-foreground shadow-btn hover:scale-[1.02] hover:bg-whatsapp-hover whatsapp-pulse pulse-glow-only",
        luxe: "border border-border bg-surface text-foreground shadow-card hover:-translate-y-1 hover:border-accent hover:bg-surface-alt hover:shadow-green",
        green: "border border-accent/30 bg-accent-muted text-accent hover:bg-accent/10 hover:border-accent",
      },
      size: {
        default: "h-auto min-h-12 max-w-full whitespace-normal px-5 py-3 text-center leading-snug",
        sm: "h-11 px-4 text-xs",
        lg: "h-auto min-h-14 max-w-full whitespace-normal px-6 py-3 text-center leading-snug sm:px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
