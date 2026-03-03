import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 bg-[#E0E0E0]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border-2 border-[#121212] bg-white p-5">
            <Skeleton className="h-5 w-28 mb-3 bg-[#E0E0E0]" />
            <Skeleton className="h-4 w-full bg-[#E0E0E0]" />
          </div>
        ))}
      </div>
    </div>
  )
}
