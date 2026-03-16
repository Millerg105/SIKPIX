import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-cta text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        luxury: "border border-[#39FF14] bg-[#39FF14] text-black font-semibold tracking-[0.15em] uppercase text-xs shadow-[0_0_35px_rgba(57,255,20,0.15)] hover:bg-[#6aff4d] hover:shadow-[0_0_55px_rgba(57,255,20,0.28)] hover:-translate-y-0.5",
        luxuryOutline: "bg-transparent border border-[#39FF14] text-[#39FF14] font-medium tracking-[0.15em] uppercase text-xs hover:bg-[#39FF14]/10 hover:shadow-[0_0_40px_rgba(57,255,20,0.18)]",
        hero: "border border-[#39FF14] bg-[#39FF14] text-black font-semibold tracking-[0.2em] uppercase shadow-[0_0_40px_rgba(57,255,20,0.16)] hover:bg-[#6aff4d] hover:shadow-[0_0_70px_rgba(57,255,20,0.3)] hover:-translate-y-1",
        heroOutline: "bg-transparent border border-[#39FF14] text-[#39FF14] font-medium tracking-[0.2em] uppercase hover:bg-[#39FF14]/10 hover:shadow-[0_0_50px_rgba(57,255,20,0.22)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 px-10 text-sm",
        hero: "h-16 px-12 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
