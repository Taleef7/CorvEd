import { Skeleton } from "@/components/ui/skeleton"

export default function TutorLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 bg-[#E0E0E0]" />
      <div className="border-4 border-[#121212] bg-white p-6">
        <Skeleton className="h-5 w-32 mb-3 bg-[#E0E0E0]" />
        <Skeleton className="h-4 w-48 mb-2 bg-[#E0E0E0]" />
        <Skeleton className="h-4 w-36 bg-[#E0E0E0]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-2 border-[#121212] bg-white p-4">
            <Skeleton className="h-4 w-20 mb-2 bg-[#E0E0E0]" />
            <Skeleton className="h-8 w-12 bg-[#E0E0E0]" />
          </div>
        ))}
      </div>
    </div>
  )
}
