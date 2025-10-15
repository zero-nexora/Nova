import { memo } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader = memo<PageHeaderProps>(({ title, description }) => {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground sm:text-lg max-w-2xl mb-8">
            {description}
          </p>
        )}
      </div>
    </header>
  );
});

PageHeader.displayName = "PageHeader";
