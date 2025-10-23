import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonLoader = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
