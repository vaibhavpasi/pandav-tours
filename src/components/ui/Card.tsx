import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive = false,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-paper shadow-card",
        interactive && "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
