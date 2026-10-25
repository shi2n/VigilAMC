import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#0077B6]/30 bg-[#EAF6FF] text-[#0077B6]",
        secondary:
          "border-[#DCE7F2] bg-[#F4F8FB] text-[#023E8A]",
        success:
          "border-[#0E9F6E]/30 bg-emerald-50 text-[#0E9F6E]",
        destructive:
          "border-[#B91C1C]/30 bg-rose-50 text-[#B91C1C]",
        warning:
          "border-amber-300 bg-amber-50 text-amber-800",
        outline: "border-[#DCE7F2] text-slate-700 bg-white",
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
