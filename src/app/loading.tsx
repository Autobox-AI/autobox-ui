import { Skeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="flex h-screen">
      <div className="w-[var(--sidebar-width-icon)] md:w-[220px] border-r border-zinc-800">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-[150px]" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-[120px]" />
            ))}
          </div>
        </div>
      </div>
      <main className="flex-1">
        <Skeleton className="h-screen w-full" />
      </main>
    </div>
  )
}
