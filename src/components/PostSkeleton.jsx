export default function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-4 mb-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-3.5 w-4/5 bg-gray-200 dark:bg-white/10 rounded" />
      </div>
      <div className="mt-4 h-56 w-full bg-gray-200 dark:bg-white/10 rounded-xl" />
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 dark:border-hive-border">
        <div className="h-3.5 w-10 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-3.5 w-10 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-3.5 w-10 bg-gray-200 dark:bg-white/10 rounded" />
      </div>
    </div>
  );
}
