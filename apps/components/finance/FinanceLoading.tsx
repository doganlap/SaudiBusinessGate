export default function FinanceLoading() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
      ))}
    </div>
  );
}