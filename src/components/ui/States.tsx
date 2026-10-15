import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, icon, className }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted [&_svg]:size-10" aria-hidden="true">{icon}</div> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="max-w-md text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, description, action, icon, className }: StateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-danger-soft px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? <div className="text-danger [&_svg]:size-10" aria-hidden="true">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-danger">{title}</h3>
      {description ? <p className="max-w-md text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
