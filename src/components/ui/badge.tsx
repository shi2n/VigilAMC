import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#C2410C]/30 bg-[#FFF0E6] text-[#C2410C]",
        secondary:
          "border-[#FED7AA] bg-[#FFF8F2] text-[#1C1917]",
        success:
          "border-[#0E9F6E]/30 bg-emerald-50 text-[#0E9F6E]",
        destructive:
          "border-[#B91C1C]/30 bg-rose-50 text-[#B91C1C]",
        warning:
          "border-amber-300 bg-amber-50 text-amber-800",
        outline: "border-[#FED7AA] text-slate-700 bg-white",
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
