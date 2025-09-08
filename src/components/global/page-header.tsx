import { memo } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const PageHeader = memo<PageHeaderProps>(
  ({ title, description, children }) => {
    return (
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 min-w-fit">{children}</div>
        )}
      </header>
    );
  }
);

PageHeader.displayName = "PageHeader";
