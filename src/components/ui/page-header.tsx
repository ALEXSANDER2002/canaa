export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line/70 pb-6">
      <div>
        <h1 className="text-3xl text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
