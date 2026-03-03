import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-[#E0E0E0]" />
        <Skeleton className="h-4 w-72 bg-[#E0E0E0]" />
      </div>

      {/* Next session card skeleton */}
      <div className="border-4 border-[#121212] bg-white p-6">
        <Skeleton className="h-5 w-32 mb-3 bg-[#E0E0E0]" />
        <Skeleton className="h-4 w-48 mb-2 bg-[#E0E0E0]" />
        <Skeleton className="h-4 w-36 bg-[#E0E0E0]" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-[#121212] bg-white p-4">
            <Skeleton className="h-4 w-24 mb-2 bg-[#E0E0E0]" />
            <Skeleton className="h-3 w-32 bg-[#E0E0E0]" />
          </div>
        ))}
      </div>

      {/* Request cards skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28 bg-[#E0E0E0]" />
        {[1, 2].map((i) => (
          <div key={i} className="border-4 border-[#121212] bg-white p-5">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-5 w-32 bg-[#E0E0E0]" />
              <Skeleton className="h-5 w-16 bg-[#E0E0E0]" />
            </div>
            <Skeleton className="h-4 w-48 mb-2 bg-[#E0E0E0]" />
            <Skeleton className="h-3 w-36 bg-[#E0E0E0]" />
          </div>
        ))}
      </div>
    </div>
  )
}
