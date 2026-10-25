"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-[#FED7AA] group-[.toaster]:shadow-[0_8px_24px_rgba(232, 89, 12,0.14)] group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-slate-600",
          actionButton:
            "group-[.toast]:bg-[#C2410C] group-[.toast]:text-white font-semibold",
          cancelButton:
            "group-[.toast]:bg-[#FFF8F2] group-[.toast]:text-slate-600",
          success:
            "group-[.toaster]:!bg-white group-[.toaster]:!border-[#0E9F6E]/40 group-[.toaster]:!text-[#0E9F6E]",
          error:
            "group-[.toaster]:!bg-white group-[.toaster]:!border-[#B91C1C]/40 group-[.toaster]:!text-[#B91C1C]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
