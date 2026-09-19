export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-[var(--radius-chip)] bg-plum-100" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-[var(--radius-card)] bg-plum-100/60" />
        ))}
      </div>
    </div>
  );
}
