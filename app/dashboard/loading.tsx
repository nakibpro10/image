import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="glass-panel rounded-3xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-44 rounded-xl bg-white/10 dark:bg-white/5" />
              <Skeleton className="h-4 w-64 rounded-lg bg-white/10 dark:bg-white/5" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-28 rounded-2xl bg-white/10 dark:bg-white/5" />
              <Skeleton className="h-11 w-11 rounded-2xl bg-white/10 dark:bg-white/5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="glass-panel rounded-3xl p-8 lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48 rounded-xl bg-white/10 dark:bg-white/5" />
            <Skeleton className="h-4 w-72 rounded-lg bg-white/10 dark:bg-white/5" />
            <Skeleton className="h-36 w-full rounded-3xl bg-white/8 dark:bg-white/5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-2xl bg-white/10 dark:bg-white/5" />
              <Skeleton className="h-12 w-full rounded-2xl bg-white/10 dark:bg-white/5" />
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 space-y-4">
            <Skeleton className="h-6 w-32 rounded-xl bg-white/10 dark:bg-white/5" />
            <Skeleton className="h-24 w-full rounded-3xl bg-white/8 dark:bg-white/5" />
            <Skeleton className="h-10 w-full rounded-2xl bg-white/10 dark:bg-white/5" />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-36 rounded-xl bg-white/10 dark:bg-white/5" />
            <Skeleton className="h-10 w-28 rounded-2xl bg-white/10 dark:bg-white/5" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-card rounded-3xl p-4 space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl bg-white/10 dark:bg-white/5" />
                <Skeleton className="h-4 w-3/4 rounded-lg bg-white/10 dark:bg-white/5" />
                <Skeleton className="h-3 w-1/2 rounded-lg bg-white/10 dark:bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
